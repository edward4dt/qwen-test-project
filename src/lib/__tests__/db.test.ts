/**
 * 資料庫單元測試
 * 依據 openspec/changes/setup-core-data-model/tasks.md T007
 * 驗證 schema 可正確寫入讀出
 */

import { db, createDeck, getDeck, getAllDecks, createCard, getCard, getCardsByDeck, createReviewLog, getReviewLogsByCard } from '../db';
import type { Card, Deck, ReviewLog } from '../../types';

describe('FlashcardDB', () => {
  const testDeck: Deck = {
    id: 'deck-001',
    name: '測試牌組',
    source: 'YouTube Test',
    sourceUrl: 'https://youtube.com/watch?v=test',
    createdAt: new Date('2024-01-01'),
    language: 'ja',
  };

  const testCard: Card = {
    id: 'card-001',
    deckId: 'deck-001',
    front: '猫',
    backReading: 'ねこ',
    backMeaning: '貓',
    audioClip: '/audio/cat.mp3',
    language: 'ja',
  };

  const testReviewLog: Omit<ReviewLog, 'id'> = {
    cardId: 'card-001',
    timestamp: new Date('2024-01-02'),
    passed: true,
    recognizedText: 'ねこ',
    similarity: 0.95,
    feedback: '發音正確',
  };

  beforeEach(async () => {
    // 清空所有表
    await db.decks.clear();
    await db.cards.clear();
    await db.reviewLogs.clear();
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Deck 操作', () => {
    it('T005-T006: 應能新增並查詢牌組', async () => {
      await createDeck(testDeck);
      const result = await getDeck('deck-001');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('deck-001');
      expect(result?.name).toBe('測試牌組');
      expect(result?.language).toBe('ja');
    });

    it('T005-T006: 應能查詢所有牌組', async () => {
      const deck2: Deck = {
        ...testDeck,
        id: 'deck-002',
        name: '第二個牌組',
        language: 'ko',
      };
      
      await createDeck(testDeck);
      await createDeck(deck2);
      
      const allDecks = await getAllDecks();
      expect(allDecks).toHaveLength(2);
    });

    it('T005-T006: 應能依語言查詢牌組', async () => {
      const koDeck: Deck = {
        ...testDeck,
        id: 'deck-ko',
        name: '韓文牌組',
        language: 'ko',
      };
      
      await createDeck(testDeck);
      await createDeck(koDeck);
      
      const jaDecks = await db.decks.where('language').equals('ja').toArray();
      expect(jaDecks).toHaveLength(1);
      expect(jaDecks[0].language).toBe('ja');
    });
  });

  describe('Card 操作', () => {
    beforeEach(async () => {
      await createDeck(testDeck);
    });

    it('T005-T006: 應能新增並查詢卡片', async () => {
      await createCard(testCard);
      const result = await getCard('card-001');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('card-001');
      expect(result?.front).toBe('猫');
      expect(result?.backReading).toBe('ねこ');
      expect(result?.language).toBe('ja');
    });

    it('T005-T006: 應能依牌組 ID 查詢卡片', async () => {
      const card2: Card = {
        ...testCard,
        id: 'card-002',
        front: '犬',
        backReading: 'いぬ',
      };
      
      await createCard(testCard);
      await createCard(card2);
      
      const cards = await getCardsByDeck('deck-001');
      expect(cards).toHaveLength(2);
      expect(cards.map(c => c.id)).toContain('card-001');
      expect(cards.map(c => c.id)).toContain('card-002');
    });

    it('T001-T002: Card 介面應包含 language 欄位', () => {
      expect(testCard.language).toBe('ja');
    });

    it('T001-T002: Deck 介面應包含 language 欄位', () => {
      expect(testDeck.language).toBe('ja');
    });
  });

  describe('ReviewLog 操作', () => {
    beforeEach(async () => {
      await createDeck(testDeck);
      await createCard(testCard);
    });

    it('T005-T006: 應能新增並查詢複習記錄', async () => {
      const logId = await createReviewLog(testReviewLog);
      const logs = await getReviewLogsByCard('card-001');
      
      expect(logs).toHaveLength(1);
      expect(logs[0].cardId).toBe('card-001');
      expect(logs[0].passed).toBe(true);
      expect(logs[0].similarity).toBe(0.95);
    });

    it('T004: ReviewLog 介面應包含所有必要欄位', () => {
      expect(testReviewLog).toHaveProperty('cardId');
      expect(testReviewLog).toHaveProperty('timestamp');
      expect(testReviewLog).toHaveProperty('passed');
      expect(testReviewLog).toHaveProperty('recognizedText');
      expect(testReviewLog).toHaveProperty('similarity');
      expect(testReviewLog).toHaveProperty('feedback');
    });
  });

  describe('Schema 驗證', () => {
    it('T007: 應能正確寫入並讀出完整資料', async () => {
      // 寫入完整資料流
      await createDeck(testDeck);
      await createCard(testCard);
      await createReviewLog(testReviewLog);
      
      // 驗證關聯查詢
      const deck = await getDeck('deck-001');
      const cards = await getCardsByDeck('deck-001');
      const logs = await getReviewLogsByCard('card-001');
      
      expect(deck).toBeDefined();
      expect(cards).toHaveLength(1);
      expect(logs).toHaveLength(1);
      expect(cards[0].deckId).toBe(deck?.id);
      expect(logs[0].cardId).toBe(testCard.id);
    });
  });
});
