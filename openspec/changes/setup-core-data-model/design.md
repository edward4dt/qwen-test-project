# Design: 核心資料模型

## 型別設計

```typescript
export interface Card {
  id: string;
  deckId: string;
  front: string;
  backReading: string;
  backMeaning: string;
  audioClip?: Blob;
  srs: SRSCard;
}

export interface SRSCard {
  dueDate: string;       // ISO date
  stability: number;
  difficulty: number;
  reps: number;
  lastReview: string;
}

export interface Deck {
  id: string;
  name: string;
  source: 'manual' | 'youtube';
  sourceUrl?: string;
  createdAt: string;
}

export interface ReviewLog {
  cardId: string;
  timestamp: string;
  passed: boolean;
  recognizedText: string;
  similarity: number;
  feedback: string;
}
```

## 資料庫設計理由
- 用 Dexie 包裝 IndexedDB：型別安全、支援 TypeScript 泛型、避免手寫 IndexedDB 的樣板程式碼
- `audioClip` 存 Blob 而非 URL：確保離線可用，不依賴外部檔案伺服器
- `reviewLogs` 獨立成表而非嵌入 Card：避免卡片物件隨複習次數增加而膨脹，且方便未來做學習分析

## 與其他 change 的介面契約
- `youtube-import-pipeline` 產出的 JSON 必須能直接映射成 `Card`/`Deck`，欄位名稱與型別需完全一致
- `practice-flow` 的所有元件（Card, DeckManager, Feedback）皆以此處定義的型別作為 props 型別依據，不得另外定義相似但不同名的型別
