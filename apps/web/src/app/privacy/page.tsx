'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

export default function PrivacyPage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Navbar matching Community Page */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-500">
        <div className="mx-auto px-6 py-3.5 rounded-2xl backdrop-blur-2xl border border-[#F9F9FD]/10 bg-[#0A0A0A]/60 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-6">
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

            <div className="flex items-center gap-4 shrink-0">
              <Link href="/dashboard" className="cursor-target text-sm text-[#F9F9FD]/70 hover:text-[#F9F9FD] transition-colors hidden sm:block">
                Dashboard
              </Link>
              {isAuthenticated ? (
                <>
                  <div className="h-6 w-px bg-[#F9F9FD]/10 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${user?.id}`} className="cursor-target flex items-center gap-3 group/profile">
                      <div className="w-9 h-9 rounded-xl bg-[#8A2BE1]/20 border border-[#8A2BE1]/40 flex items-center justify-center text-[#8A2BE1] text-sm font-bold shadow-lg shadow-[#8A2BE1]/10 group-hover/profile:border-[#8A2BE1] transition-all">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-[#F9F9FD] font-medium hidden sm:block group-hover/profile:text-white transition-colors">{user?.name}</span>
                    </Link>
                    <button
                      onClick={logout}
                      className="cursor-target text-xs text-[#F9F9FD]/50 hover:text-red-400 transition-colors ml-2"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 cyber-cut bg-[#8A2BE1] text-[#F9F9FD] text-sm font-medium hover:-translate-y-0.5 transition-transform"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Transparent Hero Area */}
      <div className="max-w-4xl mx-auto px-6 pt-36 pb-20 text-center relative z-10">
        <div className="text-[#8A2BE1] font-bold text-sm tracking-wider uppercase mb-4">Dokumen Legal</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Kebijakan Privasi
        </h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Terakhir diperbarui: 1 Agustus 2026. Kebijakan ini menjelaskan bagaimana DesignLens memproses data saat Anda menggunakan fitur evaluasi AI, pratinjau langsung, dan forum komunitas.
        </p>
      </div>

      {/* Solid Background Content Area */}
      <div className="flex-1 bg-[#0A0A0A] border-t border-white/5 pt-16 pb-24 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          
          {/* Section 1 */}
          <div>
            <h2 className="text-2xl font-bold text-[#8A2BE1] mb-4">1. Ruang Lingkup</h2>
            <p className="text-white/70 leading-relaxed text-lg mb-4">
              Kebijakan Privasi ini berlaku untuk penggunaan DesignLens sebagai platform evaluasi UI/UX website. Kebijakan ini mencakup tautan (URL) yang Anda masukkan, tangkapan layar yang dihasilkan AI, diskusi komunitas, serta data pengguna dasar yang diperlukan untuk menjalankan layanan.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl font-bold text-[#8A2BE1] mb-4">2. Data yang Diproses</h2>
            <p className="text-white/70 leading-relaxed text-lg mb-4">
              Saat Anda menggunakan DesignLens, kami dapat memproses beberapa jenis data berikut sesuai fitur yang digunakan:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-white/70 text-lg marker:text-[#8A2BE1]">
              <li>Tautan (URL) website yang Anda kirimkan untuk dievaluasi oleh sistem AI kami.</li>
              <li>Tangkapan layar (screenshot) otomatis dari website Anda yang digunakan murni untuk keperluan pemberian skor desain.</li>
              <li>Informasi profil (nama, email) apabila Anda memutuskan untuk membuat akun dan mendaftar di platform kami.</li>
              <li>Teks komentar, opini, dan interaksi Anda jika Anda mempublikasikan evaluasi Anda ke halaman Community.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl font-bold text-[#8A2BE1] mb-4">3. Penggunaan Data</h2>
            <p className="text-white/70 leading-relaxed text-lg mb-4">
              Kami menggunakan data Anda secara eksklusif untuk memberikan hasil analisis yang akurat, menyediakan laporan yang bisa Anda akses di *Dashboard* Anda, serta memfasilitasi interaksi sosial yang aman dan konstruktif di platform ini. Data hasil evaluasi yang tidak dipublikasikan ke Community bersifat **100% rahasia dan privat**.
            </p>
          </div>

          <div className="pt-10 border-t border-white/10 text-center">
            <Link href="/" className="cursor-target inline-flex items-center justify-center px-6 py-3 cyber-cut border border-white/20 text-white hover:border-[#8A2BE1] hover:text-[#8A2BE1] transition-all">
              ← Kembali ke Beranda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
