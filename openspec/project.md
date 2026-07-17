# Project Context

## 專案簡介
離線優先的韓語/英文/日文/印尼文發音練習 PWA，卡牌形式，支援 YouTube 自動生成牌組、本機端 whisper.cpp 語音辨識與規則引擎評估。**主要發布管道為 Google Play（透過 TWA 封裝），同時保留可直接用瀏覽器安裝的 PWA。**

### 語言支援策略
- **階段一（MVP）**：完整實作日文（斷詞、字典查詢、發音規則）
- **階段三**：擴充韓語、英語、印尼文的 plugin 實作
- 所有語言共用同一套 plugin 架構，依 `Deck.language` 動態載入對應規則

## 技術棧
- 前端：Next.js (App Router) + TypeScript + Tailwind CSS
- 狀態管理：React Context + useReducer
- 本機資料庫：IndexedDB (Dexie.js)
- 語音辨識：whisper.cpp 編譯為 WASM，於 Web Worker 執行
- TTS：Web Speech API (SpeechSynthesis)
- 後端（僅匯入用）：Python FastAPI + yt-dlp + fugashi
- Web 部署：Vercel (前端), Railway (匯入服務)
- **Android 封裝：Bubblewrap CLI（Google 官方工具，基於 Trusted Web Activity）**
- **App 簽章：Android Keystore（bubblewrap 產生或既有金鑰）**

## 架構原則
- 所有核心功能必須離線可用，語音處理不上傳伺服器
- 元件拆分：Card, Recorder, Feedback, DeckManager, ImportPanel
- 遵循規格文件 `spec.md` (Spec-Driven Development)
- 使用 TypeScript 嚴格模式，所有介面定義在 `types/` 目錄
- **網頁與 Android App 共用同一份程式碼與同一個 origin，Android 端不另外維護程式碼分支**

## 命名慣例
- 元件：PascalCase，檔案與元件名稱一致
- hooks：use 開頭 (useRecorder, useWhisper, useSRS)
- 工具函式：camelCase
- API 路由 (Next.js)：`app/api/import/...`

## 常用指令
- 開發：`npm run dev`
- 測試：`npm run test` (Jest + Testing Library)
- 後端匯入服務：`cd import-service && uvicorn main:app --reload`
- 初始化 Android 專案：`npx @bubblewrap/cli init --manifest https://<你的網域>/manifest.json`
- 建置 Android App：`npx @bubblewrap/cli build`
- 更新 Android 外殼設定：`npx @bubblewrap/cli update`

## 關鍵檔案路徑
- 規格：`/openspec/project.md`
- Whisper 相關：`/src/lib/whisper/`
- 規則引擎：`/src/lib/pronunciation-engine.ts`
- SRS：`/src/lib/srs.ts`
- 卡牌元件：`/src/components/Card/`
- **PWA Manifest**：`/public/manifest.json`
- **Digital Asset Links**：`/public/.well-known/assetlinks.json`
- **Bubblewrap 專案設定（build 產生）**：`/twa-manifest.json`
- **Android Keystore（不進版控）**：`/android.keystore`

## 與其他 AI 協作設定的關係
本專案同時維護 `CLAUDE.md`（給 Claude Code）與 `.clinerules`（給 Cline + Groq 模型）。這兩份檔案內容需與本文件保持一致；技術棧或慣例變動時三者需同步更新。
