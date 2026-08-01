'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    id: 1,
    title: 'Masukkan URL',
    description: 'Cukup tempelkan tautan website atau aplikasi web Anda. Tidak perlu instalasi khusus atau setup berbelit.',
    icon: '🔗',
  },
  {
    id: 2,
    title: 'Evaluasi Instan oleh AI',
    description: 'AI kami akan menelusuri halaman Anda dan menganalisis 6 metrik utama UX/UI dalam hitungan detik.',
    icon: '🤖',
  },
  {
    id: 3,
    title: 'Dapatkan Laporan Detail',
    description: 'Lihat skor komprehensif, temukan titik kelemahan (pain points), dan dapatkan saran perbaikan yang konkret.',
    icon: '📊',
  },
  {
    id: 4,
    title: 'Review dari Komunitas (Opsional)',
    description: 'Bagikan hasil evaluasi ke komunitas kami untuk mendapatkan wawasan tambahan dari desainer dan developer lain.',
    icon: '👥',
  },
  {
    id: 5,
    title: 'Terapkan & Tingkatkan',
    description: 'Terapkan rekomendasi yang diberikan, tingkatkan konversi dan kepuasan pengguna (user experience) Anda!',
    icon: '🚀',
  }
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollWrapperRef.current) return;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        const scrollWidth = scrollWrapperRef.current?.scrollWidth || 0;
        return -(scrollWidth - window.innerWidth);
      };

      gsap.to(scrollWrapperRef.current, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          refreshPriority: -1,
          scrub: true,
          invalidateOnRefresh: true,
          end: () => `+=${scrollWrapperRef.current?.scrollWidth || 0}`,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative bg-[#0A0A0A] text-white"
    >
      <div className="h-screen w-full flex flex-col justify-center">
        {/* Header */}
        <div className="px-[10vw] mb-10 shrink-0">
          <h2 className="text-4xl md:text-6xl font-bold mb-3 leading-tight text-white">
            Cara <span className="text-[#8A2BE1]">Kerja</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Perjalanan singkat untuk mengubah desain yang biasa saja menjadi luar biasa.
            <br />
            <span className="text-[#8A2BE1] font-medium animate-pulse">Scroll ke bawah untuk melanjutkan →</span>
          </p>
        </div>

        {/* Horizontal track */}
        <div
          ref={scrollWrapperRef}
          className="flex flex-row flex-nowrap items-stretch will-change-transform"
          style={{ paddingLeft: '10vw' }}
        >
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="shrink-0 w-[80vw] sm:w-[60vw] md:w-md border-y border-l border-white/10 last:border-r p-8 flex flex-col justify-between hover:bg-white/5 transition-colors duration-300 relative group"
              style={{ minHeight: '20rem' }}
            >
              <span className="absolute bottom-4 right-6 text-6xl font-black text-white/5 select-none pointer-events-none">
                0{step.id}
              </span>

              {index < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#0A0A0A] border border-white/10 items-center justify-center text-[#8A2BE1] text-sm">
                  →
                </div>
              )}

              <div>
                <div className="w-16 h-16 cyber-cut bg-[#8A2BE1] flex items-center justify-center text-3xl mb-8 shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
          <div className="shrink-0 w-[10vw]" />
        </div>
      </div>
    </section>
  );
}
