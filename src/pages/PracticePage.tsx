import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CameraFeed } from '@/components/CameraFeed';
import { VOCABULARY } from '@/lib/ml/vocabulary';
import type { DetectionStatus } from '@/lib/ml/gestureClassifier';

// ── Score helpers ──────────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik';
  if (score >= 60) return 'Cukup Baik';
  if (score >= 40) return 'Perlu Perbaikan';
  return 'Banyak Koreksi';
}

// ── Score Ring ─────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const R = 26;
  const circumference = 2 * Math.PI * R;
  const dash = (score / 100) * circumference;
  const color = getScoreColor(score);
  return (
    <div style={{ position: 'relative', width: '4rem', height: '4rem', flexShrink: 0 }}>
      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={R} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

// ── Confidence bar row ─────────────────────────────────────────────────────────
function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
        <span style={{ color: '#4b5563' }}>{label}</span>
        <span style={{ color: '#1f2937', fontWeight: 500 }}>{value > 0 ? `${value}%` : '—'}</span>
      </div>
      <div className="confidence-bar">
        <div
          className="confidence-bar-fill"
          style={{ width: `${value}%`, background: color, transition: 'width 0.6s ease' }}
        />
      </div>
    </div>
  );
}

export function PracticePage() {
  const { word } = useParams<{ word?: string }>();
  const targetWord = word ? decodeURIComponent(word) : undefined;
  const isValidWord = targetWord ? VOCABULARY.includes(targetWord) : true;
  const [selectedSign, setSelectedSign] = useState<string>(
    targetWord && isValidWord ? targetWord : 'Halo'
  );

  // Sync selectedSign when URL parameter changes
  useEffect(() => {
    if (targetWord && isValidWord) {
      setSelectedSign(targetWord);
    }
  }, [targetWord, isValidWord]);

  // ── Live detection state lifted from CameraFeed ────────────────────────────
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus | null>(null);

  const handleStatusChange = useCallback((status: DetectionStatus | null) => {
    setDetectionStatus(status);
  }, []);

  const displayWord = selectedSign;

  // ── Derived feedback values ──────────────────────────────────────────────
  const prediction = detectionStatus?.prediction ?? null;
  const feedback = detectionStatus?.feedback ?? null;
  const overallScore = feedback?.overallScore ?? 0;
  const isResult = detectionStatus?.state === 'RESULT';

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingTop: '4rem' }}>

      {/* ── PAGE HEADER ── */}
      <section style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            <span>Beranda</span>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: '#374151' }}>Latihan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Latihan Bahasa Isyarat</h1>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Lakukan isyarat menggunakan webcam Anda. Model AI kami akan menganalisis gerakan dan memberikan umpan balik.
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.75rem', color: '#6b7280',
              border: '1px solid #e5e7eb', borderRadius: '0.5rem',
              padding: '0.5rem 1rem', background: '#ffffff',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: detectionStatus?.state === 'RECORDING' ? '#ef4444' :
                  detectionStatus?.state === 'INFERENCING' ? '#f59e0b' : '#9ca3af',
                transition: 'background 0.3s ease',
              }} />
              <span>
                {detectionStatus?.state === 'RECORDING' ? 'Merekam...' :
                  detectionStatus?.state === 'INFERENCING' ? 'Menganalisis...' :
                    detectionStatus?.state === 'RESULT' ? 'Hasil Siap' : 'Model ML: Aktif'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 2.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── LEFT: Sign Selector + Reference Video ── */}
        <div style={{ width: '18rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Sign Selector */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>Pilih Isyarat untuk Dilatih</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', maxHeight: '14rem', overflowY: 'auto' }}>
              {VOCABULARY.map((w) => (
                <div
                  key={w}
                  onClick={() => setSelectedSign(w)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
                    background: displayWord === w ? '#111827' : 'transparent',
                    color: displayWord === w ? '#ffffff' : '#374151',
                    fontSize: '0.8rem', transition: 'all 0.1s ease',
                  }}
                  onMouseOver={e => { if (displayWord !== w) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseOut={e => { if (displayWord !== w) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{w}</span>
                  <span style={{ fontSize: '0.65rem', color: displayWord === w ? '#9ca3af' : '#d1d5db' }}>Pemula</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Video */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Video Referensi</h3>
              <span style={{ fontSize: '0.65rem', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '0.1rem 0.5rem' }}>{displayWord}</span>
            </div>
            <video
              key={displayWord}
              controls
              loop
              style={{ width: '100%', background: '#f3f4f6', display: 'block', maxHeight: '12rem', objectFit: 'cover' }}
            >
              <source src={`/kosakata/${displayWord}-a-1.mp4`} type="video/mp4" />
            </video>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
                Perhatikan gerakan tangan dengan seksama dan ikuti panduan isyarat.
              </p>
              <Link
                to="/dictionary"
                style={{ textAlign: 'center', fontSize: '0.7rem', padding: '0.35rem 0', border: '1px solid #e5e7eb', borderRadius: '0.375rem', color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Lihat di Kamus
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Tips untuk Isyarat Ini</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Pastikan tangan terlihat jelas dengan pencahayaan yang baik',
                'Gerakan lambat & jelas lebih akurat dideteksi oleh model',
                'Keyakinan di atas 65% menandakan deteksi yang baik',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  <span style={{ color: '#9ca3af', flexShrink: 0 }}>{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── CENTER: Camera Feed ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CameraFeed
            targetWord={displayWord}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* ── RIGHT: Live AI Feedback Panel ── */}
        <div style={{ width: '18rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Prediksi Hasil ── */}
          {prediction && isResult && (() => {
            const isMismatch = prediction.word !== displayWord;
            const borderColor = isMismatch ? '#ef4444' : (prediction.isConfident ? '#10b981' : '#f59e0b');
            const bgColor = isMismatch ? '#fef2f2' : (prediction.isConfident ? '#ecfdf5' : '#fffbeb');
            const borderBottomColor = isMismatch ? '#fca5a5' : (prediction.isConfident ? '#a7f3d0' : '#fde68a');
            const iconColor = isMismatch ? '#ef4444' : (prediction.isConfident ? '#10b981' : '#f59e0b');
            const textColor = isMismatch ? '#991b1b' : (prediction.isConfident ? '#065f46' : '#92400e');
            const title = isMismatch ? 'Tidak Sesuai' : (prediction.isConfident ? 'Terdeteksi!' : 'Kurang Yakin');
            const subtitle = isMismatch ? `Target: ${displayWord}` : (prediction.isConfident ? 'Akurasi tinggi' : 'Coba ulangi');

            return (
              <div
                style={{
                  border: `2px solid ${borderColor}`,
                  borderRadius: '0.75rem', overflow: 'hidden',
                  animation: 'fade-in 0.4s ease-out forwards',
                }}
              >
                <div style={{
                  background: bgColor,
                  borderBottom: `1px solid ${borderBottomColor}`,
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: iconColor }}>
                    {isMismatch || !prediction.isConfident
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    }
                  </svg>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: textColor }}>
                    {title}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: isMismatch ? '#dc2626' : '#9ca3af', fontWeight: isMismatch ? 500 : 400 }}>
                    {subtitle}
                  </span>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                    {isMismatch ? 'Yang Anda Peragakan' : 'Prediksi Isyarat'}
                  </p>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: borderColor, lineHeight: 1 }}>
                    {prediction.word}
                  </h2>
                  {isMismatch && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                      Mohon perhatikan kembali video referensi.
                    </p>
                  )}
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      <span>Keyakinan Model</span>
                      <span style={{ fontWeight: 700, color: borderColor }}>
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className="confidence-bar-fill"
                        style={{
                          width: `${prediction.confidence * 100}%`,
                          background: borderColor,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.25rem' }}>Ambang: 65%</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Umpan Balik AI Panel ── */}
          <div style={{ border: '2px solid #111827', borderRadius: '0.75rem', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: '#111827', color: '#ffffff', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ color: '#ffffff' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.697-1.548 2.57l-2.492-.197M5 14.5l-1.548.235c-1.576.127-2.548-1.57-1.548-2.57L3.3 10.8" />
              </svg>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Umpan Balik AI</span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.65rem',
                border: '1px solid #374151', borderRadius: '9999px', padding: '0.1rem 0.5rem',
                color: detectionStatus?.state === 'RECORDING' ? '#ef4444' :
                  detectionStatus?.state === 'INFERENCING' ? '#f59e0b' :
                    isResult ? '#10b981' : '#9ca3af',
              }}>
                {detectionStatus?.state === 'RECORDING' ? 'Merekam' :
                  detectionStatus?.state === 'INFERENCING' ? 'Menganalisis' :
                    isResult ? 'Selesai' : 'Langsung'}
              </span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Score */}
              <div style={{ textAlign: 'center' }}>
                {feedback ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <ScoreRing score={overallScore} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Skor Kesesuaian Keseluruhan</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: getScoreColor(overallScore), marginTop: '0.125rem' }}>
                      {getScoreLabel(overallScore)}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827' }}>—</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Skor Kesesuaian Keseluruhan</div>
                    <div style={{ height: '0.625rem', background: '#e5e7eb', borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '0%', background: '#374151', borderRadius: '9999px' }} />
                    </div>
                  </>
                )}
              </div>

              {/* Score Breakdown — real data from gestureFeedback.ts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Rincian Gerakan
                </div>
                {feedback?.breakdown ? (
                  <>
                    <BarRow label="Kecepatan & Durasi" value={feedback.breakdown.speedScore} color={getScoreColor(feedback.breakdown.speedScore)} />
                    <BarRow label="Kelancaran Gerakan" value={feedback.breakdown.velocityScore} color={getScoreColor(feedback.breakdown.velocityScore)} />
                    <BarRow label="Posisi Tangan" value={feedback.breakdown.handPosScore} color={getScoreColor(feedback.breakdown.handPosScore)} />
                    <BarRow label="Keyakinan Model" value={feedback.breakdown.confidenceScore} color={getScoreColor(feedback.breakdown.confidenceScore)} />
                  </>
                ) : (
                  ['Kecepatan & Durasi', 'Kelancaran Gerakan', 'Posisi Tangan', 'Keyakinan Model'].map((label) => (
                    <BarRow key={label} label={label} value={0} color="#9ca3af" />
                  ))
                )}
              </div>


              {/* Feedback items / Saran */}
              <div style={{
                background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem',
                padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                  <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Saran
                </div>
                {feedback?.items && feedback.items.length > 0 ? (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                    {feedback.items.map((item, i) => (
                      <li key={i} style={{
                        fontSize: '0.75rem', color: '#374151', lineHeight: 1.5,
                        display: 'flex', alignItems: 'flex-start', gap: '0.375rem',
                        background:
                          item.type === 'success' ? '#f0fdf4' :
                            item.type === 'warning' ? '#fffbeb' :
                              item.type === 'tip' ? '#f5f3ff' : '#eff6ff',
                        border: `1px solid ${item.type === 'success' ? '#bbf7d0' :
                            item.type === 'warning' ? '#fde68a' :
                              item.type === 'tip' ? '#ddd6fe' : '#bfdbfe'
                          }`,
                        borderRadius: '0.5rem', padding: '0.5rem 0.625rem',
                      }}>
                        <span style={{ flexShrink: 0, marginTop: '0.05rem' }}>
                          {item.type === 'success' ? '✅' :
                            item.type === 'warning' ? '⚠️' :
                              item.type === 'tip' ? '💡' : 'ℹ️'}
                        </span>
                        {item.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {detectionStatus?.state === 'RECORDING'
                      ? 'Merekam gerakan tangan...'
                      : detectionStatus?.state === 'INFERENCING'
                        ? 'Menganalisis gerakan...'
                        : 'Mulai peragaan isyarat di depan kamera untuk mendapatkan umpan balik AI.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Link to Dictionary */}
          <Link
            to="/dictionary"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              border: '1px solid #e5e7eb', borderRadius: '0.75rem',
              padding: '0.875rem 1rem', textDecoration: 'none',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9ca3af'; (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{ width: '2rem', height: '2rem', background: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>Lihat di Kamus</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Detail & kata serupa</p>
            </div>
            <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#d1d5db' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb', padding: '2rem 0', marginTop: '1rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>TanganBicara</span>
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
