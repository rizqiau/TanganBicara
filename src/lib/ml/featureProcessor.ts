/**
 * Feature Processor — Port of Python preprocessing pipeline
 *
 * Ported from:
 *   - 02_preprocess.py: advancedSpatialNormalization, extractLevel2Features
 *   - 05_realtime.py: sampleUniformSequence, extractLevel2FeaturesRealtime
 *
 * Pipeline: raw keypoints (30, 225) → normalize → level2 features → (30, 232)
 */

import { TARGET_FRAMES, NUM_FEATURES } from './vocabulary';

/**
 * Uniform temporal resampling to a fixed number of frames.
 * Mirrors `sample_uniform_sequence` from 05_realtime.py
 */
export function sampleUniformSequence(
  sequence: number[][],
  targetLen: number = TARGET_FRAMES
): number[][] {
  const total = sequence.length;
  if (total === targetLen) return sequence;

  const result: number[][] = [];
  for (let i = 0; i < targetLen; i++) {
    const idx = Math.round((i * (total - 1)) / (targetLen - 1));
    result.push(sequence[idx]);
  }
  return result;
}

/**
 * Shoulder-centered spatial normalization.
 * Mirrors `advanced_spatial_normalization` from 02_preprocess.py / 05_realtime.py
 *
 * For each frame:
 *   1. Find mid-shoulder and shoulder width from pose landmarks 11 & 12
 *   2. Center all keypoints relative to mid-shoulder
 *   3. Scale by shoulder width
 */
export function advancedSpatialNormalization(sequence: number[][]): number[][] {
  const normalized: number[][] = sequence.map((frame) => [...frame]);
  let lastValidMidShoulder: [number, number, number] | null = null;
  let lastValidShoulderWidth = 0.3;

  for (let i = 0; i < sequence.length; i++) {
    const frame = sequence[i];

    // Pose landmark 11 = indices 33..35 (left shoulder)
    // Pose landmark 12 = indices 36..38 (right shoulder)
    const lShoulder = [frame[33], frame[34], frame[35]];
    const rShoulder = [frame[36], frame[37], frame[38]];

    let midShoulder = [
      (lShoulder[0] + rShoulder[0]) / 2.0,
      (lShoulder[1] + rShoulder[1]) / 2.0,
      (lShoulder[2] + rShoulder[2]) / 2.0,
    ];

    let shoulderWidth = Math.sqrt(
      (rShoulder[0] - lShoulder[0]) ** 2 + (rShoulder[1] - lShoulder[1]) ** 2
    );

    // Check if shoulder data is valid
    const isZero =
      midShoulder[0] === 0 && midShoulder[1] === 0 && midShoulder[2] === 0;

    if (isZero || shoulderWidth < 0.01) {
      if (lastValidMidShoulder !== null) {
        midShoulder = [...lastValidMidShoulder];
        shoulderWidth = lastValidShoulderWidth;
      } else {
        midShoulder = [0.5, 0.5, 0.0];
        shoulderWidth = 0.3;
      }
    } else {
      lastValidMidShoulder = midShoulder as [number, number, number];
      lastValidShoulderWidth = shoulderWidth;
    }

    // Normalize all keypoints (225 values = 75 points × 3 coords)
    for (let j = 0; j < 225; j += 3) {
      // Skip zero keypoints (undetected)
      if (frame[j] === 0 && frame[j + 1] === 0 && frame[j + 2] === 0) {
        continue;
      }
      normalized[i][j] = (frame[j] - midShoulder[0]) / shoulderWidth;
      normalized[i][j + 1] = (frame[j + 1] - midShoulder[1]) / shoulderWidth;
      normalized[i][j + 2] = (frame[j + 2] - midShoulder[2]) / shoulderWidth;
    }
  }

  return normalized;
}

/**
 * Extract Level 2 features (wrist distance + velocity vectors).
 * Mirrors `extract_level2_features_realtime` from 05_realtime.py
 *
 * Adds 7 features per frame:
 *   [225] = Euclidean distance between left/right wrist
 *   [226..228] = Left hand velocity (x, y, z)
 *   [229..231] = Right hand velocity (x, y, z)
 *
 * Total: 225 → 232 features per frame
 */
export function extractLevel2Features(
  normalizedSequence: number[][],
  timestampsMs: number[]
): number[][] {
  const frames = normalizedSequence.length;
  const TRAIN_DT_MS = 33.33; // ~30fps training assumption

  const result: number[][] = [];

  for (let i = 0; i < frames; i++) {
    // Start with the 225 base keypoints, padded to 232
    const newFrame = new Array(NUM_FEATURES).fill(0);
    for (let k = 0; k < 225; k++) {
      newFrame[k] = normalizedSequence[i][k];
    }

    // Wrist positions
    const lWrist = [
      normalizedSequence[i][99],
      normalizedSequence[i][100],
      normalizedSequence[i][101],
    ];
    const rWrist = [
      normalizedSequence[i][162],
      normalizedSequence[i][163],
      normalizedSequence[i][164],
    ];

    // Wrist distance
    const lWristZero = lWrist[0] === 0 && lWrist[1] === 0 && lWrist[2] === 0;
    const rWristZero = rWrist[0] === 0 && rWrist[1] === 0 && rWrist[2] === 0;

    const dist =
      lWristZero || rWristZero
        ? 0.0
        : Math.sqrt(
            (lWrist[0] - rWrist[0]) ** 2 +
              (lWrist[1] - rWrist[1]) ** 2 +
              (lWrist[2] - rWrist[2]) ** 2
          );

    // Velocity vectors
    let vLh = [0, 0, 0];
    let vRh = [0, 0, 0];

    if (i > 0) {
      let dtActual = timestampsMs[i] - timestampsMs[i - 1];
      if (dtActual <= 0) dtActual = TRAIN_DT_MS;
      const scaleFactor = TRAIN_DT_MS / dtActual;

      const prevLWrist = [
        normalizedSequence[i - 1][99],
        normalizedSequence[i - 1][100],
        normalizedSequence[i - 1][101],
      ];
      const prevRWrist = [
        normalizedSequence[i - 1][162],
        normalizedSequence[i - 1][163],
        normalizedSequence[i - 1][164],
      ];

      const prevLZero =
        prevLWrist[0] === 0 && prevLWrist[1] === 0 && prevLWrist[2] === 0;
      const prevRZero =
        prevRWrist[0] === 0 && prevRWrist[1] === 0 && prevRWrist[2] === 0;

      if (!lWristZero && !prevLZero) {
        vLh = [
          (lWrist[0] - prevLWrist[0]) * scaleFactor,
          (lWrist[1] - prevLWrist[1]) * scaleFactor,
          (lWrist[2] - prevLWrist[2]) * scaleFactor,
        ];
      }
      if (!rWristZero && !prevRZero) {
        vRh = [
          (rWrist[0] - prevRWrist[0]) * scaleFactor,
          (rWrist[1] - prevRWrist[1]) * scaleFactor,
          (rWrist[2] - prevRWrist[2]) * scaleFactor,
        ];
      }
    }

    newFrame[225] = dist;
    newFrame[226] = vLh[0];
    newFrame[227] = vLh[1];
    newFrame[228] = vLh[2];
    newFrame[229] = vRh[0];
    newFrame[230] = vRh[1];
    newFrame[231] = vRh[2];

    result.push(newFrame);
  }

  return result;
}

/**
 * Full preprocessing pipeline: raw keypoints → model-ready tensor.
 * Combines: uniform sampling → spatial normalization → level 2 features.
 */
export function preprocessSequence(
  rawFrames: number[][],
  timestampsMs: number[]
): number[][] {
  // Step 1: Uniform temporal resampling
  const sampled = sampleUniformSequence(rawFrames, TARGET_FRAMES);
  const sampledTimestamps = sampleUniformSequence(
    timestampsMs.map((t) => [t]),
    TARGET_FRAMES
  ).map((t) => t[0]);

  // Step 2: Shoulder-centered spatial normalization
  const normalized = advancedSpatialNormalization(sampled);

  // Step 3: Extract Level 2 features (225 → 232)
  const level2 = extractLevel2Features(normalized, sampledTimestamps);

  return level2;
}
