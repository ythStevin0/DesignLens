'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedCounter from '@/components/AnimatedCounter';
import HowItWorks from '@/components/HowItWorks';
import HeroScrollAnimation from '@/components/HeroScrollAnimation';
// ─── Static Pin Data for Live Preview Section ─────────────────────────────────
const PREVIEW_PINS = [
  { id: 1, xPct: 10, yPct: 8, label: 'Navigation', score: 70, color: '#8A2BE1' },
  { id: 2, xPct: 55, yPct: 28, label: 'Typography', score: 88, color: '#8A2BE1' },
  { id: 3, xPct: 52, yPct: 72, label: 'CTA', score: 45, color: '#8A2BE1' },
  { id: 4, xPct: 88, yPct: 12, label: 'Color', score: 91, color: '#8A2BE1' },
  { id: 5, xPct: 18, yPct: 55, label: 'Accessibility', score: 78, color: '#8A2BE1' },
  { id: 6, xPct: 85, yPct: 70, label: 'Layout', score: 83, color: '#8A2BE1' },
];

const TESTIMONIALS = [
  { id: 1, name: "Budi Santoso", role: "UI Designer", text: "DesignLens sangat membantu saya mengidentifikasi masalah UI yang sering terlewat. Sangat praktis!" },
  { id: 2, name: "Siti Aminah", role: "Frontend Dev", text: "Fitur simulasi scannya luar biasa! Klien saya jadi lebih mudah paham perbaikan yang dibutuhkan." },
  { id: 3, name: "Agus Pratama", role: "Product Manager", text: "Menghemat waktu evaluasi desain hingga 50%. Rekomendasi perbaikannya sangat akurat dan mudah diikuti." },
  { id: 4, name: "Rina Kumala", role: "UX Researcher", text: "Alat yang wajib dimiliki oleh setiap desainer. Evaluasi UI/UX-nya sangat mendetail." },
  { id: 5, name: "Fajar Hidayat", role: "Web Developer", text: "Integrasi dengan alur kerja kami sangat mulus. Tidak perlu lagi menebak-nebak kualitas UI yang dikerjakan." },
  { id: 6, name: "Dimas Anggara", role: "Art Director", text: "UI yang sangat futuristik dan analisisnya sangat membantu tim desain kami dalam iterasi yang cepat!" },
];

// ─── Score Ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64, color }: { score: number; size?: number; color: string }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<'ai' | 'community'>('ai');
  const [activePin, setActivePin] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [scannedPins, setScannedPins] = useState<number[]>(PREVIEW_PINS.map(p => p.id));

  const runSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setScannedPins([]);
    setActivePin(null);
    let current = [] as number[];
    PREVIEW_PINS.forEach((pin, index) => {
      setTimeout(() => {
        current = [...current, pin.id];
        setScannedPins(current);
        setActivePin(pin.id);
        if (index === PREVIEW_PINS.length - 1) {
          setTimeout(() => {
            setSimulating(false);
            setActivePin(null);
          }, 1500);
        }
      }, (index * 800) + 500);
    });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background layers */}
      <div className="fixed inset-0 -z-10 bg-linear-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/60" />

      {/* ═══════════════════════════════ NAVBAR ═══════════════════════════════ */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          scrolled ? 'w-[95%] max-w-6xl' : 'w-[98%] max-w-7xl opacity-90'
        }`}
      >
        <div className={`mx-auto px-6 py-3.5 rounded-2xl backdrop-blur-2xl border border-[#F9F9FD]/10 bg-[#0A0A0A]/60 shadow-2xl shadow-black/50 transition-all duration-500 ${scrolled ? 'bg-[#0A0A0A]/80 border-[#8A2BE1]/20' : ''}`}>
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="cursor-target flex items-center gap-3 group shrink-0">
              <Image 
                src="/logo_DesignLens.png" 
                alt="DesignLens Logo"
                width={40}
                height={40}
                className="object-contain transition-transform duration-300 group-hover:scale-110 shrink-0 mix-blend-screen"
                priority
              />
              <span className="text-2xl font-bold text-[#8A2BE1] hidden sm:block">DesignLens</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {[
                { href: '#features', label: 'Fitur' },
                { href: '#live-preview', label: 'Live Preview' },
                { href: '#how-it-works', label: 'Cara Kerja' },
                { href: '/community', label: 'Komunitas' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="cursor-target px-4 py-2 rounded-xl text-sm font-medium text-[#F9F9FD]/70 hover:text-[#F9F9FD] hover:bg-[#F9F9FD]/5 transition-all duration-300">
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated ? (
                <Link href="/dashboard" className="cursor-target px-5 py-2.5 cyber-cut bg-[#8A2BE1] text-[#F9F9FD] text-sm font-semibold hover:shadow-lg hover:shadow-[#8A2BE1]/40 transition-all duration-300 hover:-translate-y-0.5">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="cursor-target hidden sm:block px-4 py-2.5 cyber-cut text-sm font-medium text-[#F9F9FD]/80 hover:text-[#F9F9FD] hover:bg-[#F9F9FD]/5 transition-all duration-300">
                    Masuk
                  </Link>
                  <Link href="/register" className="cursor-target px-5 py-2.5 cyber-cut bg-[#8A2BE1] text-[#F9F9FD] text-sm font-semibold hover:shadow-lg hover:shadow-[#8A2BE1]/40 transition-all duration-300 hover:-translate-y-0.5 border border-[#F9F9FD]/10">
                    Daftar Gratis
                  </Link>
                </>
              )}
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="cursor-target md:hidden p-2 rounded-xl text-[#F9F9FD]/70 hover:text-[#F9F9FD] hover:bg-[#F9F9FD]/5 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden mt-2 px-6 py-4 rounded-2xl backdrop-blur-2xl bg-[#0A0A0A]/90 border border-[#F9F9FD]/10 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="flex flex-col gap-2">
            {[
              { href: '#features', label: 'Fitur' },
              { href: '#live-preview', label: 'Live Preview' },
              { href: '#how-it-works', label: 'Cara Kerja' },
              { href: '/community', label: 'Komunitas' },
              { href: '/login', label: 'Masuk' },
              { href: '/register', label: 'Daftar Gratis', primary: true },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${item.primary ? 'bg-[#8A2BE1] text-[#F9F9FD] text-center' : 'text-[#F9F9FD]/70 hover:text-[#F9F9FD] hover:bg-[#F9F9FD]/5'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════ HERO ════════════════════════════════ */}
      <HeroScrollAnimation />

      {/* ═══════════════════════════════ PLATFORM STATS ═══════════════════════ */}
      <section className="py-16 px-6 relative overflow-hidden">


        <div className="relative z-10 max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <div className="section-divider" />
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Dipercaya oleh <span className="text-[#8A2BE1]">Developer & Desainer</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Website Dianalisis', target: 1240, suffix: '+', icon: '🌐' },
              { label: 'AI Reviews', target: 987, suffix: '+', icon: '🤖' },
              { label: 'Rata-rata Skor', target: 76, suffix: '/100', icon: '📊' },
              { label: 'Member Komunitas', target: 430, suffix: '+', icon: '👥' },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 100} direction="up">
                <div className="cyber-cut border border-white/10 bg-[#0A0A0A]/60 backdrop-blur-sm p-6 text-center hover:border-[#8A2BE1]/40 hover:bg-[#8A2BE1]/5 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="stat-number">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-text-secondary mt-2">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ FEATURES ════════════════════════════ */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <div className="section-divider" />
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Dua Pendekatan, <span className="text-[#8A2BE1]">Satu Tujuan</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Kombinasi kecerdasan AI dan wisdom of the crowd untuk evaluasi UI/UX yang komprehensif
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row gap-4 h-auto md:h-125">
            {/* AI Review */}
            <div 
              className={`glass-card relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-target cursor-pointer group ${expandedCard === 'ai' ? 'md:w-3/4 grow' : 'md:w-1/4 shrink-0 hover:bg-white/5'}`}
              onClick={() => setExpandedCard('ai')}
            >
              <div className="absolute inset-0 bg-linear-to-br from-brand-500/5 to-brand-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`p-8 w-full h-full flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedCard === 'ai' ? 'items-start' : 'items-center justify-center text-center'}`}>
                <div className={`rounded-2xl bg-linear-to-br from-brand-500 to-brand-400 flex items-center justify-center shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-lg ${expandedCard === 'ai' ? 'w-16 h-16 mb-8' : 'w-20 h-20 mb-4'}`}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={expandedCard === 'ai' ? '' : 'scale-125 transition-transform'}>
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                
                <h3 className={`font-bold text-text-primary whitespace-nowrap transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedCard === 'ai' ? 'text-3xl mb-4' : 'text-xl'}`}>
                  AI Review
                </h3>
                
                <div className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden w-full ${expandedCard === 'ai' ? 'opacity-100 max-h-125' : 'opacity-0 max-h-0 md:max-h-0'}`}>
                  <p className="text-text-secondary leading-relaxed mb-6 text-lg max-w-2xl">
                    AI menganalisis website Anda berdasarkan 6 kategori UI/UX: Layout, Typography, Color, Navigation, CTA, dan Accessibility. Hasil bersifat <strong className="text-text-primary">privat</strong> — hanya Anda yang bisa melihat.
                  </p>
                  <ul className="space-y-4">
                    {['Evaluasi instan dalam detik', 'Skor 0-100 per kategori', 'Rekomendasi perbaikan spesifik', 'Hasil privat & rahasia'].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-text-secondary">
                        <span className="w-6 h-6 rounded-full bg-accent-500/10 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-500"><path d="M20 6L9 17l-5-5" /></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Community Review */}
            <div 
              className={`glass-card relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-target cursor-pointer group ${expandedCard === 'community' ? 'md:w-3/4 grow' : 'md:w-1/4 shrink-0 hover:bg-white/5'}`}
              onClick={() => setExpandedCard('community')}
            >
              <div className="absolute inset-0 bg-linear-to-br from-brand-400/5 to-brand-300/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`p-8 w-full h-full flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedCard === 'community' ? 'items-start' : 'items-center justify-center text-center'}`}>
                <div className={`rounded-2xl bg-linear-to-br from-brand-400 to-brand-300 flex items-center justify-center shrink-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-lg ${expandedCard === 'community' ? 'w-16 h-16 mb-8' : 'w-20 h-20 mb-4'}`}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={expandedCard === 'community' ? '' : 'scale-125 transition-transform'}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                
                <h3 className={`font-bold text-text-primary whitespace-nowrap transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${expandedCard === 'community' ? 'text-3xl mb-4' : 'text-xl'}`}>
                  Community
                </h3>
                
                <div className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden w-full ${expandedCard === 'community' ? 'opacity-100 max-h-125' : 'opacity-0 max-h-0 md:max-h-0'}`}>
                  <p className="text-text-secondary leading-relaxed mb-6 text-lg max-w-2xl">
                    Publikasikan website ke halaman komunitas. Dapatkan feedback <strong className="text-text-primary">independen</strong> dari developer dan desainer lain — tanpa pengaruh hasil AI.
                  </p>
                  <ul className="space-y-4">
                    {['Komentar & diskusi berjenjang', 'Feedback dari praktisi nyata', 'Perspektif user yang beragam', 'Tidak terpengaruh hasil AI'].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-text-secondary">
                        <span className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-teal-500"><path d="M20 6L9 17l-5-5" /></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ LIVE PREVIEW ════════════════════════ */}
      <section id="live-preview" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <div className="section-divider" />
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
                Lihat AI Bekerja
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
                Klik tombol di bawah untuk melihat simulasi bagaimana AI kami menganalisis dan memberi skor pada website secara real-time.
              </p>
              <button
                onClick={runSimulation}
                disabled={simulating}
                className="cursor-target cursor-pointer inline-flex items-center gap-3 px-8 py-3.5 bg-[#8A2BE1] text-[#F9F9FD] font-semibold cyber-cut hover:shadow-[0_0_20px_rgba(138,43,225,0.4)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Jalankan Simulasi Scan
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 opacity-50">
                  <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
                </svg>
              </button>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Browser Mockup */}
            <ScrollReveal direction="left" delay={0}>
              <div className="browser-frame glow-brand shadow-2xl shadow-brand-500/10">
                {/* Title bar */}
                <div className="browser-frame-bar">
                  <span className="browser-dot bg-red-500" />
                  <span className="browser-dot bg-yellow-400" />
                  <span className="browser-dot bg-green-500" />
                  <div className="flex-1 mx-4 h-6 rounded-md bg-white/5 flex items-center px-3 gap-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                    <span className="text-xs text-white/30 truncate">https://example-website.com</span>
                  </div>
                </div>

                {/* Screenshot placeholder with pins */}
                <div className="relative aspect-video bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {/* Simulated website UI */}
                  <div className="absolute inset-0 p-4 flex flex-col gap-3">
                    {/* Navbar sim */}
                    <div className="h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                      <div className="w-16 h-3 bg-brand-500/40 rounded" />
                      <div className="flex-1" />
                      {[1,2,3].map(i => <div key={i} className="w-10 h-2 bg-white/10 rounded" />)}
                      <div className="w-16 h-5 bg-brand-500/30 rounded-md" />
                    </div>
                    {/* Hero sim */}
                    <div className="flex-1 flex flex-col gap-2 items-center justify-center">
                      <div className="w-48 h-4 bg-white/20 rounded" />
                      <div className="w-64 h-7 bg-white/30 rounded" />
                      <div className="w-40 h-4 bg-white/15 rounded" />
                      <div className="flex gap-2 mt-2">
                        <div className="w-20 h-7 bg-brand-500/50 rounded-lg" />
                        <div className="w-20 h-7 bg-white/10 rounded-lg" />
                      </div>
                    </div>
                    {/* Cards sim */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg border border-white/5" />)}
                    </div>
                  </div>

                  {/* Scanner Frame */}
                  {simulating && activePin && (
                    <div
                      className="absolute w-24 h-24 pointer-events-none transition-all duration-700 ease-in-out z-10"
                      style={{
                        left: `${PREVIEW_PINS.find(p => p.id === activePin)?.xPct}%`,
                        top: `${PREVIEW_PINS.find(p => p.id === activePin)?.yPct}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="text-white/70">
                        <path d="M30 15 L15 15 L15 30 M70 15 L85 15 L85 30 M30 85 L15 85 L15 70 M70 85 L85 85 L85 70" stroke="currentColor" strokeWidth="4" />
                        <circle cx="50" cy="50" r="3.5" fill="#fef3c7" />
                      </svg>
                    </div>
                  )}

                  {/* AI Pins */}
                  {PREVIEW_PINS.filter(p => scannedPins.includes(p.id)).map((pin) => (
                    <div
                      key={pin.id}
                      className="pin-wrapper absolute"
                      style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%`, transform: 'translate(-50%,-50%)' }}
                      onMouseEnter={() => setActivePin(pin.id)}
                      onMouseLeave={() => setActivePin(null)}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hover:scale-125"
                        style={{
                          background: pin.color,
                          boxShadow: `0 0 0 3px rgba(0,0,0,0.4), 0 0 12px ${pin.color}60`,
                        }}
                      >
                        {pin.id}
                      </div>
                      <div className="pin-tooltip text-white/90">
                        <span style={{ color: pin.color }} className="font-semibold">{pin.label}</span>
                        <span className="ml-2 text-white/60">Score: {pin.score}/100</span>
                      </div>
                    </div>
                  ))}

                  {/* Overlay label */}
                  {simulating && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm animate-fade-in">
                      <span className="w-2 h-2 rounded-full bg-[#8A2BE1] animate-pulse" />
                      <span className="text-xs text-[#F9F9FD]/70">AI Analyzing…</span>
                    </div>
                  )}
                  {!simulating && scannedPins.length === PREVIEW_PINS.length && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm animate-fade-in">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-[#F9F9FD]/70">Scan Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Score breakdown */}
            <ScrollReveal direction="right" delay={100}>
              <div className="space-y-4">
                <div className="mb-6">
                  <div className="text-xs font-mono text-[#8A2BE1] mb-2 tracking-wider">HASIL EVALUASI AI</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-1">Laporan Detail Per Kategori</h3>
                  <p className="text-text-secondary text-sm">Hover pada pin di screenshot untuk melihat lokasi permasalahan</p>
                </div>

                {PREVIEW_PINS.map((pin) => {
                  const isScanned = scannedPins.includes(pin.id);
                  const currentScore = isScanned ? pin.score : 0;
                  return (
                    <div
                      key={pin.id}
                      className={`glass-card px-4 py-3 flex items-center gap-4 transition-all duration-300 ${activePin === pin.id ? 'border-opacity-60 scale-[1.02]' : ''}`}
                      style={{ borderColor: activePin === pin.id ? pin.color + '60' : undefined }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors duration-500"
                        style={{ background: isScanned ? pin.color : '#333' }}
                      >
                        {pin.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text-primary">{pin.label}</span>
                          <span className="text-sm font-bold transition-colors duration-500" style={{ color: isScanned ? '#8A2BE1' : '#555' }}>
                            {currentScore}/100
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${currentScore}%`, background: pin.color }}
                          />
                        </div>
                      </div>
                      <ScoreRing score={currentScore} size={44} color={isScanned ? pin.color : '#333'} />
                    </div>
                  );
                })}

                {scannedPins.length === PREVIEW_PINS.length && (
                  <div className="glass-card px-5 py-4 border-brand-500/20 mt-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-text-tertiary mb-1">Overall Score</div>
                        <div className="text-3xl font-bold text-[#8A2BE1]">79/100</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-tertiary mb-1">Status</div>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-semibold">Cukup Baik</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS (HORIZONTAL SCROLL) ════ */}
      <HowItWorks />

      {/* ═══════════════════════════════ TESTIMONIALS ════════════════════════ */}
      <section className="py-24 overflow-hidden relative">
        <ScrollReveal direction="up">
          <div className="text-center mb-14 px-6">
            <div className="section-divider" />
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Kata <span className="text-[#8A2BE1]">Orang-Orang</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Lihat apa kata desainer dan developer tentang pengalaman mereka menggunakan DesignLens
            </p>
          </div>
        </ScrollReveal>

        <div className="relative w-full flex items-center mt-8 group">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-r from-[#0d0c14] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-l from-[#0d0c14] to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee-right gap-6 px-6">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <div key={`${t.id}-${idx}`} className="glass-card p-6 w-[320px] md:w-100 shrink-0 hover:border-[#8A2BE1]/40 transition-colors cursor-pointer hover:-translate-y-2 hover:shadow-lg hover:shadow-[#8A2BE1]/20 duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors" style={{ background: '#8A2BE122', color: '#8A2BE1' }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{t.name}</h4>
                    <p className="text-xs text-[#8A2BE1]">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ CTA ══════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal direction="up">
            <div className="glass-card p-12 md:p-16 relative overflow-hidden glow-brand">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#8A2BE1]" />
              {/* BG decorative blobs */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8A2BE1]/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#8A2BE1]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Siap Meningkatkan Kualitas Desain?
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
                  Mulai evaluasi website Anda sekarang — gratis, cepat, dan akurat. Bergabung dengan ratusan developer yang sudah merasakan manfaatnya.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="cursor-target inline-block px-8 py-4 cyber-cut bg-[#8A2BE1] text-[#F9F9FD] font-bold text-lg hover:shadow-2xl hover:shadow-[#8A2BE1]/30 transition-all duration-500 hover:-translate-y-1"
                  >
                    Daftar Gratis Sekarang
                  </Link>
                  <Link
                    href="/community"
                    className="cursor-target inline-block px-8 py-4 cyber-cut border border-border text-text-secondary font-semibold text-lg hover:border-[#8A2BE1]/50 hover:text-[#8A2BE1] transition-all duration-300 backdrop-blur-sm bg-white/5"
                  >
                    Jelajahi Komunitas &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer className="bg-[#0A0A0A] border-t border-border pt-24 pb-8 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-10 mb-24">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="cursor-target flex items-center gap-3 mb-6">
                <div 
                  className="h-11 w-11 bg-[#8A2BE1] transition-transform duration-300 hover:scale-105 shrink-0"
                  style={{
                    WebkitMaskImage: "url('/logo_DesignLens.png')",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskImage: "url('/logo_DesignLens.png')",
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                  }}
                />
                <span className="font-bold text-[#8A2BE1] text-2xl">DesignLens</span>
              </Link>
              <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                Platform evaluasi UI/UX website berbasis AI dan Community Review. Dapatkan feedback desain yang akurat dan actionable.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  { label: 'GitHub', href: 'https://github.com/ythStevin0', path: 'M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.114 2.51.334 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z' },
                ].map((s) => (
                  <a key={s.label} href={s.href || "#"} target={s.href ? "_blank" : undefined} rel={s.href ? "noopener noreferrer" : undefined} aria-label={s.label} className="cursor-target w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-400 hover:border-brand-500/50 transition-all duration-300">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3">
                {[
                  { href: '#features', label: 'Fitur' },
                  { href: '#live-preview', label: 'Live Preview' },
                  { href: '#how-it-works', label: 'Cara Kerja' },
                  { href: '/community', label: 'Komunitas' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="cursor-target text-sm text-white/60 hover:text-brand-400 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Akun</h4>
              <ul className="space-y-3">
                {[
                  { href: '/register', label: 'Daftar Gratis' },
                  { href: '/login', label: 'Masuk' },
                  { href: '/dashboard', label: 'Dashboard' },
                  { href: '/upload', label: 'Upload Website' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="cursor-target text-sm text-white/60 hover:text-brand-400 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">© 2025 DesignLens AI. Platform Evaluasi UI/UX Website.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="cursor-target text-sm text-white/40 hover:text-white/80 transition-colors">Kebijakan Privasi</Link>
              <Link href="/terms" className="cursor-target text-sm text-white/40 hover:text-white/80 transition-colors">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
        
        {/* Massive Background Text */}
        <div className="absolute -bottom-4 md:-bottom-8 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0">
          <span className="text-[20vw] font-black leading-none text-white/3 tracking-tighter">
            DesignLens
          </span>
        </div>
      </footer>
    </div>
  );
}


