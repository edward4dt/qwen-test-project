## ADDED Requirements

### Requirement: Card Data Structure
系統 SHALL 以 `Card` 型別儲存每張卡片，且必須包含文字、讀音、意思，音檔為選填欄位。

#### Scenario: 匯入流程產生卡片
- **WHEN** YouTube 匯入流程完成一筆詞彙的解析
- **THEN** 系統 SHALL 產生一個符合 `Card` 介面的物件，`front`、`backReading`、`backMeaning` 三欄位皆不可為空

### Requirement: Deck 來源追蹤
系統 SHALL 記錄每個牌組的來源類型（manual 或 youtube），若來源為 youtube 則必須保留原始網址。

#### Scenario: 手動建立牌組
- **WHEN** 使用者在 App 內手動建立新牌組
- **THEN** `source` 欄位 SHALL 設為 `manual`，`sourceUrl` SHALL 為空

#### Scenario: YouTube 匯入建立牌組
- **WHEN** 使用者透過 YouTube 網址匯入建立新牌組
- **THEN** `source` 欄位 SHALL 設為 `youtube`，`sourceUrl` SHALL 記錄原始影片網址

### Requirement: 本機持久化
系統 SHALL 將所有卡片、牌組、複習紀錄儲存在 IndexedDB，離線時仍可完整讀寫。

#### Scenario: 離線開啟 App
- **WHEN** 使用者在無網路連線狀態下開啟 App
- **THEN** 系統 SHALL 能正常列出已匯入的牌組與卡片，不因缺乏網路而顯示空白或錯誤

## Implementation Details

### Type Definitions (`/src/types/index.ts`)

#### LanguageCode
```typescript
export type LanguageCode = 'ja' | 'ko' | 'en' | 'id';
```

#### SRSCard
```typescript
export interface SRSCard {
  dueDate: Date;
  stability: number;
  difficulty: number;
  reps: number;
  lastReview: Date | null;
}
```

#### ReviewLog
```typescript
export interface ReviewLog {
  cardId: string;
  timestamp: Date;
  passed: boolean;
  recognizedText: string;
  similarity: number;
  feedback: string;
}
```

#### Card
```typescript
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
```

#### Deck
```typescript
export interface Deck {
  id: string;
  name: string;
  source: string;          // 來源（例如：YouTube 影片標題）
  sourceUrl?: string;      // 來源 URL（可選）
  createdAt: Date;
  language: LanguageCode;  // 牌組主要語言
}
```

### Database Schema (`/src/lib/db.ts`)

#### Database Name: `FlashcardDB`

#### Tables and Indexes
```typescript
{
  decks: 'id, name, language',
  cards: 'id, deckId, language',
  reviewLogs: '++id, cardId, timestamp',
}
```

#### CRUD Operations

**Deck Operations:**
- `createDeck(deck: Deck): Promise<void>`
- `getDeck(id: string): Promise<Deck | undefined>`
- `getAllDecks(): Promise<Deck[]>`
- `getDecksByLanguage(language: string): Promise<Deck[]>`

**Card Operations:**
- `createCard(card: Card): Promise<void>`
- `getCard(id: string): Promise<Card | undefined>`
- `getCardsByDeck(deckId: string): Promise<Card[]>`
- `getCardsByLanguage(language: string): Promise<Card[]>`

**ReviewLog Operations:**
- `createReviewLog(log: Omit<ReviewLog, 'id'>): Promise<number>`
- `getReviewLogsByCard(cardId: string): Promise<ReviewLog[]>`
