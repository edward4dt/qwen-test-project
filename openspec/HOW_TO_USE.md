# 怎麼使用這份 OpenSpec 資料夾

## 這份檔案是什麼
這是照 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的標準 SDD 目錄結構手動建好的，對應到你之前那份開發進度追蹤表（xlsx）：

| openspec/changes/ | 對應原本 xlsx 編號 |
|---|---|
| setup-core-data-model | C1, C2, C3, B1 |
| youtube-import-pipeline | A1-A9 |
| practice-flow | B2-B10, B6.5 |
| pwa-android-packaging | B11-B16 |

每個 change 資料夾都有 `proposal.md`（為什麼/做什麼）、`tasks.md`（實作檢查清單，可直接勾選）、`design.md`（技術方案）、`specs/<capability>/spec.md`（正式需求敘述，ADDED Requirements + Scenario）。

## 安裝正式 CLI（選用，但強烈建議）
目前這份是手動建立的靜態檔案，如果想要 Cline/Claude Code 用 `/opsx:propose`、`/opsx:apply` 這類 slash command 自動操作，需要裝官方 CLI：

```bash
npm install -g @fission-ai/openspec@latest
cd <你的專案根目錄>
openspec init --tools cline,claude
```

這會在既有的 `openspec/` 資料夾基礎上（你可以先把這次產生的檔案放進專案根目錄）補上：
- `.clinerules/workflows/` — Cline 專用的 slash command 定義
- `.claude/commands/`（若也選 claude）— Claude Code 專用的 slash command

**Node.js 需求**：20.19.0 以上。裝這個 CLI 本身只佔幾 MB，不會影響你先前抓的 10GB 磁碟空間預算。

## 沒裝 CLI 也能用
就算不裝 CLI，這些純 Markdown 檔案本身就能直接餵給 Cline/Claude Code 當上下文——因為 `AGENTS.md` 裡已經寫好流程規則，任何讀得懂檔案的 AI 助手照著做就對了，只是要用自然語言描述（例如「照 openspec/changes/youtube-import-pipeline/tasks.md 開始做 T101」）取代 slash command。

## 建議的開工順序
1. 先完成 `setup-core-data-model`（型別定義是一切的前提）
2. `youtube-import-pipeline` 與 `practice-flow` 可以同時開工，兩者互不相依
3. `pwa-android-packaging` 留到核心練習流程有雛形後再開始

## 完成一個 change 後
把該資料夾的 delta spec 內容合併進 `openspec/specs/<capability>/spec.md`（目前 `specs/` 是空的，這是正常的——要等第一個 change 完成並 archive 後才會有內容），並將整個 change 資料夾搬到 `openspec/changes/archive/`。若用官方 CLI，這一步就是 `/opsx:archive`。

## 與現有文件的關係
- `openspec/project.md` 內容與 `CLAUDE.md`、`.clinerules` 一致，三者是同一份技術棧描述的不同載體
- `openspec/PLAN_TO_ACT_CHECKLIST.md` 是 Plan Mode 討論完、切到 Act Mode 前的六項就緒檢查，附提示詞模板與通過/未通過範例，`AGENTS.md` 的工作流程已引用這份文件
- xlsx 追蹤表可以繼續用來看整體進度總覽與並行分組；`tasks.md` 則是每個 change 實際執行時的細顆粒度檢查清單，兩者互補，不衝突
