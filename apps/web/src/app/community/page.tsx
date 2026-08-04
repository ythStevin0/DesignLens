'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

import Image from 'next/image';
export default function CommunityPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [feed, setFeed] = useState<any>({ data: [], meta: { total: 0, page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Search and Filter State
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('Terbaru'); // 'Terbaru', 'Skor Tertinggi', 'Postingan Saya'
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  const filteredFeed = (feed?.data || []).filter((post: any) => {
    const q = searchQuery.toLowerCase();
    const title = post.website?.title?.toLowerCase() || '';
    const url = post.website?.url?.toLowerCase() || '';
    const author = post.website?.user?.name?.toLowerCase() || '';
    const matchesSearch = title.includes(q) || url.includes(q) || author.includes(q);
    
    if (filterMode === 'Postingan Saya') {
      return matchesSearch && post.website?.user?.id === user?.id;
    }
    return matchesSearch;
  }).sort((a: any, b: any) => {
    if (filterMode === 'Skor Tertinggi') {
      const scoreA = a.website?.scores?.[0]?.overallScore || 0;
      const scoreB = b.website?.scores?.[0]?.overallScore || 0;
      return scoreB - scoreA;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityFeed(page);
      setFeed(data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFeed();
  }, [loadFeed]);

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      {/* Navbar matching Landing Page */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-500">
        <div className="mx-auto px-6 py-3.5 rounded-2xl backdrop-blur-2xl border border-[#F9F9FD]/10 bg-[#0A0A0A]/60 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" data-cursor-target="true" className="cursor-target flex items-center gap-3 group shrink-0">
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
              <Link href="/dashboard" data-cursor-target="true" className="cursor-target text-sm text-[#F9F9FD]/70 hover:text-[#F9F9FD] transition-colors hidden sm:block">
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

      {/* Transparent Hero Area (shows Dither) */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex justify-center">
          Community Feed
        </h1>
        <p className="text-white/60 text-lg">Berikan feedback untuk desain website yang dipublikasikan</p>
      </div>

      {/* Solid Background Content Area (like Footer/HowItWorks) */}
      <div className="flex-1 bg-[#0A0A0A] border-t border-white/5 pt-12 pb-24 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto px-6">

        {/* Mobile App Style Header */}
        <div className="flex items-center justify-between mb-8 relative">
          {isSearchActive ? (
            <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2 border border-[#8A2BE1]/50 shadow-[0_0_15px_rgba(138,43,225,0.3)] mr-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A2BE1] shrink-0 mr-2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari website atau user..."
                className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/40 text-sm"
              />
              <button onClick={() => { setIsSearchActive(false); setSearchQuery(''); }} className="text-white/50 hover:text-white ml-2 shrink-0">
                ✕
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold text-white tracking-wide">{user?.name || 'Community'}</h2>
          )}

          <div className="flex items-center gap-5 text-white shrink-0">
            {!isSearchActive && (
              <button 
                onClick={() => setIsSearchActive(true)}
                data-cursor-target="true" 
                className="cursor-target hover:text-white/70 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                data-cursor-target="true" 
                className="cursor-target hover:text-white/70 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="19" cy="12" r="1" fill="currentColor" />
                  <circle cx="5" cy="12" r="1" fill="currentColor" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-30 flex flex-col py-2">
                  {['Terbaru', 'Skor Tertinggi', 'Postingan Saya'].map(option => (
                    <button
                      key={option}
                      className={`text-left px-4 py-2 text-sm transition-colors ${filterMode === option ? 'text-[#8A2BE1] font-bold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                      onClick={() => {
                        setFilterMode(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option === 'Terbaru' && '🕒 '}
                      {option === 'Skor Tertinggi' && '⭐️ '}
                      {option === 'Postingan Saya' && '👤 '}
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#8A2BE1] border-t-transparent cyber-cut-sm animate-spin" />
          </div>
        ) : feed.data.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Belum ada postingan</h2>
            <p className="text-text-secondary">Jadilah yang pertama mempublikasikan website untuk mendapatkan feedback!</p>
          </div>
        ) : (
          <div className="flex flex-col rounded-3xl border border-border overflow-hidden bg-surface-100/20 backdrop-blur-md">
            {filteredFeed.length === 0 ? (
              <div className="p-8 text-center text-white/50">Tidak ada hasil yang cocok.</div>
            ) : filteredFeed.map((post: any, index: number) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                data-cursor-target="true"
                className={`cursor-target p-6 hover:bg-white/5 transition-colors group ${
                  index !== feed.data.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 cyber-cut-sm bg-[#8A2BE1] flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                        {post.website?.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-text-primary">{post.website?.user?.name}</span>
                        <span className="text-xs text-text-tertiary ml-2">
                          {new Date(post.publishedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-text-primary group-hover:text-[#C5ABF2] transition-colors mb-1">
                      {post.website?.title}
                    </h3>
                    <span className="text-sm text-[#C5ABF2] truncate block">{post.website?.url}</span>

                    {post.website?.description && (
                      <p className="text-sm text-text-secondary mt-3 line-clamp-3 leading-relaxed">{post.website.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                      <span className="px-3 py-1 cyber-cut-sm bg-[#8A2BE1]/10 text-[#C5ABF2] text-xs font-semibold">
                        {post.website?.category?.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-text-tertiary font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        {post._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {feed.meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 cyber-cut border border-border text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
            >
              ← Sebelumnya
            </button>
            <span className="text-sm text-text-tertiary">
              {page} / {feed.meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(feed.meta.totalPages, p + 1))}
              disabled={page === feed.meta.totalPages}
              className="px-4 py-2 cyber-cut border border-border text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
