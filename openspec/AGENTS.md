# AGENTS.md — Instructions for AI Coding Assistants

本專案採用 OpenSpec 進行 Spec-Driven Development (SDD)。任何 AI 助手（Claude Code、Cline、Continue 等）在協助開發前，請遵循以下流程。

## 目錄結構

```
openspec/
├── project.md          # 專案技術棧與慣例（單一事實來源之一）
├── AGENTS.md            # 本檔案
├── specs/                # 目前已確立的能力（source of truth，尚無已 archive 的變更前為空）
│   └── <capability>/
│       ├── spec.md
│       └── design.md    # (optional)
└── changes/              # 進行中的變更提案
    ├── setup-core-data-model/
    ├── youtube-import-pipeline/
    ├── practice-flow/
    ├── pwa-android-packaging/
    │   ├── proposal.md   # 為什麼、做什麼、影響範圍
    │   ├── tasks.md       # 實作檢查清單
    │   ├── design.md      # 技術方案（可選）
    │   └── specs/<capability>/spec.md   # Delta spec：ADDED/MODIFIED/REMOVED Requirements
    └── archive/           # 完成並合併後的歷史紀錄
```

## 工作流程

1. **開始新工作前**，先讀 `openspec/project.md`（全域上下文）與相關 `openspec/specs/<capability>/spec.md`（如果該能力已存在）。
2. **規劃階段**：在 `openspec/changes/<change-name>/` 建立或更新 `proposal.md`、`design.md`、`tasks.md`、`specs/<capability>/spec.md`（delta）。先讓人審閱過 proposal 與 tasks，再開始寫程式。
   - **切到 Act Mode 前，須通過 `openspec/PLAN_TO_ACT_CHECKLIST.md` 的六項就緒檢查**（Scenario 化、依賴明確、語言事實與邏輯決策分離、完成標準可驗證、影響範圍已鎖定、時間上限）。六項都通過才能執行，任一項未通過要留在 Plan Mode 繼續處理，不得直接動手實作。
   - 涉及具體語言學規則宣稱的內容（例如某語言的發音變化規則），一律視為未查證，需登記進對應的 `__fixtures__/*.json` 或 `RISK_LOG.md`，不可直接當作規劃結論寫進 tasks.md 執行。
3. **實作階段**：依 `tasks.md` 逐項執行，完成一項就把該行的 `- [ ]` 改成 `- [x]`。不要跳過未完成的依賴項目。
4. **完成後**：把該 change 的 delta spec 合併進 `openspec/specs/<capability>/spec.md`，並將整個變更資料夾移到 `openspec/changes/archive/`。

## 規則

- 每個 change 資料夾只處理一個明確的能力範圍，不要把不相關的功能混在同一個 proposal 裡。
- `tasks.md` 的每一項要小到可以獨立驗證完成與否，避免「做完整個模組」這種粗粒度任務。
- Requirements 一律用 `SHALL` 描述系統該做什麼，並至少附一個 `#### Scenario:`（WHEN/THEN 格式）。
- 本專案另有 `CLAUDE.md`（Claude Code 用）與 `.clinerules`（Cline 用），內容需與 `openspec/project.md` 保持一致；若技術棧變動，三份文件一併更新。
- 離線優先原則：除了 YouTube 匯入的後端批次步驟外，所有使用者互動功能都必須能離線運作，實作時務必檢查是否符合。
