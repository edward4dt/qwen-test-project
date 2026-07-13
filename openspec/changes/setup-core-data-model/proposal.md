# Proposal: 建立核心資料模型（Card/Deck 契約）

## Why
前期資料收集（YouTube → 卡片）與前端練習流程兩條開發線要能真正平行進行，必須先有一份雙方都遵守的資料契約。目前專案尚無任何型別定義與本機資料庫 schema，所有後續工作都會卡在這裡。

## What Changes
- 定義 `Card`、`Deck`、`SRSCard`、`ReviewLog` TypeScript 介面
- 建立 IndexedDB（Dexie）schema，對應上述介面
- 建立 `openspec/project.md`、`CLAUDE.md`、`.clinerules` 三份文件的同步機制說明

## Impact
- Affected capabilities: `card-deck-model`（新建）
- Affected code: `src/types/index.ts`（新建）、`src/lib/db.ts`（新建）
- 這是所有其他 change（youtube-import-pipeline、practice-flow）的前置依賴，建議第一個完成
