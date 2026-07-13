# Design: YouTube 解析匯入卡片流程

## 流程架構

```
YouTube URL
   │
   ▼
[yt-dlp 下載音訊+字幕] ──(有字幕)──► 直接取得時間戳
   │
   (無字幕)
   ▼
[whisper.cpp 後端批次辨識] ──► 逐字稿 + 時間戳
   │
   ▼
[fugashi 斷詞] ──► 候選詞彙
   │
   ├──► [詞彙篩選規則] ──┐
   └──► [Jisho/JMdict 查詢意思] ──┤
                                  ▼
                        [ffmpeg 音檔裁切]
                                  │
                                  ▼
                    [組裝 Card/Deck JSON]
                                  │
                                  ▼
                    寫入資料庫 / 回傳給前端
```

## 非同步任務設計
YouTube 下載 + 語音辨識 + 斷詞 + 裁切整條流程可能耗時數分鐘，直接同步等待會造成前端或 API 閘道逾時。

- `/api/import` 端點收到請求後立刻建立任務並回傳 `task_id`，實際處理丟給 FastAPI `BackgroundTasks`（side project 規模足夠，之後流量變大可換 Redis Queue/Celery）
- 前端輪詢 `/api/task/{task_id}`，回傳格式包含 `status`（pending/processing/done/failed）與進度百分比
- 任務失敗時需回傳明確錯誤原因（例如「無法下載」「辨識信心過低」），供人工校對頁面參考

## 為什麼詞彙解釋查詢不違反離線優先原則
這一步發生在**內容產製階段**（後端批次處理），不是使用者在 App 內即時互動的路徑。使用者實際練習卡片時，資料已經寫入本機 IndexedDB，不需要再次連網查詢意思。

## 技術風險
- 自動裁切的音檔邊界可能不準（尤其連續說話、無明顯停頓時），這是保留人工校對頁面（T109）的主要原因
- Jisho API 有速率限制，若查詢量大建議優先評估本機 JMdict 字典
