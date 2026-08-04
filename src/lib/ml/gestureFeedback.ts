/**
 * Gesture Feedback Engine
 *
 * Menganalisis data keypoint hasil rekaman dan menghasilkan umpan balik
 * yang actionable mengenai kualitas gerakan user.
 *
 * Feedback didasarkan pada:
 *  - Kecepatan gerakan (velocity, jumlah frame)
 *  - Jarak antar tangan (wrist distance)
 *  - Deteksi tangan (1 vs 2 tangan)
 *  - Tingkat keyakinan model
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackType = 'success' | 'warning' | 'info' | 'tip';

export interface FeedbackItem {
  type: FeedbackType;
  message: string;
}

export interface GestureFeedback {
  items: FeedbackItem[];
  /** Overall score 0–100. Dihitung dari berbagai aspek kualitas gerakan. */
  overallScore: number;
  /** Skor per-dimensi 0–100 untuk panel breakdown */
  breakdown: {
    speedScore: number;       // durasi/kecepatan gerakan
    velocityScore: number;    // kelancaran gerakan
    handPosScore: number;     // posisi & jumlah tangan
    confidenceScore: number;  // keyakinan model
  };
}

// ─── Live Feedback (during RECORDING) ────────────────────────────────────────

export interface LiveFeedback {
  speedLabel: 'too_fast' | 'good' | 'too_slow' | null;
  handsVisible: boolean;
  bothHandsVisible: boolean;
}

/**
 * Menghasilkan feedback instan (live) saat gerakan sedang direkam.
 * Dipanggil setiap frame dengan data history terkini.
 *
 * @param recentVelocityMag  Rata-rata magnitude velocity 3 frame terakhir
 * @param handednessSnapshot Array handedness dari frame terakhir
 */
export function analyzeLiveFeedback(
  recentVelocityMag: number,
  handednessSnapshot: string[]
): LiveFeedback {
  const handsVisible = handednessSnapshot.length > 0;
  const bothHandsVisible = handednessSnapshot.length >= 2;

  let speedLabel: LiveFeedback['speedLabel'] = null;
  if (recentVelocityMag > 0.18) {
    speedLabel = 'too_fast';
  } else if (recentVelocityMag > 0.01) {
    speedLabel = 'good';
  }

  return { speedLabel, handsVisible, bothHandsVisible };
}

// ─── Post-inference Feedback ──────────────────────────────────────────────────

interface AnalyzeOptions {
  recordedFrames: number[][];         // raw keypoints tiap frame (225 dim)
  recordedTimestamps: number[];       // timestamp tiap frame (ms)
  confidence: number;                 // confidence prediksi 0–1
  predictedWord: string;             // label prediksi
  targetWord?: string;               // kata target (jika mode latihan)
}

/**
 * Menganalisis satu sesi rekaman dan menghasilkan daftar feedback item.
 */
export function analyzeGestureFeedback(opts: AnalyzeOptions): GestureFeedback {
  const { recordedFrames, recordedTimestamps, confidence, predictedWord, targetWord } = opts;
  const items: FeedbackItem[] = [];
  const numFrames = recordedFrames.length;

  // ── 1. Analisis Durasi / Kecepatan ──────────────────────────────────────
  let speedScore = 100;
  if (numFrames < 20) {
    items.push({
      type: 'warning',
      message: 'Gerakan terlalu cepat — coba lakukan lebih lambat dan jelas.',
    });
    speedScore = 40;
  } else if (numFrames > 65) {
    items.push({
      type: 'warning',
      message: 'Gerakan terlalu lama — persingkat dan pertegas gerakan.',
    });
    speedScore = 60;
  } else if (numFrames >= 20 && numFrames <= 50) {
    items.push({
      type: 'success',
      message: 'Durasi gerakan sudah tepat!',
    });
  }

  // ── 2. Analisis Kecepatan (velocity) ─────────────────────────────────────
  const avgSpeed = computeAverageSpeed(recordedFrames, recordedTimestamps);
  let velocityScore = 100;
  if (avgSpeed > 0.15) {
    items.push({
      type: 'warning',
      message: 'Gerakan terlalu kasar atau tergesa-gesa — perlambat kecepatan tangan.',
    });
    velocityScore = 50;
  }

  // ── 3. Analisis Jarak Kedua Tangan ────────────────────────────────────────
  const { avgDist, onlyOneHandActive } = computeWristStats(recordedFrames);
  let handPosScore = 100;

  if (onlyOneHandActive) {
    items.push({
      type: 'info',
      message: 'Hanya satu tangan terdeteksi — pastikan kedua tangan terlihat jelas di kamera.',
    });
    handPosScore = 60;
  } else if (avgDist > 0) {
    if (avgDist > 1.5) {
      items.push({
        type: 'warning',
        message: 'Posisi kedua tangan terlalu lebar — dekatkan sedikit posisi tangan.',
      });
      handPosScore = 60;
    } else if (avgDist < 0.15) {
      items.push({
        type: 'info',
        message: 'Posisi kedua tangan sangat berdekatan — pastikan isyarat memerlukan posisi ini.',
      });
      handPosScore = 80;
    }
  }

  // ── 4. Analisis Confidence (Keyakinan Model) ──────────────────────────────
  let confidenceScore = 0;
  if (confidence >= 0.85) {
    confidenceScore = 100;
    items.push({
      type: 'success',
      message: `Gerakan sangat jelas — model yakin ${(confidence * 100).toFixed(0)}%.`,
    });
  } else if (confidence >= 0.65) {
    confidenceScore = 80;
    // Sudah ditangani oleh ResultDisplay (isConfident = true)
  } else if (confidence >= 0.45) {
    confidenceScore = 50;
    items.push({
      type: 'info',
      message: `Gerakan hampir menyerupai "${predictedWord}" — perjelas posisi jari dan pergelangan tangan.`,
    });
  } else {
    confidenceScore = 20;
    items.push({
      type: 'warning',
      message: 'Gerakan belum dikenali dengan baik — pastikan tangan terlihat penuh dan pencahayaan cukup.',
    });
  }

  // ── 5. Feedback Target Word (mode latihan) ────────────────────────────────
  if (targetWord) {
    if (confidence >= 0.65 && predictedWord === targetWord) {
      items.push({
        type: 'success',
        message: `Tepat! Isyarat "${targetWord}" berhasil dikenali.`,
      });
    } else if (confidence >= 0.45 && predictedWord !== targetWord) {
      items.push({
        type: 'info',
        message: `Target "${targetWord}", terdeteksi "${predictedWord}" — ulangi dan sesuaikan gerakan.`,
      });
    }
  }

  // ── 6. Tips Umum ─────────────────────────────────────────────────────────
  if (items.length === 0) {
    items.push({
      type: 'tip',
      message: 'Pastikan pencahayaan cukup dan latar belakang polos untuk hasil terbaik.',
    });
  }

  // ── Overall Score ─────────────────────────────────────────────────────────
  const overallScore = Math.round(
    (speedScore * 0.2 + velocityScore * 0.2 + handPosScore * 0.2 + confidenceScore * 0.4)
  );

  return {
    items,
    overallScore,
    breakdown: { speedScore, velocityScore, handPosScore, confidenceScore },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Hitung rata-rata magnitude kecepatan pergelangan tangan
 * berdasarkan delta posisi tiap frame (225-dim raw keypoints).
 *
 * Indeks wrist di raw keypoints (sebelum normalisasi):
 *   - Left wrist (pose idx 15): 15*3 = 45..47
 *   - Right wrist (pose idx 16): 16*3 = 48..50
 */
function computeAverageSpeed(frames: number[][], timestamps: number[]): number {
  if (frames.length < 2) return 0;

  const LW = 45; // left wrist x index
  const RW = 48; // right wrist x index
  const TRAIN_DT = 33.33;

  let totalMag = 0;
  let count = 0;

  for (let i = 1; i < frames.length; i++) {
    const dt = Math.max(timestamps[i] - timestamps[i - 1], 1);
    const scale = TRAIN_DT / dt;

    const dLx = (frames[i][LW] - frames[i - 1][LW]) * scale;
    const dLy = (frames[i][LW + 1] - frames[i - 1][LW + 1]) * scale;
    const dRx = (frames[i][RW] - frames[i - 1][RW]) * scale;
    const dRy = (frames[i][RW + 1] - frames[i - 1][RW + 1]) * scale;

    const magL = Math.sqrt(dLx ** 2 + dLy ** 2);
    const magR = Math.sqrt(dRx ** 2 + dRy ** 2);

    totalMag += (magL + magR) / 2;
    count++;
  }

  return count > 0 ? totalMag / count : 0;
}

/**
 * Hitung rata-rata jarak antar pergelangan tangan (wrist distance)
 * dan deteksi apakah hanya satu tangan yang aktif.
 *
 * Hand wrist indeks di raw 225-dim array:
 *   - Left hand wrist  (hand idx 0):  99..101
 *   - Right hand wrist (hand idx 0): 162..164
 */
function computeWristStats(frames: number[][]): {
  avgDist: number;
  onlyOneHandActive: boolean;
} {
  const LWX = 99;  // left hand wrist x
  const RWX = 162; // right hand wrist x

  let totalDist = 0;
  let distCount = 0;
  let leftActiveFrames = 0;
  let rightActiveFrames = 0;

  for (const frame of frames) {
    const lx = frame[LWX], ly = frame[LWX + 1], lz = frame[LWX + 2];
    const rx = frame[RWX], ry = frame[RWX + 1], rz = frame[RWX + 2];

    const leftPresent = !(lx === 0 && ly === 0 && lz === 0);
    const rightPresent = !(rx === 0 && ry === 0 && rz === 0);

    if (leftPresent) leftActiveFrames++;
    if (rightPresent) rightActiveFrames++;

    if (leftPresent && rightPresent) {
      const dist = Math.sqrt((lx - rx) ** 2 + (ly - ry) ** 2 + (lz - rz) ** 2);
      totalDist += dist;
      distCount++;
    }
  }

  const avgDist = distCount > 0 ? totalDist / distCount : 0;
  const totalFrames = frames.length;
  const leftRatio = leftActiveFrames / totalFrames;
  const rightRatio = rightActiveFrames / totalFrames;

  // Satu tangan aktif jika salah satu ratio < 30% dan yang lain > 50%
  const onlyOneHandActive =
    (leftRatio > 0.5 && rightRatio < 0.3) ||
    (rightRatio > 0.5 && leftRatio < 0.3);

  return { avgDist, onlyOneHandActive };
}
