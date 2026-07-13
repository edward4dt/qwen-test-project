/**
 * 核心型別定義
 * 依據 openspec/changes/setup-core-data-model/specs/card-deck-model/spec.md
 */

/**
 * 語言代碼型別
 * 支援的語言：日文、韓語、英語、印尼文
 */
export type LanguageCode = 'ja' | 'ko' | 'en' | 'id';

/**
 * SRS（間隔重複系統）卡片狀態
 */
export interface SRSCard {
  dueDate: Date;
  stability: number;
  difficulty: number;
  reps: number;
  lastReview: Date | null;
}

/**
 * 發音練習回饋記錄
 */
export interface ReviewLog {
  cardId: string;
  timestamp: Date;
  passed: boolean;
  recognizedText: string;
  similarity: number;
  feedback: string;
}

/**
 * 卡片介面
 * 代表單個學習項目（單詞或短句）
 */
export interface Card {
  id: string;
  deckId: string;
  front: string;           // 正面文字（例如：單詞）
  backReading: string;     // 背面讀音
  backMeaning: string;     // 背面意思
  audioClip?: string;      // 音檔路徑或 URL（可選）
  language: LanguageCode;  // 卡片語言
  srs?: SRSCard;           // SRS 狀態（可選）
}

/**
 * 牌組介面
 * 代表一組相關的卡片集合
 */
export interface Deck {
  id: string;
  name: string;
  source: string;          // 來源（例如：YouTube 影片標題）
  sourceUrl?: string;      // 來源 URL（可選）
  createdAt: Date;
  language: LanguageCode;  // 牌組主要語言
}
