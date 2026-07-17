# Tasks: 多語言支援架構

## 1. 型別與資料層（阻塞 T005，須優先完成）
- [x] L001 在 `src/types/index.ts` 新增 `LanguageCode` 型別（`'ja' | 'ko' | 'en' | 'id'`）
- [x] L002 `Deck` 介面新增 `language: LanguageCode` 欄位
- [x] L003 `Card` 介面新增 `language: LanguageCode` 欄位
- [x] L004 更新 `design.md`（setup-core-data-model）中的型別範例，使其反映語言欄位

## 2. 斷詞 plugin 框架
- [ ] L005 定義 `BaseTokenizer` 抽象介面（`import-service/tokenizers/base.py`）
- [ ] L006 將既有 fugashi 斷詞邏輯（原 A3/T103）搬進 `tokenizers/ja.py`，實作 `BaseTokenizer`
- [ ] L007 在匯入流程中依 `Deck.language` 動態選擇對應 tokenizer

## 3. 詞彙解釋查詢 plugin 框架
- [ ] L008 定義 `BaseDictionary` 抽象介面（`import-service/dictionaries/base.py`）
- [ ] L009 將既有 JMdict/Jisho 查詢邏輯（原 A3.5/T105）搬進 `dictionaries/ja.py`，實作 `BaseDictionary`
- [ ] L010 在匯入流程中依 `Deck.language` 動態選擇對應 dictionary

## 4. 發音規則引擎 plugin 框架
- [x] L011 定義 `PronunciationRule` 介面（`src/lib/pronunciation-engine/base.ts`）
- [x] L012 將既有長音/促音/濁音規則（原 B7/T207，含 B6.5 spike 結果）搬進 `pronunciation-engine/ja.ts`
- [x] L013 建立 `pronunciation-engine/index.ts`，依 `language` 回傳對應規則實例
- [ ] L014 更新 `useWhisper`/`Feedback` 相關呼叫端，改用 `language` 參數取得規則實例，而非直接呼叫原本單一檔案的函式

## 5. 文件同步
- [x] L015 更新 `project.md` 專案簡介與架構原則，反映四語言範圍
- [ ] L016 更新 `task-order.md`，在依賴關係圖中標註本 change 需在 T005 之前完成
- [x] L017 在 `youtube-import-pipeline/tasks.md` 的 A3、A3.5 備註中註明「已改為 plugin 架構，本檔案僅保留日文 plugin 的實作任務，其餘語言的斷詞/字典技術選型留待階段三」
- [x] L018 在 `practice-flow/tasks.md` 的 B7 備註中註明「已改為 plugin 架構，B6.5 spike 結果僅代表日文，其他語言需各自重跑 spike」

## 6. Fixtures 驗證機制
- [x] L020 為每個已實作語言建立 `__fixtures__/*.json` 標準答案集（初期 5-10 組已查證案例即可）
- [x] L021 建立對應的 Jest 測試（`__tests__/*.test.ts`），讀取 fixtures 逐一驗證規則引擎輸出
- [ ] L022 在 `youtube-import-pipeline/A8`（人工校對介面）的說明中補充：發現錯誤案例時，應同步補進對應語言的 fixtures，作為迴歸測試的成長來源
- [x] L023 建立 `RISK_LOG.md`，記錄尚未通過人工複核（僅通過 fixtures 或完全未驗證）的語言規則項目

## 7. MVP 階段標記（不在本 change 實作，僅記錄規劃）
- [x] L019 在 `project.md` 或本 change 的 design.md 中明確記錄「階段一僅完整實作日文，韓語/英語/印尼文的 plugin 排在階段三」，避免後續誤解成要四語言同時開工

> 完成標準：L001-L014 完成後，`setup-core-data-model` 的 T005 可以安全開始（schema 包含 language 欄位）；L015-L019 完成後，所有文件對「目前只有日文完整實作、其他語言待補」這件事有一致的說明。
>
> 依賴關係：L001-L004 必須最先做；L005-L014 三組 plugin 框架彼此獨立，可平行進行；L015-L019 文件同步建議放在程式碼調整完成後最後做，確保文件反映的是實際狀態。
