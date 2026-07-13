# Proposal: PWA 離線化與 Android (TWA) 封裝上架

## Why
專案決定主要發布管道為 Google Play，採用 TWA（Trusted Web Activity）路線：完全沿用現有 Web 技術棧封裝成 Android App，不需另外維護原生程式碼分支。這條 change 補齊從「網頁可離線使用」到「能在 Play Store 上架」中間所有必要步驟。

## What Changes
- 撰寫符合 TWA 要求的 PWA Manifest
- 部署到有 HTTPS 的正式網域
- 實作 Service Worker 離線快取（含 whisper 模型檔）
- 用 Bubblewrap 封裝 Android 專案並簽章
- 部署 assetlinks.json 完成網域驗證
- 準備 Google Play 上架素材
- 上架前跑一次 smoke test

## Impact
- Affected capabilities: `android-packaging`（新建）
- Affected code: `public/manifest.json`（新建）、`public/.well-known/assetlinks.json`（新建）、Service Worker 設定、`twa-manifest.json`（Bubblewrap 產生）
- Depends on: `practice-flow`（核心功能需先可用，PWA 才有意義）
- 建議核心練習流程（DeckManager、Card、Recorder、Feedback）至少完成雛形後再開始本 change，避免資源錯置在還沒穩定的殼上
