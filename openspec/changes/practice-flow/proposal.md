# Proposal: 前端發音練習核心流程

## Why
這是使用者實際會用到的核心體驗：看卡片、錄音、得到發音回饋、依 SRS 排程複習。這條線可以完全用假資料開發，不需要等 YouTube 匯入流程完成。

## What Changes
- 牌組管理 UI（顯示/選擇/匯入牌組）
- 卡片翻面元件
- 錄音功能
- whisper.cpp WASM 語音辨識整合
- 發音評分技術原型驗證（spike），據此決定規則引擎實作深度
- 發音規則引擎（長音/促音/濁音判斷 + 相似度計算）
- SRS 間隔複習排程
- 回饋 UI
- TTS 標準發音播放

## Impact
- Affected capabilities: `pronunciation-practice`（新建）
- Affected code: `src/components/`、`src/hooks/`、`src/lib/whisper/`、`src/lib/pronunciation-engine.ts`、`src/lib/srs.ts`、`src/lib/tts.ts`、`src/workers/whisper.worker.ts`
- Depends on: `setup-core-data-model`（型別與 db）
- 與 `youtube-import-pipeline` 沒有資料相依，可完全平行開發，僅在 DeckManager 實際串接真實匯入資料時才需要對方完成
