/**
 * Gesture Classifier — TFLite inference + motion detection state machine
 *
 * Ported from 05_realtime.py
 *
 * State machine: STANDBY → RECORDING → INFERENCING → RESULT → STANDBY
 *
 * Uses @tensorflow/tfjs to load and run the Conv1D model.
 * Motion detection triggers automatic recording based on hand movement thresholds.
 */

import * as tf from '@tensorflow/tfjs';
import { VOCABULARY, TARGET_FRAMES, NUM_FEATURES } from './vocabulary';
import { preprocessSequence } from './featureProcessor';
import { analyzeGestureFeedback, type GestureFeedback } from './gestureFeedback';

export type { GestureFeedback, FeedbackItem, FeedbackType } from './gestureFeedback';

// --- Threshold parameters (synced from 05_realtime.py) ---
const CONFIDENCE_THRESHOLD = 0.65;
const MOTION_START_THRESHOLD = 0.004;
const MOTION_STOP_THRESHOLD = 0.0025;
const MIN_RECORD_FRAMES = 15;
const MAX_RECORD_FRAMES = 80;
const HISTORY_LEN = 8;
const PATIENCE_FRAMES = 8;

export type DetectionState = 'STANDBY' | 'RECORDING' | 'INFERENCING' | 'RESULT';

export interface PredictionResult {
  word: string;
  confidence: number;
  classIndex: number;
  isConfident: boolean;
}

export interface DetectionStatus {
  state: DetectionState;
  recordedFrames: number;
  maxFrames: number;
  prediction: PredictionResult | null;
  statusText: string;
  /** Feedback analisis kualitas gerakan — tersedia setelah inferensi selesai */
  feedback: GestureFeedback | null;
}

export class GestureClassifier {
  private model: tf.LayersModel | null = null;
  private isReady = false;

  // Recording state
  private state: DetectionState = 'STANDBY';
  private recordedFrames: number[][] = [];
  private recordedTimestamps: number[] = [];
  private idleFrames = 0;

  // Motion history buffer
  private motionHistory: number[][] = [];

  // Last prediction
  private lastPrediction: PredictionResult | null = null;

  // Last feedback
  private lastFeedback: GestureFeedback | null = null;

  // Target word (set externally for mode latihan)
  targetWord: string | undefined = undefined;

  async initialize(): Promise<void> {
    try {
      // Load TF.js LayersModel (converted from Keras .h5)
      this.model = await tf.loadLayersModel('/models/tfjs_model/model.json');
      this.isReady = true;
      console.log('✅ BISINDO Conv1D model loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load model:', err);
      throw err;
    }
  }

  get ready(): boolean {
    return this.isReady;
  }

  /**
   * Process a single frame of keypoints through the state machine.
   * Call this every frame with the 225-dimensional keypoint array.
   */
  processFrame(keypoints: number[], timestampMs: number): DetectionStatus {
    // Add to motion history
    this.motionHistory.push(keypoints);
    if (this.motionHistory.length > HISTORY_LEN) {
      this.motionHistory.shift();
    }

    // Need full history buffer before we can detect motion
    if (this.motionHistory.length < HISTORY_LEN) {
      return this.getStatus('Inisialisasi deteksi gerakan...');
    }

    // Calculate hand motion (std of hand keypoints across recent frames)
    const handMotion = this.calculateHandMotion();

    switch (this.state) {
      case 'STANDBY':
        if (handMotion > MOTION_START_THRESHOLD) {
          this.state = 'RECORDING';
          this.recordedFrames = [];
          this.recordedTimestamps = [];
          this.idleFrames = 0;
          this.lastPrediction = null;
        }
        return this.getStatus(
          this.lastPrediction
            ? `Terdeteksi: ${this.lastPrediction.word} (${(this.lastPrediction.confidence * 100).toFixed(0)}%)`
            : 'Siap — Peragakan bahasa isyarat'
        );

      case 'RECORDING':
        this.recordedFrames.push(keypoints);
        this.recordedTimestamps.push(timestampMs);

        if (handMotion < MOTION_STOP_THRESHOLD) {
          this.idleFrames++;
        } else {
          this.idleFrames = 0;
        }

        const stopped =
          this.idleFrames >= PATIENCE_FRAMES &&
          this.recordedFrames.length > MIN_RECORD_FRAMES;
        const maxedOut = this.recordedFrames.length >= MAX_RECORD_FRAMES;

        if (stopped || maxedOut) {
          this.state = 'INFERENCING';
          // Run inference asynchronously
          this.runInference();
        }

        return this.getStatus('● Merekam gerakan...');

      case 'INFERENCING':
        return this.getStatus('⏳ Menganalisis gerakan...');

      case 'RESULT':
        // Auto-transition back to standby after showing result
        this.state = 'STANDBY';
        return this.getStatus(
          `Terdeteksi: ${this.lastPrediction?.word} (${((this.lastPrediction?.confidence ?? 0) * 100).toFixed(0)}%)`
        );

      default:
        return this.getStatus('Siap');
    }
  }

  /**
   * Calculate mean standard deviation of hand keypoints across motion history.
   * Mirrors the hand_motion calculation in 05_realtime.py
   */
  private calculateHandMotion(): number {
    const history = this.motionHistory;
    const handStartIdx = 99; // Hand keypoints start at index 99
    const handEndIdx = 225; // End at 225

    // Calculate standard deviation for each hand feature across the history window
    const numFeatures = handEndIdx - handStartIdx;
    let totalStd = 0;

    for (let j = handStartIdx; j < handEndIdx; j++) {
      const values = history.map((frame) => frame[j]);
      const mean = values.reduce((s, v) => s + v, 0) / values.length;
      const variance =
        values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
      totalStd += Math.sqrt(variance);
    }

    return totalStd / numFeatures;
  }

  /**
   * Run model inference on the recorded sequence.
   */
  private async runInference(): Promise<void> {
    if (!this.model) return;

    // Snapshot data sebelum di-reset (karena async)
    const framesSnapshot = [...this.recordedFrames];
    const timestampsSnapshot = [...this.recordedTimestamps];

    try {
      // Preprocess: sample → normalize → level2 features
      const processed = preprocessSequence(
        framesSnapshot,
        timestampsSnapshot
      );

      // Create tensor: (1, 30, 232)
      const inputTensor = tf.tensor3d(
        [processed],
        [1, TARGET_FRAMES, NUM_FEATURES]
      );

      // Run inference
      const output = this.model.predict(inputTensor) as tf.Tensor;
      const probs = await output.data();

      // Find the best prediction
      let maxIdx = 0;
      let maxProb = probs[0];
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > maxProb) {
          maxProb = probs[i];
          maxIdx = i;
        }
      }

      this.lastPrediction = {
        word: VOCABULARY[maxIdx],
        confidence: maxProb,
        classIndex: maxIdx,
        isConfident: maxProb >= CONFIDENCE_THRESHOLD,
      };

      // Analyze gesture feedback
      this.lastFeedback = analyzeGestureFeedback({
        recordedFrames: framesSnapshot,
        recordedTimestamps: timestampsSnapshot,
        confidence: maxProb,
        predictedWord: VOCABULARY[maxIdx],
        targetWord: this.targetWord,
      });

      // Clean up tensors
      inputTensor.dispose();
      output.dispose();
    } catch (err) {
      console.error('Inference error:', err);
      this.lastPrediction = null;
      this.lastFeedback = null;
    }

    // Reset recording state
    this.recordedFrames = [];
    this.recordedTimestamps = [];
    this.idleFrames = 0;
    this.state = 'RESULT';
  }

  private getStatus(statusText: string): DetectionStatus {
    return {
      state: this.state,
      recordedFrames: this.recordedFrames.length,
      maxFrames: MAX_RECORD_FRAMES,
      prediction: this.lastPrediction,
      statusText,
      feedback: this.lastFeedback,
    };
  }

  /** Reset all detection state */
  reset(): void {
    this.state = 'STANDBY';
    this.recordedFrames = [];
    this.recordedTimestamps = [];
    this.motionHistory = [];
    this.idleFrames = 0;
    this.lastPrediction = null;
    this.lastFeedback = null;
  }

  /** Dispose TF.js model */
  dispose(): void {
    this.model?.dispose();
    this.isReady = false;
  }
}
