# Design: 前端發音練習核心流程

## Whisper 整合架構
```
Recorder (MediaRecorder) → audioBlob
        │
        ▼
Web Worker (whisper.worker.ts)
        │  postMessage({type:'transcribe', payload:{audio}})
        ▼
whisper.cpp WASM 推理
        │
        ▼
postMessage({type:'result', text})
        │
        ▼
useWhisper Hook 回傳給 UI
```
選擇 Web Worker 而非主執行緒執行推理，避免辨識運算卡住 UI；模型檔（約 75MB）由 Service Worker 快取，首次載入後離線可用。

## 發音評分：先驗證再投入
單純的規則判斷（長音/促音/濁音）可能無法準確處理真實錄音的雜訊與口音差異，若底層真的需要音素序列比對，技術複雜度會高出很多。因此：

1. **T206（spike）先行**：只用 5-10 個固定詞測試，確認辨識文字比對 + 簡單規則能否給出「有意義」的回饋
2. 若原型顯示規則判斷可行 → 依原計畫做完整 `pronunciation-engine.ts`
3. 若原型顯示不可行 → 退回「只比對辨識文字是否完全正確 + 顯示差異」的簡化版，仍保留使用者可感知的回饋價值，避免整個功能卡死在音素比對這個高風險項目上

## SRS 演算法選擇
建議採用簡化版 FSRS（Free Spaced Repetition Scheduler）概念：以 `stability`、`difficulty` 兩個核心參數調整下次複習間隔，避免一開始就實作完整演算法造成過度工程。
