## ADDED Requirements

### Requirement: PWA 離線可用性
系統 SHALL 在無網路連線狀態下，仍能開啟並使用核心練習功能（瀏覽卡片、錄音、辨識、回饋）。

#### Scenario: 首次連網後離線開啟
- **WHEN** 使用者曾在有網路狀態下開啟過 App 一次（Service Worker 已完成資源快取）
- **THEN** 系統 SHALL 在之後無網路狀態下正常開啟並執行核心練習流程

### Requirement: TWA 網域驗證
系統 SHALL 透過 Digital Asset Links 驗證 Android App 與網頁 origin 的對應關係，確保開啟時不顯示瀏覽器網址列。

#### Scenario: 使用者從 Play Store 安裝的 App 開啟
- **WHEN** 使用者開啟已安裝的 Android App
- **THEN** 系統 SHALL 以全螢幕、無網址列的方式呈現，且驗證失敗時不得靜默降級為顯示網址列而未告警

### Requirement: 麥克風權限相容性
系統 SHALL 在 TWA 環境下正確請求並取得麥克風權限，且此行為需經過多機型驗證。

#### Scenario: 使用者首次使用錄音功能
- **WHEN** 使用者在 TWA 封裝的 App 中第一次點擊錄音
- **THEN** 系統 SHALL 觸發標準的 Android 麥克風權限請求對話框，且授權後錄音功能立即可用
