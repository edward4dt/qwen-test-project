# Proposal: YouTube 解析匯入卡片流程

## Why
使用者需要能貼上一支日文/印尼文 YouTube 影片網址，自動產生一副可練習發音的卡牌，而不用手動輸入詞彙。這是內容供給端，沒有這條流程前端就沒有真實資料可用。

## What Changes
- 下載 YouTube 音訊與（若有）字幕
- 無字幕時用 whisper.cpp 產生逐字稿與時間戳
- 日文斷詞、詞彙篩選、詞彙解釋查詢
- 依時間戳裁切單詞/例句音檔
- 組裝成符合 `Card`/`Deck` 介面的 JSON
- 提供 FastAPI 非同步匯入端點供前端呼叫
- 提供極簡人工校對頁面

## Impact
- Affected capabilities: `youtube-import`（新建）
- Affected code: `import-service/`（新建 Python 服務）、`src/app/api/import/`（前端呼叫端點/輪詢邏輯）
- Depends on: `setup-core-data-model`（需要 Card/Deck 型別已定義）
- 不影響現有能力（本專案為 greenfield，尚無現有能力需要修改）
