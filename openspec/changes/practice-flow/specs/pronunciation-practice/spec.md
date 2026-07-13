## ADDED Requirements

### Requirement: 離線語音辨識
系統 SHALL 在裝置本機執行語音辨識，不得將使用者錄音上傳至任何伺服器。

#### Scenario: 使用者錄音後進行辨識
- **WHEN** 使用者完成一次發音錄音
- **THEN** 系統 SHALL 在 Web Worker 中透過本機 whisper.cpp WASM 模型進行辨識，全程不發出網路請求

### Requirement: 發音回饋機制
系統 SHALL 對使用者的錄音給予相似度分數與文字回饋，回饋機制的複雜度可依技術驗證結果調整。

#### Scenario: 完整規則引擎可行
- **WHEN** 技術原型驗證確認音素/規則比對可行
- **THEN** 系統 SHALL 提供長音、促音、濁音等具體錯誤類型的回饋

#### Scenario: 完整規則引擎不可行時的退回方案
- **WHEN** 技術原型驗證顯示規則比對不可靠
- **THEN** 系統 SHALL 至少提供「辨識文字是否與目標一致」及文字差異標示作為回饋，不得完全沒有回饋

### Requirement: 間隔複習排程
系統 SHALL 依據使用者每次複習的結果，計算並更新該卡片的下次到期複習時間。

#### Scenario: 使用者複習答對
- **WHEN** 使用者的發音通過評分門檻
- **THEN** 系統 SHALL 延長該卡片的複習間隔，並更新 `SRSCard` 的 `stability` 與 `dueDate`

#### Scenario: 使用者複習答錯
- **WHEN** 使用者的發音未通過評分門檻
- **THEN** 系統 SHALL 縮短複習間隔，讓該卡片較快再次出現
