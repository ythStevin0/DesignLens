/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ScreenshotsService } from '../screenshots/screenshots.service';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

interface AiCategoryResult {
  score: number;
  reasoning: string;
  recommendations: string[];
}

interface AiReviewResult {
  layout: AiCategoryResult;
  typography: AiCategoryResult;
  color: AiCategoryResult;
  navigation: AiCategoryResult;
  cta: AiCategoryResult;
  accessibility: AiCategoryResult;
  overall_recommendation: string;
}

@Injectable()
export class AiReviewService {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly screenshotsService: ScreenshotsService,
  ) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
    // Gunakan model vision secara default jika tidak ada, atau biarkan pakai yang ada di env
    const envModel = this.configService.get<string>('OPENROUTER_MODEL');
    this.model =
      envModel === 'qwen/qwen3-coder:free' || !envModel
        ? 'google/gemma-4-26b-a4b-it:free'
        : envModel;
  }

  async createReview(websiteId: string, userId: string) {
    // Verify website exists and belongs to user
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
      include: { screenshots: true, aiReview: true },
    });

    if (!website) {
      throw new NotFoundException('Website tidak ditemukan');
    }

    if (website.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    if (website.aiReview && website.aiReview.status === 'PROCESSING') {
      // throw new BadRequestException('AI Review sedang diproses');
      // Bypass sementara agar user bisa klik ulang saat stuck
    }

    // Create or update AI review record with PROCESSING status
    const aiReview = await this.prisma.aiReview.upsert({
      where: { websiteId },
      create: {
        websiteId,
        status: 'PROCESSING',
      },
      update: {
        status: 'PROCESSING',
        layoutScore: null,
        typographyScore: null,
        colorScore: null,
        navigationScore: null,
        ctaScore: null,
        accessibilityScore: null,
        overallScore: null,
        reasoning: null as any,
        recommendation: null,
      },
    });

    // Process in background (non-blocking)
    void (async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error('AI Review process timed out after 90 seconds')),
            90000,
          ),
        );

        await Promise.race([
          this.processReview(websiteId, website.url, website.description ?? ''),
          timeoutPromise,
        ]);
      } catch (error) {
        console.error(`AI Review failed for website ${websiteId}:`, error);
        try {
          await this.prisma.aiReview.update({
            where: { websiteId },
            data: { status: 'FAILED' },
          });
        } catch (dbError) {
          console.error(
            'Failed to update AI Review status to FAILED in DB:',
            dbError,
          );
        }
      }
    })();

    return {
      message: 'AI Review sedang diproses',
      reviewId: aiReview.id,
      status: 'PROCESSING',
    };
  }

  async getReview(websiteId: string, userId: string) {
    const website = await this.prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      throw new NotFoundException('Website tidak ditemukan');
    }

    if (website.userId !== userId) {
      throw new ForbiddenException(
        'Hasil AI Review hanya bisa dilihat oleh pemilik website',
      );
    }

    const review = await this.prisma.aiReview.findUnique({
      where: { websiteId },
    });

    if (!review) {
      throw new NotFoundException('AI Review belum dibuat');
    }

    return review;
  }

  async resetStuck() {
    const result = await this.prisma.aiReview.updateMany({
      where: { status: 'PROCESSING' },
      data: { status: 'FAILED' },
    });
    return { message: 'Reset done', count: result.count };
  }

  private async processReview(
    websiteId: string,
    url: string | null,
    description: string,
  ) {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    let screenshotPath = '';
    let base64Image = '';

    try {
      // Cek apakah screenshot sudah ada
      const existingScreenshot = await this.prisma.screenshot.findFirst({
        where: { websiteId },
        orderBy: { createdAt: 'desc' },
      });

      if (existingScreenshot) {
        screenshotPath = existingScreenshot.fileUrl;
      } else if (url) {
        // Ambil screenshot jika belum ada dan ada URL
        screenshotPath = await this.screenshotsService.captureScreenshot(
          url,
          websiteId,
        );

        // Simpan path ke db
        await this.prisma.screenshot.create({
          data: {
            websiteId,
            fileUrl: screenshotPath,
          },
        });
      }

      // Baca file jadi base64
      const absoluteDir = path.resolve(
        process.cwd(),
        this.configService.get<string>('SCREENSHOT_DIR') || './screenshots',
      );
      const filename = path.basename(screenshotPath);
      const fullPath = path.join(absoluteDir, filename);

      if (fs.existsSync(fullPath)) {
        const optimizedBuffer = await sharp(fullPath)
          .resize({ width: 1280, withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toBuffer();
        base64Image = optimizedBuffer.toString('base64');
      }
    } catch (error) {
      console.error(`Gagal mengambil screenshot untuk ${url}:`, error);
      // Tetap lanjutkan review meskipun tanpa screenshot jika gagal
    }

    const promptText = this.buildPrompt(url, description);

    // Format pesan multimodal (Vision)
    const userMessageContent: any[] = [{ type: 'text', text: promptText }];

    if (base64Image) {
      userMessageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64Image}`,
        },
      });
    }

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://designlens.id',
          'X-Title': 'DesignLens AI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a professional UI/UX reviewer. Analyze websites and provide structured feedback in JSON format. Always respond with valid JSON only, no markdown formatting.',
            },
            {
              role: 'user',
              content: userMessageContent,
            },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(60000), // Timeout 60 detik agar tidak stuck berjam-jam
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error('OpenRouter Error:', errorText);

      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI model');
    }

    // Parse AI response
    let reviewResult: AiReviewResult;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      reviewResult = JSON.parse(jsonStr.trim());
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Calculate overall score
    const scores = [
      reviewResult.layout?.score ?? 0,
      reviewResult.typography?.score ?? 0,
      reviewResult.color?.score ?? 0,
      reviewResult.navigation?.score ?? 0,
      reviewResult.cta?.score ?? 0,
      reviewResult.accessibility?.score ?? 0,
    ];
    const overallScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );

    // Update review in database
    await this.prisma.aiReview.update({
      where: { websiteId },
      data: {
        status: 'COMPLETED',
        layoutScore: reviewResult.layout?.score ?? 0,
        typographyScore: reviewResult.typography?.score ?? 0,
        colorScore: reviewResult.color?.score ?? 0,
        navigationScore: reviewResult.navigation?.score ?? 0,
        ctaScore: reviewResult.cta?.score ?? 0,
        accessibilityScore: reviewResult.accessibility?.score ?? 0,
        overallScore,
        reasoning: reviewResult as any,
        recommendation: reviewResult.overall_recommendation ?? '',
        modelUsed: this.model,
      },
    });
  }

  private buildPrompt(url: string | null, description: string): string {
    return `Analyze the UI/UX of this website based on the provided screenshot${url ? ' and URL' : ''}:

${url ? `URL: ${url}` : ''}
${description ? `Description: ${description}` : ''}

Evaluate the following categories on a scale of 0-100 and provide detailed feedback:

1. **Layout** - Visual hierarchy, spacing, alignment, grid usage
2. **Typography** - Font choices, readability, sizing, line height
3. **Color** - Color palette, contrast, consistency, accessibility
4. **Navigation** - Menu structure, ease of use, findability
5. **CTA (Call-to-Action)** - Button visibility, wording, placement
6. **Accessibility** - Alt text, contrast ratios, keyboard navigation, semantic HTML

Respond ONLY with valid JSON in this exact format:
{
  "layout": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "typography": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "color": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "navigation": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "cta": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "accessibility": {
    "score": <0-100>,
    "reasoning": "<detailed explanation>",
    "recommendations": ["<suggestion 1>", "<suggestion 2>"]
  },
  "overall_recommendation": "<comprehensive summary and top 3 priority improvements>"
}`;
  }
}
