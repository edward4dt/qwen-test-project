/**
 * 發音規則引擎基礎介面
 * 定義語言無關的發音評估合約
 */

import { LanguageCode } from '../../types';
import { JapanesePronunciationRule } from './ja';

/**
 * 發音評估結果
 */
export interface EvaluationResult {
  /** 是否通過（發音正確） */
  passed: boolean;
  /** 相似度分數 (0-1) */
  similarity: number;
  /** 回饋訊息（例如：長音不足、促音錯誤等） */
  feedback: string;
  /** 詳細的錯誤資訊（可選） */
  errors?: string[];
}

/**
 * 發音規則介面
 * 每個語言需實作此介面來提供該語言的發音評估邏輯
 */
export interface PronunciationRule {
  /**
   * 評估使用者發音
   * @param recognized 語音辨識結果
   * @param target 目標發音（卡片背面讀音）
   * @returns 評估結果
   */
  evaluate(recognized: string, target: string): EvaluationResult;
}

/**
 * 依語言代碼取得對應的發音規則實例
 * @param language 語言代碼
 * @returns 對應的發音規則實例
 */
export function getPronunciationRule(language: LanguageCode): PronunciationRule {
  switch (language) {
    case 'ja':
      return new JapanesePronunciationRule();
    case 'ko':
      throw new Error(`Korean pronunciation rule not yet implemented. Language: ${language}`);
    case 'en':
      throw new Error(`English pronunciation rule not yet implemented. Language: ${language}`);
    case 'id':
      throw new Error(`Indonesian pronunciation rule not yet implemented. Language: ${language}`);
    default:
      throw new Error(`Unsupported language code: ${language}`);
  }
}
