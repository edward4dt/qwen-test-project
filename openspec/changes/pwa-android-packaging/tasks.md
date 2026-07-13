# Tasks: PWA 離線化與 Android (TWA) 封裝上架

## 1. PWA 基礎
- [ ] T301 撰寫 `public/manifest.json`：name、short_name、start_url、display: standalone、theme_color、background_color、512x512 icon（含 maskable icon）
- [ ] T302 部署至 Vercel/Netlify 並綁定自訂網域，確認全站 HTTPS

## 2. 離線快取
- [ ] T303 實作 Service Worker：快取核心資源與 whisper 模型檔（CacheFirst 或 StaleWhileRevalidate）
- [ ] T304 用 Lighthouse PWA 稽核，確認通過離線可開啟的檢測項目

## 3. Android 封裝
- [ ] T305 `bubblewrap init` 產生 Android 專案，取得簽章 SHA-256 指紋
- [ ] T306 部署 `public/.well-known/assetlinks.json`，內容對應簽章指紋
- [ ] T307 `bubblewrap build` 產生 `.aab`，本機安裝驗證開啟時不顯示網址列
- [ ] T308 多台真機（含低階機型/舊版 Android）實測麥克風授權流程

## 4. 上架
- [ ] T309 準備 Google Play Console 商店頁面素材、隱私權政策
- [ ] T310 上架前 smoke test：啟動 App、播放一張卡片、錄音一次，確認無 regression
- [ ] T311 送內部測試軌道審核

> 依賴關係備註：T303 需等 T301 完成；T305 需等 T302（需要 HTTPS 正式網域）與 T303/T304 完成；T306 需等 T305；T307 需等 T306；T309-T311 需等 T307、T308 完成。
> 完成標準：能在真機上以 Android App 形式打開、離線使用、正確錄音辨識，且通過內部測試軌道審核。
