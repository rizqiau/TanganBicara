import { useState, useRef } from 'react';
import { VOCABULARY, CATEGORIES, getCategoryForWord } from '@/lib/ml/vocabulary';
import { Link } from 'react-router-dom';

/** Maps a vocab word to its video filename in /kosakata/ */
function getVideoPath(word: string): string {
  // Filename format: {Word}-a-1.mp4 (first char uppercase, rest as-is)
  return `/kosakata/${word}-a-1.mp4`;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [activeLetter, setActiveLetter] = useState<string>('Semua');
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedCategory = selectedWord ? getCategoryForWord(selectedWord) : null;

  const filteredWords = VOCABULARY.filter((word) => {
    const matchSearch = word.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === 'Semua' || getCategoryForWord(word)?.name === activeCategory;
    const matchLetter = activeLetter === 'Semua' || word.toUpperCase().startsWith(activeLetter);
    return matchSearch && matchCat && matchLetter;
  });

  const handleSelectWord = (word: string) => {
    setSelectedWord(word);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  // Letters that have at least one word
  const availableLetters = ALPHABET.filter((l) =>
    VOCABULARY.some((w) => w.toUpperCase().startsWith(l))
  );

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingTop: '4rem' }}>

      {/* ── PAGE HEADER ── */}
      <section style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '2rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
            <span>Beranda</span>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#374151' }}>Kamus</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Kamus Bahasa Isyarat</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '36rem' }}>
            Telusuri dan cari {VOCABULARY.length} kata bahasa isyarat Indonesia (BISINDO). Klik entri mana saja untuk melihat video demonstrasinya.
          </p>
        </div>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: '15rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Categories */}
          <div>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Kategori</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', fontSize: '0.875rem' }}>
              {[{ name: 'Semua', count: VOCABULARY.length }, ...CATEGORIES.map(c => ({ name: c.name, count: c.words.length }))].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                    background: activeCategory === cat.name ? '#111827' : 'transparent',
                    color: activeCategory === cat.name ? '#ffffff' : '#374151',
                    textAlign: 'left', width: '100%', transition: 'all 0.1s ease',
                  }}
                  onMouseOver={e => { if (activeCategory !== cat.name) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseOut={e => { if (activeCategory !== cat.name) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{cat.name}</span>
                  <span style={{ fontSize: '0.7rem', background: activeCategory === cat.name ? '#374151' : 'transparent', color: activeCategory === cat.name ? '#d1d5db' : '#9ca3af', borderRadius: '9999px', padding: '0 0.4rem' }}>{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Urutkan</h3>
            <select
              style={{ width: '100%', fontSize: '0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#374151', background: '#ffffff', outline: 'none' }}
            >
              <option>A – Z</option>
              <option>Z – A</option>
            </select>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Search + Result bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.6rem 1rem', gap: '0.75rem', background: '#ffffff' }}>
              <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Cari kata atau frasa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#374151', width: '100%' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{filteredWords.length} hasil ditemukan</div>
          </div>

          {/* Alphabet quick-filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {['Semua', ...availableLetters].map((l) => (
              <button
                key={l}
                onClick={() => setActiveLetter(l)}
                style={{
                  padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderRadius: '0.375rem',
                  border: activeLetter === l ? 'none' : '1px solid #d1d5db',
                  background: activeLetter === l ? '#111827' : 'transparent',
                  color: activeLetter === l ? '#ffffff' : '#4b5563',
                  cursor: 'pointer', transition: 'all 0.1s ease',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* ── EXPANDED CARD (selected word) ── */}
          {selectedWord && (
            <div
              ref={detailRef}
              style={{
                border: '2px solid #111827', borderRadius: '0.75rem', overflow: 'hidden',
                display: 'flex', gap: 0, animation: 'fade-in 0.3s ease-out forwards'
              }}
              className="animate-scale-in"
            >
              {/* Video panel */}
              <div style={{ width: '18rem', flexShrink: 0, background: '#f3f4f6', borderRight: '1px solid #e5e7eb' }}>
                <video
                  key={selectedWord}
                  controls
                  autoPlay
                  loop
                  style={{ width: '100%', height: '100%', minHeight: '13.75rem', objectFit: 'cover', display: 'block', background: '#f3f4f6' }}
                >
                  <source src={getVideoPath(selectedWord)} type="video/mp4" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '13.75rem', color: '#9ca3af', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                    Video tidak tersedia
                  </div>
                </video>
              </div>

              {/* Info panel */}
              <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>{selectedWord}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {selectedWord} · {selectedCategory?.name ?? 'Umum'} · Pemula
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '0.2rem 0.6rem', color: '#6b7280' }}>
                    {selectedCategory?.name ?? 'Umum'}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65 }}>
                  Gerakan tangan untuk isyarat "{selectedWord}" dalam Bahasa Isyarat Indonesia (BISINDO).
                  Perhatikan posisi jari dan arah gerakan dengan seksama.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
                  <Link
                    to={`/practice/${encodeURIComponent(selectedWord)}`}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    Latih Isyarat Ini
                  </Link>
                  <button
                    onClick={() => {
                      const idx = VOCABULARY.indexOf(selectedWord);
                      setSelectedWord(VOCABULARY[(idx + 1) % VOCABULARY.length]);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Kata Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── GRID ── */}
          {filteredWords.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {filteredWords.map((word) => {
                const cat = getCategoryForWord(word);
                const isSelected = selectedWord === word;
                return (
                  <div
                    key={word}
                    className="vocab-card"
                    style={isSelected ? { border: '2px solid #111827' } : {}}
                    onClick={() => handleSelectWord(word)}
                  >
                    {/* Video thumbnail area */}
                    <div style={{ position: 'relative', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                      <video
                        src={getVideoPath(word)}
                        style={{ width: '100%', height: '7.5rem', objectFit: 'cover', display: 'block' }}
                        muted
                        preload="metadata"
                        onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseOut={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                      />
                      {/* Play overlay */}
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.08)', opacity: 0, transition: 'opacity 0.2s ease',
                      }}
                        className="play-overlay"
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '0'}
                      >
                        <svg style={{ width: '2rem', height: '2rem', color: '#ffffff', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{word}</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.125rem' }}>{word} · {cat?.name ?? 'Umum'} · Pemula</div>
                      <span style={{
                        display: 'inline-block', marginTop: '0.5rem', fontSize: '0.65rem',
                        border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '0.1rem 0.5rem', color: '#6b7280',
                      }}>
                        {cat?.name ?? 'Umum'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
              <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>Tidak ditemukan</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Kata "{searchQuery}" tidak ada dalam kamus</p>
            </div>
          )}

          {/* Result count */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Menampilkan {filteredWords.length} dari {VOCABULARY.length} entri
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb', padding: '2rem 0', marginTop: '2rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1.75rem', height: '1.75rem', background: '#1f2937', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>TanganBicara</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[{ to: '/', l: 'Beranda' }, { to: '/dictionary', l: 'Kamus' }, { to: '/practice', l: 'Latihan' }].map(({ to, l }) => (
                <Link key={to} to={to} style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2026 TanganBicara. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
