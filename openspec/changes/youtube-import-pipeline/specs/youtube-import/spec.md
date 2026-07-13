## ADDED Requirements

### Requirement: 非同步匯入端點
系統 SHALL 提供一個非同步的匯入端點，接收 YouTube 網址後立即回傳任務識別碼，不得讓呼叫端同步等待整個解析流程完成。

#### Scenario: 使用者提交匯入請求
- **WHEN** 使用者在前端提交一支 YouTube 網址
- **THEN** 系統 SHALL 立即回傳 `task_id`，並在背景執行下載、辨識、斷詞、裁切、組裝流程

#### Scenario: 前端查詢匯入進度
- **WHEN** 前端帶著 `task_id` 查詢 `/api/task/{task_id}`
- **THEN** 系統 SHALL 回傳目前狀態（pending/processing/done/failed）與必要的錯誤訊息（若失敗）

### Requirement: 卡片資料完整性
系統產生的每張卡片 SHALL 包含文字、讀音、意思三項文字資料，缺少任一項時不得標記為可用卡片。

#### Scenario: 詞彙查無解釋
- **WHEN** 詞彙解釋查詢找不到任何中文/英文解釋
- **THEN** 系統 SHALL 將該詞彙標記為待人工校對，不直接產生沒有意思欄位的卡片

### Requirement: 音檔裁切時間戳來源
系統 SHALL 根據來源是否提供字幕，選擇對應的時間戳來源進行音檔裁切。

#### Scenario: 影片有內建字幕
- **WHEN** 目標影片含有 YouTube 內建字幕
- **THEN** 系統 SHALL 直接使用字幕提供的時間戳進行裁切，不需額外呼叫語音辨識

#### Scenario: 影片無字幕
- **WHEN** 目標影片沒有可用字幕
- **THEN** 系統 SHALL 先透過 whisper.cpp 產生逐字稿與時間戳，再進行裁切
