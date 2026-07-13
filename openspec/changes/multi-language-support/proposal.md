# Proposal: 多語言支援架構（韓語/日語/英語/印尼文）

## Why
專案範圍從「日文/印尼文」擴充為「韓語/日語/英語/印尼文」四種語言。但 `setup-core-data-model`（T001-T007）、`youtube-import-pipeline`（A3 斷詞、A3.5 詞彙解釋）、`practice-flow`（B7 發音規則引擎）這三個 change 目前的設計都是針對日文寫死的：

- `Card`/`Deck` 型別沒有語言欄位，資料層無法區分卡片屬於哪個語言
- A3 斷詞用 fugashi（僅支援日文）
- A3.5 詞彙解釋查詢用 JMdict/Jisho（僅服務日文）
- B7 發音規則引擎的長音/促音/濁音判斷是純日文語音學規則

若不先定義清楚的多語言架構就繼續往下做，之後每加一個語言都要回頭大改，且 B7 這種核心邏輯重寫風險最高。

## What Changes
- `Deck`/`Card` 型別新增 `language` 欄位
- 定義「語言無關框架 + 語言專屬 plugin」的架構模式，套用在斷詞、詞彙解釋查詢、發音規則引擎三處
- 制定 MVP 策略：先用日文把整條流程（匯入→斷詞→查詞義→發音評分→練習）跑通一次作為參考實作，驗證完成後再依序補韓語、英語、印尼文的 plugin
- 更新 `project.md`、`task-order.md` 使其與四語言範圍一致

## Impact
- Affected capabilities: `language-support`（新建，跨切面能力）
- Affected code:
  - `src/types/index.ts`（修改 Deck/Card 型別）— 依賴 `setup-core-data-model`
  - `import-service/tokenizers/`（新建，語言斷詞 plugin 介面）— 影響 `youtube-import-pipeline` 的 A3
  - `import-service/dictionaries/`（新建，語言字典 plugin 介面）— 影響 `youtube-import-pipeline` 的 A3.5
  - `src/lib/pronunciation-engine/`（原本是單一檔案 `pronunciation-engine.ts`，改為資料夾＋語言 plugin）— 影響 `practice-flow` 的 B7
- **重要**：本 change 必須在 `setup-core-data-model` 的 T005（Dexie schema）開始前完成，否則 schema 會少欄位需要重建
- 不影響已完成的 T001-T004（介面定義可直接擴充欄位，不需重寫）
