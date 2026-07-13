# FluentClip

📱 離線優先的多語言發音練習 PWA / Android App

> 貼上 YouTube 影片網址，自動產生發音練習卡牌；本機端語音辨識即時評分，完全不需要網路連線。

## 專案簡介

FluentClip 是離線優先的韓語、英文、日文、印尼文發音練習應用，以卡牌形式呈現學習內容。

**核心特色：**
- **YouTube 自動生成牌組** — 貼上影片網址即可自動下載音訊、轉錄字幕、斷詞篩選、裁切音檔
- **本機端語音辨識** — whisper.cpp WASM 於瀏覽器 Web Worker 執行，語音資料不上傳伺服器
- **規則引擎評估** — 針對各語言發音特點進行細緻評分
- **SRS 間隔重複** — 內建複習排程演算法
- **完整離線支援** — Service Worker 快取核心資源與模型檔

主要發布管道為 **Google Play（TWA 封裝）**，同時保留 PWA 瀏覽器安裝版本。網頁與 Android App 共用同一份程式碼。

## 核心功能

| 功能 | 說明 |
|------|------|
| 🎴 卡牌式練習 | 翻面顯示詞彙、讀音、意思，搭配錄音與即時回饋 |
| 📺 YouTube 匯入 | 下載音訊 → 轉錄 → 斷詞 → 裁切音檔 → 產生牌組 |
| 🧠 SRS 排程 | 間隔重複演算法，自動計算下次複習日期 |
| 🎙️ 本機語音辨識 | whisper.cpp WASM，隱私安全 |
| 🔊 TTS 標準發音 | Web Speech API 播放標準發音 |
| 📡 離線優先 | Service Worker 快取，離線可用 |

## 技術棧

**前端：** Next.js (App Router) + TypeScript + Tailwind CSS + React Context + Dexie.js (IndexedDB) + whisper.cpp WASM + Web Speech API

**後端（僅匯入用）：** Python FastAPI + yt-dlp + fugashi + BackgroundTasks

**部署：** Vercel (前端) + Railway (匯入服務) + Bubblewrap CLI (Android TWA)

## 架構概覽

```
使用者端 (瀏覽器 / Android)
├── Deck Manager / Card / Recorder / Feedback
├── IndexedDB (Dexie.js) — Cards, Decks, ReviewLogs, SRS
├── Web Worker: whisper.cpp WASM (本機語音辨識)
└── Service Worker (離線快取)
         │
         │ API 呼叫（僅匯入時需要網路）
         ▼
   後端匯入服務
   ├── yt-dlp (下載)
   ├── Whisper (轉錄)
   └── fugashi (斷詞)
```

**關鍵原則：** 除了 YouTube 匯入的後端批次步驟外，所有使用者互動功能都必須能離線運作。

## 快速開始

### 環境需求
- Node.js 20.19.0+
- npm（或 pnpm / yarn）
- Python 3.10+（僅後端匯入服務需要）

### 前端開發
```bash
npm install
npm run dev    # http://localhost:3000
npm run test
```

### 後端匯入服務
```bash
cd import-service
uvicorn main:app --reload
```

### Android 封裝
```bash
# 初始化（需先部署到有 HTTPS 的正式網域）
npx @bubblewrap/cli init --manifest https://<你的網域>/manifest.json

# 建置（產生 apk 與 aab）
npx @bubblewrap/cli build

# 更新外殼設定
npx @bubblewrap/cli update
```

## 專案結構

```
FluentClip/
├── openspec/                 # OpenSpec 規格文件（SDD）
│   ├── project.md            # 技術棧與慣例
│   ├── AGENTS.md             # AI 助手工作流程
│   ├── changes/              # 進行中的變更提案
│   └── specs/                # 已確立的能力規格
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # React 元件
│   │   ├── Card/             # 卡牌
│   │   ├── Recorder/         # 錄音
│   │   ├── Feedback/         # 回饋
│   │   └── DeckManager/      # 牌組管理
│   ├── hooks/                # 自訂 Hooks
│   │   ├── useRecorder.ts
│   │   ├── useWhisper.ts
│   │   └── useDeck.ts
│   ├── lib/                  # 核心邏輯
│   │   ├── whisper/          # whisper.cpp WASM
│   │   ├── pronunciation-engine.ts
│   │   ├── srs.ts
│   │   ├── db.ts             # Dexie 設定
│   │   └── tts.ts
│   ├── types/                # TypeScript 介面
│   │   └── index.ts          # Card, Deck, SRSCard, ReviewLog
│   └── workers/
│       └── whisper.worker.ts
└── import-service/           # Python 後端（獨立）
```

## 開發方法論

本專案採用 [OpenSpec](https://github.com/Fission-AI/OpenSpec) Spec-Driven Development。詳細工作流程參閱 [openspec/AGENTS.md](openspec/AGENTS.md)。

**進行中的變更提案：**
- `setup-core-data-model` — 核心資料模型與 IndexedDB schema
- `youtube-import-pipeline` — YouTube 解析匯入流程
- `practice-flow` — 前端發音練習核心流程
- `pwa-android-packaging` — PWA 離線化與 Android 封裝上架

## 命名慣例

- **元件：** PascalCase
- **Hooks：** use 開頭 (useRecorder, useWhisper, useSRS)
- **工具函式：** camelCase
- **API 路由：** `app/api/import/...`

## 授權

本專案為私人專案，不開放源碼。
