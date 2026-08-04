import { getCategoryForWord } from '@/lib/ml/vocabulary';
import { useNavigate } from 'react-router-dom';

interface VocabularyCardProps {
  word: string;
  index: number;
  className?: string;
}

export function VocabularyCard({ word, index, className }: VocabularyCardProps) {
  const navigate = useNavigate();
  const category = getCategoryForWord(word);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Praktik kata: ${word}`}
      onClick={() => navigate(`/practice/${encodeURIComponent(word)}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/practice/${encodeURIComponent(word)}`);
        }
      }}
      className={className}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        animationFillMode: 'forwards',
        outline: 'none',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#9ca3af';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {category && <span style={{ fontSize: '1.1rem' }}>{category.icon}</span>}
        <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ width: '0.75rem', height: '0.75rem', color: '#9ca3af' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{word}</h3>
      {category && (
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>{category.name}</p>
      )}
    </div>
  );
}
