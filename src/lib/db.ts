/**
 * IndexedDB 資料庫設定（使用 Dexie.js）
 * 依據 openspec/changes/setup-core-data-model/tasks.md T005-T006
 */

import { Dexie, type Table } from 'dexie';
import type { Card, Deck, ReviewLog } from '../types';

/**
 * FlashcardDB - 本機 IndexedDB 資料庫
 * 包含三張表：decks, cards, reviewLogs
 */
export class FlashcardDB extends Dexie {
  decks!: Table<Deck, string>;
  cards!: Table<Card, string>;
  reviewLogs!: Table<ReviewLog, number>;

  constructor() {
    super('FlashcardDB');
    
    this.version(1).stores({
      decks: 'id, name, language',
      cards: 'id, deckId, language',
      reviewLogs: '++id, cardId, timestamp',
    });
  }
}

// 建立單一實例
export const db = new FlashcardDB();

/**
 * CRUD 輔助函式 - 牌組操作
 */
export async function createDeck(deck: Deck): Promise<void> {
  await db.decks.add(deck);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return await db.decks.get(id);
}

export async function getAllDecks(): Promise<Deck[]> {
  return await db.decks.toArray();
}

export async function getDecksByLanguage(language: string): Promise<Deck[]> {
  return await db.decks.where('language').equals(language).toArray();
}

/**
 * CRUD 輔助函式 - 卡片操作
 */
export async function createCard(card: Card): Promise<void> {
  await db.cards.add(card);
}

export async function getCard(id: string): Promise<Card | undefined> {
  return await db.cards.get(id);
}

export async function getCardsByDeck(deckId: string): Promise<Card[]> {
  return await db.cards.where('deckId').equals(deckId).toArray();
}

export async function getCardsByLanguage(language: string): Promise<Card[]> {
  return await db.cards.where('language').equals(language).toArray();
}

/**
 * CRUD 輔助函式 - 複習記錄操作
 */
export async function createReviewLog(log: Omit<ReviewLog, 'id'>): Promise<number> {
  return await db.reviewLogs.add(log);
}

export async function getReviewLogsByCard(cardId: string): Promise<ReviewLog[]> {
  return await db.reviewLogs.where('cardId').equals(cardId).toArray();
}
