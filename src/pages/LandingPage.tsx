import { Link } from 'react-router-dom';

const steps = [
  {
    num: '1',
    title: 'Jelajahi Kamus',
    description: 'Cari dan tonton panduan video gerakan bahasa isyarat Indonesia berdasarkan kata atau kategori.',
  },
  {
    num: '2',
    title: 'Latihan dengan Kamera',
    description: 'Aktifkan webcam Anda dan tiru gerakannya. Model ML kami melacak posisi tangan Anda secara langsung.',
  },
  {
    num: '3',
    title: 'Dapatkan Umpan Balik Instan',
    description: 'Terima umpan balik terperinci dan dapat ditindaklanjuti agar Anda bisa berkembang dan semakin lancar.',
  },
];

const testimonials = [
  {
    name: 'Rina S.',
    role: 'Pelajar, Jakarta',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=42',
    text: '"TanganBicara membuat belajar BISINDO jauh lebih mudah. Video kamusnya jelas dan umpan balik latihan membantu saya memperbaiki kesalahan dengan cepat."',
    stars: 5,
  },
  {
    name: 'Budi P.',
    role: 'Guru, Bandung',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=99',
    text: '"Saya menggunakan ini bersama murid-murid saya. Fitur latihan AI sangat inovatif dan menghemat waktu dibandingkan koreksi manual."',
    stars: 4,
  },
  {
    name: 'Dian M.',
    role: 'Juru Bahasa, Surabaya',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=17',
    text: '"Kamusnya sangat lengkap. Saya sering menggunakannya sebagai referensi. Harap lebih banyak kategori ditambahkan!"',
    stars: 5,
  },
];

export function LandingPage() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingTop: '4rem' }}>

      {/* ── HERO ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '3rem', minHeight: '600px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '0.375rem 1rem', fontSize: '0.75rem', color: '#6b7280', width: 'fit-content' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
            Pelajari Bahasa Isyarat Indonesia (BISINDO)
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.15, color: '#111827', letterSpacing: '-0.02em' }}>
            Bicara dengan<br />Tanganmu.{' '}
            <span style={{ color: '#9ca3af' }}>Pelajari<br />Bahasa</span>{' '}Isyarat Hari Ini.
          </h1>

          {/* Subtitle */}
          <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.7, maxWidth: '28rem' }}>
            TanganBicara adalah platform interaktif untuk membantu Anda belajar,
            berlatih, dan menguasai Bahasa Isyarat Indonesia melalui video dan umpan
            balik AI secara langsung.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dictionary" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Jelajahi Kamus
            </Link>
            <Link to="/practice" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Mulai Latihan
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.5rem' }}>
            {[
              { val: '50', label: 'Kosakata BISINDO' },
              { val: 'AI', label: 'Umpan Balik Langsung' },
              { val: 'Gratis', label: 'Terbuka untuk Semua' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {i > 0 && <div style={{ width: '1px', height: '2rem', background: '#e5e7eb' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827' }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right illustration */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '26rem', height: '22rem', background: '#f3f4f6',
            borderRadius: '1rem', border: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.75rem', color: '#9ca3af'
          }}>
            <svg style={{ width: '4rem', height: '4rem', color: '#d1d5db' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}></span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>Apa yang Bisa Kamu Lakukan</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Dua fitur utama untuk mendukung perjalanan belajar bahasa isyarat Anda</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Kamus feature card */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Kamus</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>Jelajahi 50 kata dan frasa bahasa isyarat Indonesia. Setiap entri dilengkapi video demonstrasi yang jelas beserta deskripsinya.</p>
              <div style={{ height: '8.75rem', background: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                Thumbnail Video Isyarat
              </div>
              <Link to="/dictionary" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>
                Buka Kamus <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Latihan feature card */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>Latihan</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>Gunakan kamera Anda untuk mendemonstrasikan gerakan bahasa isyarat. Model AI kami menganalisis pergerakan tangan Anda dan memberikan umpan balik instan.</p>
              <div style={{ height: '8.75rem', background: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
                Kamera
              </div>
              <Link to="/practice" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#374151', textDecoration: 'none', fontWeight: 500 }}>
                Mulai Latihan <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>Cara Kerjanya</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Tiga langkah mudah untuk memulai</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', background: '#111827', color: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600 }}>
                {step.num}
              </div>
              <h4 style={{ color: '#1f2937', fontWeight: 600, fontSize: '0.9rem' }}>{step.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '4rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>Kata Para Pelajar</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Umpan balik dari komunitas kami</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={t.avatar} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#f3f4f6' }} alt={t.name} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>{t.text}</p>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} style={{ width: '0.85rem', height: '0.85rem', color: s < t.stars ? '#9ca3af' : '#e5e7eb' }} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '4rem 2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Siap Mulai Belajar?</h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: '28rem' }}>
          Bergabunglah dengan ribuan pelajar yang berkomunikasi melalui bahasa isyarat. Gratis, interaktif, dan efektif.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/practice" className="btn btn-primary btn-lg">
            Mulai Sekarang — Gratis
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb', padding: '2rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1.75rem', height: '1.75rem', background: '#1f2937', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1rem', height: '1rem', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>TanganBicara</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[{ to: '/', l: 'Beranda' }, { to: '/dictionary', l: 'Kamus' }, { to: '/practice', l: 'Latihan' }].map(({ to, l }) => (
                <Link key={to} to={to} style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >{l}</Link>
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