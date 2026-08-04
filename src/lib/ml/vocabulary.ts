/**
 * BISINDO Sign Language Vocabulary — 50 Classes
 * Synced exactly from the Python training pipeline.
 *
 * Categories:
 *  - Kata Tanya     (Question Words)
 *  - Kata Ganti     (Pronouns)
 *  - Kata Kerja     (Verbs)
 *  - Kata Umum      (Common Words / Greetings)
 *  - Kata Emosi     (Emotion Words)
 */

export const VOCABULARY: string[] = [
  'Apa', 'Bagaimana', 'Dimana', 'Kapan', 'Mengapa', 'Siapa',
  'Dia', 'Kalian', 'Kami', 'Kamu', 'Kita', 'Mereka', 'Saya',
  'Belajar', 'Berdiri', 'Duduk', 'Makan', 'Mandi',
  'Melihat', 'Membaca', 'Menulis', 'Minum', 'Tidur',
  'Anak', 'Asal', 'Ayah', 'Dan', 'Guru', 'Halo',
  'Hari ini', 'Hobi', 'Ibu', 'Keluarga', 'Lagi', 'Malam',
  'Nama', 'Olahraga', 'Pagi', 'Sekian', 'Selamat', 'Siang',
  'Teman', 'Terima kasih',
  'Baik', 'Bingung', 'Marah', 'Ramah', 'Sabar', 'Sedih', 'Senang',
];

export const NUM_CLASSES = 50;
export const TARGET_FRAMES = 30;
export const NUM_FEATURES = 232;

export interface VocabCategory {
  name: string;
  nameEn: string;
  icon: string;
  words: string[];
  color: string;
}

export const CATEGORIES: VocabCategory[] = [
  {
    name: 'Kata Tanya',
    nameEn: 'Question Words',
    icon: '❓',
    words: ['Apa', 'Bagaimana', 'Dimana', 'Kapan', 'Mengapa', 'Siapa'],
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Kata Ganti',
    nameEn: 'Pronouns',
    icon: '👤',
    words: ['Dia', 'Kalian', 'Kami', 'Kamu', 'Kita', 'Mereka', 'Saya'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Kata Kerja',
    nameEn: 'Verbs',
    icon: '🏃',
    words: [
      'Belajar', 'Berdiri', 'Duduk', 'Makan', 'Mandi',
      'Melihat', 'Membaca', 'Menulis', 'Minum', 'Tidur',
    ],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Kata Umum',
    nameEn: 'Common Words',
    icon: '💬',
    words: [
      'Anak', 'Asal', 'Ayah', 'Dan', 'Guru', 'Halo',
      'Hari ini', 'Hobi', 'Ibu', 'Keluarga', 'Lagi', 'Malam',
      'Nama', 'Olahraga', 'Pagi', 'Sekian', 'Selamat', 'Siang',
      'Teman', 'Terima kasih',
    ],
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Kata Sifat',
    nameEn: 'Adjectives',
    icon: '😊',
    words: ['Baik', 'Bingung', 'Marah', 'Ramah', 'Sabar', 'Sedih', 'Senang'],
    color: 'from-rose-500 to-pink-500',
  },
];

/** Get the category a word belongs to */
export function getCategoryForWord(word: string): VocabCategory | undefined {
  return CATEGORIES.find((cat) => cat.words.includes(word));
}

/** Get the index of a word in the vocabulary */
export function getWordIndex(word: string): number {
  return VOCABULARY.indexOf(word);
}
