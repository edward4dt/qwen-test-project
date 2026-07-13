# Design: PWA 離線化與 Android (TWA) 封裝上架

## 為什麼選 TWA 而非原生/跨平台
專案技術棧已經是 Next.js PWA，TWA 讓我們完全沿用同一份程式碼與同一個 origin 封裝成 Android App，不需要重寫成 Kotlin 或 React Native，是側專案在有限心力下最務實的路線。

## TWA 上架依賴鏈

```
manifest.json (T301)
     │
     ▼
部署 HTTPS 正式網域 (T302) ──┐
     │                        │
     ▼                        │
Service Worker 離線快取 (T303) │
     │                        │
     ▼                        │
Lighthouse 稽核 (T304)         │
     │                        ▼
     └──────────────► bubblewrap init (T305)
                              │
                              ▼
                    assetlinks.json 部署 (T306)
                              │
                              ▼
                    bubblewrap build (T307)
                              │
                              ▼
                    真機測試 (T308)
                              │
                              ▼
                    Play Console 上架 (T309-T311)
```

## 麥克風權限風險
TWA 走 Chrome Custom Tabs，`getUserMedia` 行為理論上與一般瀏覽器相同，不需要額外 Android 權限宣告。但不同機型/舊版 Android 的 Custom Tab 對權限對話框處理可能不一致，這是本專案核心功能（錄音評分），T308 務必實測多台裝置，不能只靠模擬器或單一測試機判斷過關。

## 更新機制
PWA 內容更新後，TWA 外殼會透過 Service Worker 自動抓新版本，不需重新上架 App；但若要改 App 圖示、名稱、Manifest 結構等外殼設定，要用 `bubblewrap update` 重新產生並重新上傳到 Play Console。
