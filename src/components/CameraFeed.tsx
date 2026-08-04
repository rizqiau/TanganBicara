import { useRef, useEffect, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useGestureDetection } from '@/hooks/useGestureDetection';
import { LandmarkRenderer } from './LandmarkRenderer';
import { ResultDisplay } from './ResultDisplay';
import { FeedbackDisplay, LiveFeedbackPill } from './FeedbackDisplay';
import { cn } from '@/lib/utils';
import { Camera, Loader2, AlertTriangle, Activity, Target } from 'lucide-react';
import type { DetectionStatus } from '@/lib/ml/gestureClassifier';
import type { LiveFeedback } from '@/lib/ml/gestureFeedback';

interface CameraFeedProps {
  targetWord?: string;
  className?: string;
  /** Called every frame with the latest detection status (null when idle) */
  onStatusChange?: (status: DetectionStatus | null) => void;
  /** Called every frame with the latest live feedback (null when not recording) */
  onLiveFeedbackChange?: (feedback: LiveFeedback | null) => void;
}

export function CameraFeed({ targetWord, className, onStatusChange, onLiveFeedbackChange }: CameraFeedProps) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera } = useCamera();
  const {
    isModelLoading,
    isModelReady,
    loadingProgress,
    detectionStatus,
    currentLandmarks,
    fps,
    liveFeedback,
  } = useGestureDetection({ videoRef, isActive });

  // Propagate status changes to parent
  useEffect(() => {
    onStatusChange?.(detectionStatus);
  }, [detectionStatus, onStatusChange]);

  useEffect(() => {
    onLiveFeedbackChange?.(liveFeedback);
  }, [liveFeedback, onLiveFeedbackChange]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoadedMetadata = () => {
      setVideoDimensions({
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
      });
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [videoRef]);

  const isRecording = detectionStatus?.state === 'RECORDING';
  const isInferencing = detectionStatus?.state === 'INFERENCING';

  return (
    <div className={cn('space-y-4', className)}>

      {/* Target Word Banner */}
      {targetWord && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="animate-fade-in">
          <div>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }}>
              Target Isyarat
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {targetWord}
            </h3>
          </div>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target className="w-6 h-6" style={{ color: '#374151' }} />
          </div>
        </div>
      )}

      {/* Camera Container */}
      <div
        ref={containerRef}
        className={cn(
          'camera-frame relative aspect-video bg-surface w-full',
          isRecording && 'recording',
          isActive && !isRecording && 'ready'
        )}
      >
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Landmark overlay */}
        {currentLandmarks && (
          <LandmarkRenderer
            landmarks={currentLandmarks}
            width={videoDimensions.width}
            height={videoDimensions.height}
            mirrored={true}
          />
        )}

        {/* HUD overlay — top row */}
        {isActive && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2">
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '0.3rem 0.75rem' }} className="animate-scale-in">
                  <div className="recording-dot" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em' }}>REC</span>
                </div>
              )}
              {isInferencing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '0.3rem 0.75rem' }} className="animate-scale-in">
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6' }}>AI…</span>
                </div>
              )}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '9999px', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Activity className="w-3 h-3" style={{ color: '#9ca3af' }} />
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6b7280' }}>
                {fps.toFixed(0)} fps
              </span>
            </div>
          </div>
        )}

        {/* Recording progress bar + live feedback */}
        {isRecording && detectionStatus && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none space-y-2">
            {/* Live feedback pills */}
            {liveFeedback && (
              <LiveFeedbackPill
                speedLabel={liveFeedback.speedLabel}
                handsVisible={liveFeedback.handsVisible}
                bothHandsVisible={liveFeedback.bothHandsVisible}
              />
            )}
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>Merekam...</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {detectionStatus.recordedFrames}/{detectionStatus.maxFrames}
                </span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-bar-fill"
                  style={{
                    width: `${(detectionStatus.recordedFrames / detectionStatus.maxFrames) * 100}%`,
                    backgroundColor: '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status text overlay */}
        {isActive && detectionStatus && !isRecording && !isInferencing && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '0.75rem', padding: '0.4rem 0.75rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#374151' }}>{detectionStatus.statusText}</p>
            </div>
          </div>
        )}

        {/* Camera Not Started — Placeholder */}
        {!isActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(249,250,251,0.97)' }}>
            {isModelLoading ? (
              <div className="text-center space-y-4 animate-fade-in px-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-border mx-auto flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    Memuat Model AI
                  </p>
                  <p className="text-xs text-text-muted max-w-xs leading-relaxed">{loadingProgress}</p>
                </div>
                <div className="w-40 mx-auto">
                  <div className="confidence-bar">
                    <div
                      className="confidence-bar-fill animate-pulse"
                      style={{ width: '60%', backgroundColor: 'var(--color-accent)' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-fade-in px-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto animate-pulse-glow">
                  <Camera className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold text-text-primary mb-1">Kamera Siap</p>
                  <p className="text-xs text-text-muted max-w-[200px] mx-auto leading-relaxed">
                    Klik tombol di bawah untuk mengaktifkan kamera
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  disabled={!isModelReady}
                  className={cn(
                    'btn',
                    isModelReady
                      ? 'btn-primary px-6 py-2.5'
                      : 'bg-surface-3 text-text-muted cursor-not-allowed px-6 py-2.5 rounded-xl font-semibold text-sm'
                  )}
                >
                  {isModelReady ? (
                    <>
                      <Camera className="w-4 h-4" />
                      Nyalakan Kamera
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memuat model…
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Camera Error */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ background: 'rgba(249,250,251,0.97)' }}>
            <div className="text-center space-y-4 animate-fade-in max-w-xs">
              <div className="w-14 h-14 rounded-2xl bg-recording/10 border border-recording/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-recording" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary mb-1">Gagal Mengakses Kamera</p>
                <p className="text-xs text-text-muted leading-relaxed">{cameraError}</p>
              </div>
              <button
                onClick={startCamera}
                className="btn btn-primary"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {detectionStatus?.prediction && detectionStatus.state !== 'RECORDING' && (
        <ResultDisplay status={detectionStatus} targetWord={targetWord} />
      )}

      {/* Feedback Display */}
      {detectionStatus?.feedback && detectionStatus.state !== 'RECORDING' && (
        <FeedbackDisplay feedback={detectionStatus.feedback} />
      )}
    </div>
  );
}
