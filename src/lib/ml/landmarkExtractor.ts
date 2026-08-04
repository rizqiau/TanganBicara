/**
 * Landmark Extractor — MediaPipe Hand + Pose Landmarker for browser
 *
 * Ported from 01_extract_keypoints.py / 05_realtime.py
 *
 * Uses @mediapipe/tasks-vision to extract:
 *   - 33 pose landmarks × 3 coords = 99 values
 *   - 21 left-hand landmarks × 3 coords = 63 values
 *   - 21 right-hand landmarks × 3 coords = 63 values
 *   Total: 225 values per frame
 */

import {
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

// Connection definitions for landmark rendering
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

export const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
];

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface ExtractedLandmarks {
  /** Flat array of 225 keypoint values */
  keypoints: number[];
  /** Raw pose landmarks for rendering */
  poseLandmarks: LandmarkPoint[][] | null;
  /** Raw hand landmarks for rendering */
  handLandmarks: LandmarkPoint[][] | null;
  /** Handedness categories for each detected hand */
  handedness: string[];
}

export class LandmarkExtractor {
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isReady = false;

  // Forward-fill buffers for missing hand data
  private lastLh: number[] = new Array(63).fill(0);
  private lastRh: number[] = new Array(63).fill(0);

  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Initialize hand landmarker
    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Initialize pose landmarker
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/models/pose_landmarker_full.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.isReady = true;
  }

  get ready(): boolean {
    return this.isReady;
  }

  /**
   * Extract keypoints from a video frame.
   * Returns 225-dimensional feature vector + raw landmarks for rendering.
   */
  extractFromFrame(
    video: HTMLVideoElement,
    timestampMs: number
  ): ExtractedLandmarks {
    if (!this.handLandmarker || !this.poseLandmarker) {
      throw new Error('LandmarkExtractor not initialized');
    }

    const poseResult = this.poseLandmarker.detectForVideo(video, timestampMs);
    const handResult = this.handLandmarker.detectForVideo(video, timestampMs);

    // Extract pose keypoints (99 values)
    let pose: number[];
    if (poseResult.landmarks && poseResult.landmarks.length > 0) {
      pose = poseResult.landmarks[0].flatMap((lm) => [lm.x, lm.y, lm.z]);
    } else {
      pose = new Array(99).fill(0);
    }

    // Extract hand keypoints with handedness detection
    let currentLh: number[] | null = null;
    let currentRh: number[] | null = null;
    const handednessLabels: string[] = [];

    if (handResult.landmarks && handResult.landmarks.length > 0) {
      for (let idx = 0; idx < handResult.landmarks.length; idx++) {
        const handLms = handResult.landmarks[idx];
        const category = handResult.handedness[idx]?.[0]?.categoryName ?? '';
        handednessLabels.push(category);

        const flat = handLms.flatMap((lm) => [lm.x, lm.y, lm.z]);

        if (category === 'Left') {
          currentLh = flat;
        } else if (category === 'Right') {
          currentRh = flat;
        }
      }
    }

    // Forward-fill: use last valid hand data if current is missing
    const lh = currentLh ?? [...this.lastLh];
    const rh = currentRh ?? [...this.lastRh];

    if (currentLh) this.lastLh = [...lh];
    if (currentRh) this.lastRh = [...rh];

    // Combine into 225-element keypoint array
    const keypoints = [...pose, ...lh, ...rh];

    // Prepare raw landmarks for rendering
    const poseLandmarks =
      poseResult.landmarks && poseResult.landmarks.length > 0
        ? poseResult.landmarks.map((lms) =>
            lms.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))
          )
        : null;

    const handLandmarks =
      handResult.landmarks && handResult.landmarks.length > 0
        ? handResult.landmarks.map((lms) =>
            lms.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))
          )
        : null;

    return { keypoints, poseLandmarks, handLandmarks, handedness: handednessLabels };
  }

  /** Reset forward-fill buffers (call when starting a new session) */
  resetBuffers(): void {
    this.lastLh = new Array(63).fill(0);
    this.lastRh = new Array(63).fill(0);
  }

  /** Dispose of MediaPipe resources */
  dispose(): void {
    this.handLandmarker?.close();
    this.poseLandmarker?.close();
    this.isReady = false;
  }
}
