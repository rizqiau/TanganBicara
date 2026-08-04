import { useEffect, useRef } from 'react';
import type { ExtractedLandmarks } from '@/lib/ml/landmarkExtractor';
import { HAND_CONNECTIONS, POSE_CONNECTIONS } from '@/lib/ml/landmarkExtractor';

interface LandmarkRendererProps {
  landmarks: ExtractedLandmarks | null;
  width: number;
  height: number;
  mirrored?: boolean;
}

const HAND_DOT_COLOR = 'rgba(80, 200, 120, 1)';
const HAND_LINE_COLOR = 'rgba(60, 140, 80, 0.8)';
const POSE_DOT_COLOR = 'rgba(80, 80, 100, 0.6)';
const POSE_LINE_COLOR = 'rgba(60, 60, 80, 0.4)';
const HAND_GLOW_COLOR = 'rgba(0, 200, 120, 0.3)';

export function LandmarkRenderer({
  landmarks,
  width,
  height,
  mirrored = true,
}: LandmarkRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (!landmarks) return;

    const transformX = (x: number) => (mirrored ? (1 - x) * width : x * width);
    const transformY = (y: number) => y * height;

    // Draw pose landmarks
    if (landmarks.poseLandmarks) {
      for (const poseLms of landmarks.poseLandmarks) {
        // Draw connections
        ctx.strokeStyle = POSE_LINE_COLOR;
        ctx.lineWidth = 2;
        for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
          if (startIdx < poseLms.length && endIdx < poseLms.length) {
            const start = poseLms[startIdx];
            const end = poseLms[endIdx];
            ctx.beginPath();
            ctx.moveTo(transformX(start.x), transformY(start.y));
            ctx.lineTo(transformX(end.x), transformY(end.y));
            ctx.stroke();
          }
        }

        // Draw dots (only upper body)
        for (let i = 11; i < Math.min(25, poseLms.length); i++) {
          const lm = poseLms[i];
          ctx.beginPath();
          ctx.arc(transformX(lm.x), transformY(lm.y), 3, 0, Math.PI * 2);
          ctx.fillStyle = POSE_DOT_COLOR;
          ctx.fill();
        }
      }
    }

    // Draw hand landmarks
    if (landmarks.handLandmarks) {
      for (const handLms of landmarks.handLandmarks) {
        // Draw connections
        ctx.strokeStyle = HAND_LINE_COLOR;
        ctx.lineWidth = 2.5;
        for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
          if (startIdx < handLms.length && endIdx < handLms.length) {
            const start = handLms[startIdx];
            const end = handLms[endIdx];
            ctx.beginPath();
            ctx.moveTo(transformX(start.x), transformY(start.y));
            ctx.lineTo(transformX(end.x), transformY(end.y));
            ctx.stroke();
          }
        }

        // Draw dots with glow
        for (const lm of handLms) {
          const x = transformX(lm.x);
          const y = transformY(lm.y);

          // Glow effect
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = HAND_GLOW_COLOR;
          ctx.fill();

          // Dot
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = HAND_DOT_COLOR;
          ctx.fill();
        }
      }
    }
  }, [landmarks, width, height, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      className="landmark-canvas"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
