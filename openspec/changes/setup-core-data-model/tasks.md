# Tasks: 建立核心資料模型

## 1. 型別定義
- [x] T001 定義 `Card` 介面（id, deckId, front, backReading, backMeaning, audioClip, srs）
- [x] T002 定義 `Deck` 介面（id, name, source, sourceUrl, createdAt）
- [x] T003 定義 `SRSCard` 介面（dueDate, stability, difficulty, reps, lastReview）
- [x] T004 定義 `ReviewLog` 介面（cardId, timestamp, passed, recognizedText, similarity, feedback）

## 2. 本機資料庫
- [x] T005 建立 Dexie `FlashcardDB` class，定義 decks/cards/reviewLogs 三張表
- [x] T006 撰寫基本 CRUD 輔助函式（新增/查詢牌組、新增/查詢卡片）
- [x] T007 撰寫最小單元測試，驗證 schema 可正確寫入讀出

## 3. 文件同步
- [ ] T008 確認 `openspec/project.md`、`CLAUDE.md`、`.clinerules` 三份文件的技術棧描述一致
- [ ] T009 在 `openspec/specs/card-deck-model/spec.md` 落地本次 delta（archive 時執行）

> 完成標準：T001-T007 全部勾選，且能在 `youtube-import-pipeline` 與 `practice-flow` 兩個 change 中直接 import 使用這些型別與 db 而不需修改介面。
