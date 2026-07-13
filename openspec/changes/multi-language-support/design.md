# Design: 多語言支援架構

## 語言代碼

統一用 ISO 639-1 兩碼表示，四種語言先鎖定這四個值：

```typescript
export type LanguageCode = 'ja' | 'ko' | 'en' | 'id';
```

## 型別調整

```typescript
export interface Deck {
  id: string;
  name: string;
  source: 'manual' | 'youtube';
  sourceUrl?: string;
  createdAt: string;
  language: LanguageCode;   // 新增：這個牌組是哪個語言
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  backReading: string;
  backMeaning: string;
  audioClip?: Blob;
  srs: SRSCard;
  language: LanguageCode;   // 新增：冗餘存一份，避免每次顯示卡片都要多查一次 Deck
}
```

`Card.language` 選擇冗餘存放而非只存在 `Deck` 上的理由：練習畫面（Recorder/Feedback）需要立刻知道要載入哪個語言的發音規則與 TTS 語音，若每次都要多一次查詢 `Deck` 才能取得語言別，會增加不必要的資料庫存取次數。寫入時由 `Deck.language` 帶入，維護時保證兩者一致即可。

## Plugin 架構：語言無關框架 + 語言專屬實作

三個受影響模組都改成同一種模式：一個定義好的介面（框架），外加每個語言各自的實作（plugin）。

### 1. 斷詞（原 A3）

```typescript
// import-service/tokenizers/base.py
class BaseTokenizer(ABC):
    @abstractmethod
    def tokenize(self, text: str) -> list[Token]: ...

# import-service/tokenizers/ja.py  → 用 fugashi 實作
# import-service/tokenizers/ko.py  → 需另尋韓文斷詞庫（例如 KoNLPy）
# import-service/tokenizers/en.py  → 相對簡單，可用空白斷詞 + 詞形還原
# import-service/tokenizers/id.py  → 印尼文斷詞相對規則化，可用現成分詞庫
```

依 `Deck.language` 動態選擇對應 tokenizer。

### 2. 詞彙解釋查詢（原 A3.5）

```typescript
// import-service/dictionaries/base.py
class BaseDictionary(ABC):
    @abstractmethod
    def lookup(self, word: str) -> DictEntry | None: ...

# ja.py → JMdict / Jisho API
# ko.py → 需另尋韓文字典來源（例如 Naver 字典 API 或開放語料）
# en.py → 可用 WordNet 或現成免費字典 API
# id.py → 需另尋印尼文字典來源
```

### 3. 發音規則引擎（原 B7，影響最大）

```typescript
// src/lib/pronunciation-engine/base.ts
export interface PronunciationRule {
  evaluate(recognized: string, target: string): EvaluationResult;
}

// src/lib/pronunciation-engine/ja.ts  → 長音/促音/濁音規則
// src/lib/pronunciation-engine/ko.ts  → 收尾音/連音變化規則
// src/lib/pronunciation-engine/en.ts  → 重音/母音長度規則
// src/lib/pronunciation-engine/id.ts  → 音節重音規則（印尼文相對規則化）
// src/lib/pronunciation-engine/index.ts → 依 language 回傳對應 PronunciationRule 實例
```

**B6.5（發音評分技術原型驗證）的 spike 結果只能代表日文**，其他三個語言各自的音素/規則比對難度未知，不能假設同一套驗證結果適用全部語言。

## MVP 分階段策略

不建議四語言同時開工，理由：B6.5 這種高風險驗證任務一次擴成四倍未知數，容易全部卡住。改採分階段：

1. **階段一（現有計畫）**：先用日文把整條流程（A1-A9 匯入 → B1-B10 練習 → B7 日文規則）完整跑通，作為參考實作與框架驗證
2. **階段二**：抽出上述三個模組的介面層（BaseTokenizer / BaseDictionary / PronunciationRule），確認框架設計沒問題
3. **階段三**：依序補上韓語 → 英語 → 印尼文各自的 plugin（順序可依你對哪個語言最熟悉/最容易找到資源調整），每個語言各自的 B6.5 spike 要重跑一次，不能跳過

## 測試資料集（fixtures）成長策略

每個語言的 plugin 都要搭配一份 `__fixtures__/*.json` 標準答案集，用來驗證規則引擎邏輯本身正確，**不是**用來窮舉所有可能出現的詞彙：

- fixtures 只需要涵蓋該語言的關鍵語音學邊界案例（例如韓文的收尾音變化類型），初期 5-10 組即可開始
- 新 YouTube 內容產生的新詞彙、新句子，只要規則引擎邏輯正確，理論上不需要每次都建新的 fixtures 才能處理
- fixtures 的成長來源是 **A8（人工校對介面）** 抓到的實際錯誤：使用者或開發者發現某張卡片的發音評分不合理時，把該案例補進對應語言的 fixtures，變成一筆迴歸測試，防止同樣的錯誤再發生
- 這是漸進成長模型，不是一次性收集完整語料的模型

```
新內容匯入 → 套用既有規則引擎 → 練習時發現評分錯誤
                                        │
                                        ▼
                        A8 校對介面標記錯誤案例
                                        │
                                        ▼
                補進對應語言的 __fixtures__/*.json
                                        │
                                        ▼
                跑 Jest 測試 → 修正規則邏輯 → fixtures 變大、規則更穩
```

## 為什麼不現在就決定韓/英/印尼文各自的技術選型
斷詞庫、字典來源、發音規則的具體技術選型（例如韓文斷詞要用哪個套件）留到階段三真正要做該語言時再決定，現在只鎖定介面設計，避免現在花時間研究之後可能用不到或會變動的技術細節。
