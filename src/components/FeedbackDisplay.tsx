import { type GestureFeedback, type FeedbackType } from '@/lib/ml/gestureClassifier';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

interface FeedbackDisplayProps {
  feedback: GestureFeedback;
  className?: string;
}

// ── Score ring colour thresholds ──────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-accent', stroke: 'var(--color-accent)' };
  if (score >= 55) return { text: 'text-warning', stroke: 'var(--color-warning)' };
  return { text: 'text-recording', stroke: 'var(--color-recording)' };
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Sangat Baik';
  if (score >= 60) return 'Cukup Baik';
  if (score >= 40) return 'Perlu Perbaikan';
  return 'Banyak Koreksi';
}

// ── Per-type icon + colour map ────────────────────────────────────────────────
const TYPE_META: Record<
  FeedbackType,
  { Icon: React.ElementType; bg: string; border: string; iconCls: string; labelCls: string }
> = {
  success: {
    Icon: CheckCircle2,
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    iconCls: 'text-emerald-400',
    labelCls: 'text-emerald-300',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    iconCls: 'text-amber-400',
    labelCls: 'text-amber-300',
  },
  info: {
    Icon: Info,
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    iconCls: 'text-blue-400',
    labelCls: 'text-blue-300',
  },
  tip: {
    Icon: Lightbulb,
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    iconCls: 'text-violet-400',
    labelCls: 'text-violet-300',
  },
};

// ── Score Ring (SVG) ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const R = 28;
  const circumference = 2 * Math.PI * R;
  const dash = (score / 100) * circumference;
  const { text, stroke } = getScoreColor(score);

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        {/* Track */}
        <circle
          cx="36" cy="36" r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />
        {/* Progress */}
        <circle
          cx="36" cy="36" r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-sm font-black tabular-nums', text)}>{score}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function FeedbackDisplay({ feedback, className }: FeedbackDisplayProps) {
  const { items, overallScore } = feedback;
  const scoreColor = getScoreColor(overallScore);

  return (
    <div
      className={cn(
        'glass-card rounded-2xl border border-border overflow-hidden animate-scale-in',
        className
      )}
    >
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 bg-white/2">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <span className="text-sm font-semibold text-text-primary">Umpan Balik Gerakan</span>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn('text-xs font-semibold', scoreColor.text)}>
            {getScoreLabel(overallScore)}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 space-y-4">
        {/* Score + items row */}
        <div className="flex items-start gap-4">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={overallScore} />
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">Skor</span>
          </div>

          {/* Feedback items */}
          <ul className="flex-1 space-y-2.5 min-w-0">
            {items.map((item, i) => {
              const meta = TYPE_META[item.type];
              const { Icon } = meta;
              return (
                <li
                  key={i}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl px-3 py-2.5 border text-sm leading-snug',
                    meta.bg,
                    meta.border
                  )}
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animation: 'fadeInUp 0.3s ease both',
                  }}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', meta.iconCls)} />
                  <span className="text-text-secondary">{item.message}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Live Feedback Pill ────────────────────────────────────────────────────────
interface LiveFeedbackPillProps {
  speedLabel: 'too_fast' | 'good' | 'too_slow' | null;
  handsVisible: boolean;
  bothHandsVisible: boolean;
}

export function LiveFeedbackPill({ speedLabel, handsVisible, bothHandsVisible }: LiveFeedbackPillProps) {
  const messages: Array<{ text: string; cls: string }> = [];

  if (!handsVisible) {
    messages.push({ text: '✋ Tangan tidak terdeteksi', cls: 'text-recording' });
  } else if (!bothHandsVisible) {
    messages.push({ text: '🤲 Tampilkan kedua tangan', cls: 'text-warning' });
  }

  if (speedLabel === 'too_fast') {
    messages.push({ text: '⚡ Terlalu cepat — perlambat', cls: 'text-amber-400' });
  }

  if (messages.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {messages.map((m, i) => (
        <span
          key={i}
          className={cn(
            'glass rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
            m.cls
          )}
        >
          {m.text}
        </span>
      ))}
    </div>
  );
}
