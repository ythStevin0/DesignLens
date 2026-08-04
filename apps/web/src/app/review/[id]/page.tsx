'use client';

import Link from 'next/link';
import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const SCORE_COLORS: Record<string, string> = {
  layout: 'bg-[#8A2BE1]',
  typography: 'bg-[#8A2BE1]/80',
  color: 'bg-[#8A2BE1]/60',
  navigation: 'bg-[#8A2BE1]',
  cta: 'bg-[#8A2BE1]/80',
  accessibility: 'bg-[#8A2BE1]/60',
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-200" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringAi, setTriggeringAi] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadWebsite = useCallback(async () => {
    try {
      const data = await api.getWebsite(id);
      setWebsite(data);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWebsite();

    // Auto-polling jika AI sedang proses
    let interval: NodeJS.Timeout;
    if (website?.aiReview?.status === 'PROCESSING') {
      interval = setInterval(() => {
        loadWebsite();
      }, 3000); // Poll setiap 3 detik
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, id, website?.aiReview?.status, loadWebsite]);

  const handleTriggerAi = async () => {
    setTriggeringAi(true);
    try {
      await api.triggerAiReview(id);
      setTimeout(loadWebsite, 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTriggeringAi(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.publishToFeed(id);
      loadWebsite();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8A2BE1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!website) return null;

  const review = website.aiReview;
  const scores = review ? [
    { key: 'layout', label: 'Layout', score: review.layoutScore },
    { key: 'typography', label: 'Typography', score: review.typographyScore },
    { key: 'color', label: 'Color', score: review.colorScore },
    { key: 'navigation', label: 'Navigation', score: review.navigationScore },
    { key: 'cta', label: 'CTA', score: review.ctaScore },
    { key: 'accessibility', label: 'Accessibility', score: review.accessibilityScore },
  ] : [];

  const reasoning = review?.reasoning as Record<string, any> | null;

  // Tombol AI Review muncul kalau: belum pernah ada review sama sekali,
  // ATAU review sebelumnya berstatus FAILED (butuh retry), atau sedang PROCESSING tapi stuck.
  const showAiButton = !review || review.status === 'FAILED' || review.status === 'PROCESSING';

  return (
    <div className="min-h-screen text-[#F9F9FD] bg-[#0A0A0A] pt-6 relative">
      {/* Background layer */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#8A2BE1]/10 via-[#0A0A0A] to-[#0A0A0A]" />

      <nav className="sticky top-0 z-50 transition-all duration-500 mb-8 w-[95%] max-w-6xl mx-auto">
        <div className="mx-auto px-6 py-3.5 rounded-2xl backdrop-blur-2xl border border-white/10 bg-[#0A0A0A]/60 shadow-2xl shadow-black/50 flex items-center">
          <Link href="/dashboard" className="cursor-target flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{website.title}</h1>
            <a href={website.url} target="_blank" rel="noopener noreferrer" className="cursor-target text-[#8A2BE1] hover:text-white transition-colors hover:underline text-sm font-medium">
              {website.url} ↗
            </a>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-3 py-1 rounded-full bg-[#8A2BE1]/20 border border-[#8A2BE1]/30 text-[#8A2BE1] text-xs font-semibold">
                {website.category?.name}
              </span>
              {website.description && (
                <span className="text-sm text-white/50 border-l border-white/10 pl-3">{website.description}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {showAiButton && (
              <button
                onClick={handleTriggerAi}
                disabled={triggeringAi}
                className="cursor-target px-5 py-2.5 rounded-xl bg-[#8A2BE1] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#8A2BE1]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {triggeringAi
                  ? 'Processing...'
                  : review?.status === 'FAILED'
                  ? '🔄 Coba Lagi'
                  : '🤖 AI Review'}
              </button>
            )}
            {!website.communityPost && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="cursor-target px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/90 text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? 'Publishing...' : '👥 Publish ke Komunitas'}
              </button>
            )}
          </div>
        </div>

        {/* AI Review Results */}
        {review && review.status === 'COMPLETED' && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <ScoreRing score={review.overallScore ?? 0} size={120} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{review.overallScore}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Overall Score</h2>
                <p className="text-white/70 text-base">
                  {review.overallScore >= 80 ? 'Desain website Anda sudah sangat baik! 🎉' :
                   review.overallScore >= 60 ? 'Cukup baik, ada beberapa area yang bisa ditingkatkan.' :
                   'Masih ada banyak ruang untuk perbaikan.'}
                </p>
                <p className="text-xs text-white/40 mt-3 font-mono">Model: {review.modelUsed}</p>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {scores.map((item) => (
                <div key={item.key} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                  <div className="text-xs text-white/50 mb-2 uppercase tracking-wider font-semibold">{item.label}</div>
                  <div className="text-4xl font-bold text-white mb-4">{item.score ?? '-'}</div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SCORE_COLORS[item.key]} transition-all duration-1000 shadow-[0_0_10px_currentColor]`}
                      style={{ width: `${item.score ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Reasoning */}
            {reasoning && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mt-8 mb-4">Detail Evaluasi</h3>
                {Object.entries(reasoning || {}).map(([key, value]) => {
                  if (key === 'overall_recommendation') return null;
                  const data = value as AiCategoryResult;
                  if (!data?.reasoning) return null;

                  return (
                    <div key={key} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white text-lg capitalize">{key}</h4>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          (data.score ?? 0) >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          (data.score ?? 0) >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {data.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed mb-4">{data.reasoning}</p>
                      {data.recommendations && data.recommendations.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Rekomendasi:</div>
                          <ul className="space-y-2">
                            {data.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                                <span className="text-[#8A2BE1] mt-0.5 shrink-0">✦</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overall Recommendation */}
            {review.recommendation && (
              <div className="p-6 rounded-2xl border border-white/5 bg-[#8A2BE1]/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">💡</span>
                  <h4 className="font-bold text-white text-lg">Rekomendasi Utama</h4>
                </div>
                <p className="text-white/80 leading-relaxed">{review.recommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* Processing State */}
        {review && review.status === 'PROCESSING' && (
          <div className="p-12 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-[#8A2BE1] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_#8A2BE1]" />
            <h2 className="text-2xl font-bold text-white mb-3">AI sedang menganalisis...</h2>
            <p className="text-white/60 mb-6">Mohon tunggu beberapa saat. Halaman akan otomatis diperbarui.</p>
            <button onClick={loadWebsite} className="text-sm text-[#8A2BE1] hover:text-white transition-colors underline underline-offset-4 font-medium cursor-target">
              Refresh Halaman
            </button>
          </div>
        )}

        {/* Failed State */}
        {review && review.status === 'FAILED' && (
          <div className="p-12 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl text-center shadow-2xl">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-3">Proses AI Gagal</h2>
            <p className="text-red-400/70 mb-8 max-w-md mx-auto">Terjadi kesalahan saat memproses review (mungkin API key tidak valid atau website tidak dapat diakses).</p>
            <button onClick={handleTriggerAi} disabled={triggeringAi} className="cursor-target px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold transition-all">
              {triggeringAi ? 'Mencoba lagi...' : 'Coba Lagi'}
            </button>
          </div>
        )}

        {/* No Review */}
        {!review && (
          <div className="p-12 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl text-center shadow-2xl">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-3">Belum ada AI Review</h2>
            <p className="text-white/60">Klik tombol AI Review di atas untuk memulai evaluasi otomatis</p>
          </div>
        )}

        {/* Community Post Link */}
        {website.communityPost?.status === 'PUBLISHED' && (
          <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8A2BE1]/20 flex items-center justify-center text-2xl border border-[#8A2BE1]/30">👥</div>
              <div>
                <div className="font-bold text-white text-lg mb-1">Community Post</div>
                <div className="text-sm text-white/50 font-medium">
                  {website.communityPost._count?.comments ?? 0} komentar diskusi
                </div>
              </div>
            </div>
            <Link
              href={`/community/${website.communityPost.id}`}
              className="cursor-target px-5 py-2.5 rounded-xl border border-[#8A2BE1]/30 bg-[#8A2BE1]/10 text-white font-semibold hover:bg-[#8A2BE1]/20 transition-all text-sm whitespace-nowrap"
            >
              Lihat Diskusi →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

interface AiCategoryResult {
  score: number;
  reasoning: string;
  recommendations: string[];
}
