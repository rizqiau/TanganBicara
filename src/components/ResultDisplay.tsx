import type { DetectionStatus } from '@/lib/ml/gestureClassifier';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, TrendingUp, XCircle } from 'lucide-react';

interface ResultDisplayProps {
  status: DetectionStatus | null;
  targetWord?: string;
  className?: string;
}

export function ResultDisplay({ status, targetWord, className }: ResultDisplayProps) {
  if (!status?.prediction) return null;

  const { word, confidence, isConfident } = status.prediction;
  const pct = (confidence * 100).toFixed(1);
  
  const isMismatch = targetWord ? word !== targetWord : false;

  return (
    <div
      className={cn(
        'glass-card rounded-2xl border overflow-hidden animate-scale-in',
        isMismatch 
          ? 'border-red-500/50 glow-red'
          : (isConfident ? 'border-accent/25 glow-accent' : 'border-amber-500/20'),
        className
      )}
    >
      {/* Header strip */}
      <div
        className={cn(
          'px-5 py-3 flex items-center gap-2.5 border-b',
          isMismatch 
            ? 'bg-red-500/10 border-red-500/20'
            : (isConfident ? 'bg-accent/8 border-accent/15' : 'bg-amber-500/8 border-amber-500/15')
        )}
      >
        {isMismatch ? (
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
        ) : isConfident ? (
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
        )}
        <span className={cn('text-sm font-semibold', isMismatch ? 'text-red-500' : (isConfident ? 'text-accent' : 'text-warning'))}>
          {isMismatch ? 'Isyarat Tidak Sesuai' : (isConfident ? 'Berhasil Terdeteksi!' : 'Kurang Yakin')}
        </span>
        <span className="ml-auto text-xs text-text-muted">
          {isMismatch ? `Target: ${targetWord}` : (isConfident ? 'Akurasi tinggi' : 'Coba ulangi gerakan')}
        </span>
      </div>

      {/* Predicted word */}
      <div className="px-5 py-5 text-center">
        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-medium">
          {isMismatch ? 'Yang Anda Peragakan' : 'Prediksi Isyarat'}
        </p>
        <h2
          className={cn(
            'text-4xl sm:text-5xl font-black tracking-tight leading-none mb-1',
            isMismatch ? 'text-red-500' : (isConfident ? 'text-accent text-glow' : 'text-warning')
          )}
        >
          {word}
        </h2>
        {isMismatch && (
          <p className="text-xs text-red-500/80 mt-2 font-medium">
            Mohon perhatikan kembali video referensi.
          </p>
        )}
      </div>

      {/* Confidence bar */}
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-text-muted font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Keyakinan Model
          </span>
          <span
            className={cn(
              'font-bold text-sm tabular-nums',
              isMismatch ? 'text-red-500' : (isConfident ? 'text-accent' : 'text-warning')
            )}
          >
            {pct}%
          </span>
        </div>
        <div className="confidence-bar">
          <div
            className="confidence-bar-fill"
            style={{
              width: `${confidence * 100}%`,
              backgroundColor: isMismatch 
                ? 'var(--color-destructive, #ef4444)' 
                : (isConfident ? 'var(--color-accent)' : 'var(--color-warning)'),
            }}
          />
        </div>
        <p className="text-[10px] text-text-muted text-center">
          Ambang batas keyakinan: 65%
        </p>
      </div>
    </div>
  );
}
