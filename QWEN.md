# QWEN.md

## 專案簡介
離線優先的韓語/英文/日文/印尼文發音練習 PWA，卡牌形式，支援 YouTube 自動生成牌組、本機端 whisper.cpp 語音辨識與規則引擎評估。**主要發布管道為 Google Play（透過 TWA 封裝），同時保留可直接用瀏覽器安裝的 PWA。**

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
- 遵循 OpenSpec 規格驅動開發 (Spec-Driven Development)，規格文件在 `openspec/` 目錄
- 使用 TypeScript 嚴格模式，所有介面定義在 `types/` 目錄
- **網頁與 Android App 共用同一份程式碼與同一個 origin，Android 端不另外維護程式碼分支**

## PWA / TWA 上架必要條件（Bubblewrap 依賴這些才能封裝）
- **HTTPS**：正式站台必須全站 HTTPS（Vercel 預設符合）
- **Web App Manifest** (`public/manifest.json`)：需包含 `name`、`short_name`、`start_url`、`display: standalone`、`theme_color`、`background_color`、至少一張 512x512 的 icon（建議另備 maskable icon）
- **Service Worker**：需能快取核心資源與 whisper 模型檔，確保離線可開啟；上架前用 Lighthouse PWA 稽核（bubblewrap build 時會自動跑）
- **Digital Asset Links**：`public/.well-known/assetlinks.json`，內容需對應 App 簽章的 SHA-256 憑證指紋，用來讓 TWA 開啟時不顯示網址列
- **麥克風權限**：TWA 走 Chrome Custom Tabs，`getUserMedia` 行為與一般瀏覽器相同，不需要額外 Android 權限宣告，但務必在多台真機（尤其低階機型/舊版 Android）實測麥克風授權流程，避免部分裝置的 Custom Tab 對權限對話框處理不一致
- **版本更新**：PWA 內容更新後，TWA 外殼會透過 Service Worker 自動抓新版本，不需重新上架 App；但若要改 App 圖示、名稱、Manifest 結構等外殼設定，要用 `bubblewrap update` 重新產生並重新上傳到 Play Console

## 命名慣例
- 元件：PascalCase，檔案與元件名稱一致
- hooks：use 開頭 (useRecorder, useWhisper, useSRS)
- 工具函式：camelCase
- API 路由 (Next.js)：`app/api/import/...`

## 常用指令
- 開發：`npm run dev`
- 測試：`npm run test` (Jest + Testing Library)
- 後端匯入服務：`cd import-service && uvicorn main:app --reload`
- **初始化 Android 專案：`npx @bubblewrap/cli init --manifest https://<你的網域>/manifest.json`**
- **建置 Android App：`npx @bubblewrap/cli build`**（輸出 `app-release-signed.apk` 與可上傳 Play Store 的 `.aab`）
- **更新 Android 外殼設定：`npx @bubblewrap/cli update`**

## 關鍵檔案路徑
- OpenSpec 規格：`/openspec/`（含 `project.md`、`AGENTS.md`、`changes/`、`specs/`）
- Whisper 相關：`/src/lib/whisper/`
- 規則引擎：`/src/lib/pronunciation-engine.ts`
- SRS：`/src/lib/srs.ts`
- 卡牌元件：`/src/components/Card/`
- **PWA Manifest：`/public/manifest.json`**
- **Digital Asset Links：`/public/.well-known/assetlinks.json`**
- **Bubblewrap 專案設定（build 產生）：`/twa-manifest.json`**
- **Android Keystore（不進版控）：`/android.keystore`**

## 目錄結構建議
```
FluentClip/
├── QWEN.md
├── README.md
├── openspec/
│   ├── project.md           # 技術棧與慣例
│   ├── AGENTS.md            # AI 助手工作流程
│   ├── changes/             # 進行中的變更提案
│   │   ├── setup-core-data-model
│   │   ├── youtube-import-pipeline
│   │   ├── practice-flow
│   │   └── pwa-android-packaging
│   └── specs/               # 已確立的能力規格
├── public/
│   ├── manifest.json
│   ├── .well-known/
│   │   └── assetlinks.json
│   └── models/              # whisper 模型檔 (ggml-tiny.bin)
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/
│   │   ├── Card/
│   │   ├── Recorder/
│   │   ├── Feedback/
│   │   └── DeckManager/
│   ├── hooks/
│   │   ├── useRecorder.ts
│   │   ├── useWhisper.ts
│   │   └── useDeck.ts
│   ├── lib/
│   │   ├── whisper/         # whisper.cpp WASM 加載與推理
│   │   ├── pronunciation-engine.ts
│   │   ├── srs.ts
│   │   ├── db.ts            # Dexie 設定
│   │   └── tts.ts
│   ├── types/
│   │   └── index.ts
│   └── workers/
│       └── whisper.worker.ts
├── import-service/           # Python 後端 (獨立)
├── android/                  # bubblewrap init 產生的 Android 專案（可用 Android Studio 開啟）
└── package.json
```

## 上架流程備忘
1. 網頁版先在 Vercel 部署穩定，確認 manifest.json / service worker 通過 Lighthouse PWA 稽核
2. `bubblewrap init` 產生 Android 專案，過程會要求輸入簽章金鑰資訊
3. 取得產生的 SHA-256 指紋，填入 `assetlinks.json` 並部署到正式站台
4. `bubblewrap build` 產生 `.aab`，上傳到 Google Play Console
5. 之後功能更新只需重新部署網頁版，App 外殼原則上不需要重新上架

## 給 Qwen 的特別指引
- 本專案採用 **OpenSpec Spec-Driven Development**，進行任何功能開發前請先查閱 `openspec/` 目錄下的規格文件
- 若發現規格與實作不一致，優先以 `openspec/specs/` 中的已確立規格為準
- 進行中的變更提案位於 `openspec/changes/`，開發新功能前請檢查是否有相關的變更提案
- 遵循 `openspec/AGENTS.md` 中定義的 AI 助手工作流程
- 所有核心功能必須保持離線可用，避免將語音資料上傳至伺服器
- Android TWA 與 PWA 共用同一份程式碼，不要建立獨立的 Android 程式碼分支
