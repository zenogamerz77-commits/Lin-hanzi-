export interface UserProgress {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  streakHistory: string[];
  completedLessons: string[]; // lesson ids e.g. "pinyin-1", "stroke-2"
  savedBooks: string[]; // book ids
  watchHistory: string[]; // drama ids or video ids
  completedQuizzes: Record<string, number>; // quizId -> score
  savedVocabulary: string[]; // vocabulary characters
  learningGoal: "casual" | "medium" | "serious" | "insane"; // minutes or XP per day
  onboarded: boolean;
  hskTargetLevel: number; // 1 to 6
}

export interface PinyinSyllable {
  syllable: string;
  initial: string;
  final: string;
  tones: [string, string, string, string]; // e.g. [ "mā", "má", "mǎ", "mà" ]
  examples: { character: string; meaning: string; pinyin: string }[];
}

export interface StrokeCharacter {
  character: string;
  pinyin: string;
  meaning: string;
  strokes: string[]; // animated stroke path directions or descriptions
  strokesCount: number;
  radical: string;
}

export interface RadicalItem {
  radical: string;
  pinyin: string;
  english: string;
  explanation: string;
  examples: { character: string; pinyin: string; meaning: string }[];
}

export interface FlashcardItem {
  id: string;
  character: string;
  pinyin: string;
  meaning: string;
  exampleSentence: string;
  exampleSentencePy: string;
  exampleSentenceEn: string;
  hskLevel: number;
  nextReviewDate: string; // ISO string
  interval: number; // spacing interval in days
  easeFactor: number; // SRS ease factor
  successCount: number;
}

export interface VocabularyItem {
  character: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  audioUrl?: string;
  examples: { cn: string; py: string; en: string }[];
}

export interface BookItem {
  id: string;
  title: string;
  cover: string;
  hskLevel: number;
  category: "story" | "comic" | "short";
  author: string;
  pages: { cn: string; py: string; en: string }[];
  description: string;
}

export interface DramaItem {
  id: string;
  title: string;
  cover: string;
  hskLevel: number;
  category: "Romance" | "School" | "Comedy" | "Historical" | "Action";
  vikiEmbedUrl: string;
  description: string;
  vikiUrl: string;
  scenes: {
    time: string;
    cn: string;
    py: string;
    en: string;
  }[];
}

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  avatar: string;
  content: string;
  category: "General" | "Pinyin" | "HSK" | "Stroke Order" | "Dramas";
  likes: number;
  likedBy: string[]; // userIds
  replies: {
    id: string;
    author: string;
    avatar: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}
