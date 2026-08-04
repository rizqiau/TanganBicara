import { useCallback, useEffect, useRef, useState } from 'react';
import { LandmarkExtractor, type ExtractedLandmarks } from '@/lib/ml/landmarkExtractor';
import { GestureClassifier, type DetectionStatus } from '@/lib/ml/gestureClassifier';
import { analyzeLiveFeedback, type LiveFeedback } from '@/lib/ml/gestureFeedback';

interface UseGestureDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

interface UseGestureDetectionReturn {
  isModelLoading: boolean;
  isModelReady: boolean;
  loadingProgress: string;
  detectionStatus: DetectionStatus | null;
  currentLandmarks: ExtractedLandmarks | null;
  fps: number;
  liveFeedback: LiveFeedback | null;
  startDetection: () => void;
  stopDetection: () => void;
}

export function useGestureDetection({
  videoRef,
  isActive,
}: UseGestureDetectionOptions): UseGestureDetectionReturn {
  const extractorRef = useRef<LandmarkExtractor | null>(null);
  const classifierRef = useRef<GestureClassifier | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fpsCounterRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const prevKpRef = useRef<number[] | null>(null);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<ExtractedLandmarks | null>(null);
  const [fps, setFps] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);

  // Rolling buffer of handedness labels for live feedback
  const handednessBufferRef = useRef<string[]>([]);

  // Initialize models
  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setIsModelLoading(true);

      try {
        // Step 1: Initialize MediaPipe
        setLoadingProgress('Memuat MediaPipe Hand & Pose Landmarker...');
        const extractor = new LandmarkExtractor();
        await extractor.initialize();
        if (cancelled) return;
        extractorRef.current = extractor;

        // Step 2: Initialize TF.js Model
        setLoadingProgress('Memuat model BISINDO Conv1D...');
        const classifier = new GestureClassifier();
        await classifier.initialize();
        if (cancelled) return;
        classifierRef.current = classifier;

        setIsModelReady(true);
        setLoadingProgress('Semua model siap!');
      } catch (err) {
        console.error('Failed to load models:', err);
        setLoadingProgress(`Error: ${err instanceof Error ? err.message : 'Gagal memuat model'}`);
      } finally {
        setIsModelLoading(false);
      }
    }

    loadModels();

    return () => {
      cancelled = true;
      extractorRef.current?.dispose();
      classifierRef.current?.dispose();
    };
  }, []);

  // Detection loop
  const detectFrame = useCallback(() => {
    const video = videoRef.current;
    const extractor = extractorRef.current;
    const classifier = classifierRef.current;

    if (!video || !extractor?.ready || !classifier?.ready || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // FPS calculation
    if (dt > 0) {
      fpsCounterRef.current.push(1000 / dt);
      if (fpsCounterRef.current.length > 30) fpsCounterRef.current.shift();
      const avgFps =
        fpsCounterRef.current.reduce((s, v) => s + v, 0) /
        fpsCounterRef.current.length;
      setFps(avgFps);
    }

    const timestampMs = Math.round(now);

    try {
      // Extract landmarks
      const landmarks = extractor.extractFromFrame(video, timestampMs);
      setCurrentLandmarks(landmarks);

      // Process through gesture classifier
      const status = classifier.processFrame(landmarks.keypoints, timestampMs);
      setDetectionStatus(status);

      // ── Live feedback (only while recording) ──
      if (status.state === 'RECORDING') {
        // Maintain a small rolling buffer of handedness labels
        handednessBufferRef.current = landmarks.handedness;

        // Approximate recent velocity magnitude from motion history in classifier
        // We re-use the hand wrist deltas from the last keypoint and the previous one
        const kp = landmarks.keypoints;
        const LW = 45; // pose left wrist x (raw index)
        const RW = 48; // pose right wrist x (raw index)
        // Simple instant speed proxy (use dt ≈ 33ms)
        const lSpeed = Math.sqrt(kp[LW] ** 2 + kp[LW + 1] ** 2);
        const rSpeed = Math.sqrt(kp[RW] ** 2 + kp[RW + 1] ** 2);
        // We store prev keypoint to diff
        const prevKp = prevKpRef.current;
        let velocityMag = 0;
        if (prevKp) {
          const dLx = kp[LW] - prevKp[LW];
          const dLy = kp[LW + 1] - prevKp[LW + 1];
          const dRx = kp[RW] - prevKp[RW];
          const dRy = kp[RW + 1] - prevKp[RW + 1];
          velocityMag = (Math.sqrt(dLx ** 2 + dLy ** 2) + Math.sqrt(dRx ** 2 + dRy ** 2)) / 2;
          // scale to 30fps equivalent
          velocityMag = velocityMag * (33.33 / Math.max(dt, 1));
          void lSpeed; void rSpeed;
        }
        prevKpRef.current = kp;

        setLiveFeedback(
          analyzeLiveFeedback(velocityMag, handednessBufferRef.current)
        );
      } else {
        prevKpRef.current = null;
        if (status.state !== 'INFERENCING') {
          setLiveFeedback(null);
        }
      }
    } catch (err) {
      // Silently skip frame errors
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef]);

  // Start/stop detection
  const startDetection = useCallback(() => {
    if (!isModelReady) return;
    setIsDetecting(true);
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [isModelReady, detectFrame]);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    classifierRef.current?.reset();
    extractorRef.current?.resetBuffers();
    setCurrentLandmarks(null);
    setDetectionStatus(null);
    setLiveFeedback(null);
    prevKpRef.current = null;
  }, []);

  // Auto-start detection when camera is active and models are ready
  useEffect(() => {
    if (isActive && isModelReady && !isDetecting) {
      startDetection();
    } else if (!isActive && isDetecting) {
      stopDetection();
    }
  }, [isActive, isModelReady, isDetecting, startDetection, stopDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return {
    isModelLoading,
    isModelReady,
    loadingProgress,
    detectionStatus,
    currentLandmarks,
    fps,
    liveFeedback,
    startDetection,
    stopDetection,
  };
}
