## ADDED Requirements

### Requirement: 卡片與牌組語言標記
系統 SHALL 為每個牌組與卡片記錄其所屬語言，語言值須為 `ja`、`ko`、`en`、`id` 四者之一。

#### Scenario: 建立新牌組
- **WHEN** 使用者手動建立或透過 YouTube 匯入建立新牌組
- **THEN** 系統 SHALL 要求指定 `language` 欄位，不得留空

### Requirement: 語言專屬處理模組可插拔
系統 SHALL 將斷詞、詞彙解釋查詢、發音規則引擎三個模組設計為依語言動態載入對應實作，不得將特定語言的處理邏輯寫死在框架層。

#### Scenario: 新增一個尚未支援的語言
- **WHEN** 開發者要新增一個目前未實作的語言（例如日後要加中文）
- **THEN** 系統 SHALL 只需新增對應的 tokenizer/dictionary/pronunciation-rule 實作並註冊，不需修改框架層程式碼

### Requirement: 分階段語言支援策略
系統 SHALL 優先完整實作單一語言（日文）的端對端流程作為參考實作，其餘語言的 plugin 實作排在後續階段，不得與框架設計階段混為一談。

#### Scenario: 專案初期
- **WHEN** 專案仍處於核心流程尚未跑通的階段
- **THEN** 系統文件 SHALL 明確標示目前僅日文有完整實作，其他語言為規劃中狀態，避免誤導開發排程
