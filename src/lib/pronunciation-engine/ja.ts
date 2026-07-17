/**
 * 日文發音規則實作
 * 處理日語特有的長音、促音、濁音等規則
 */

import { PronunciationRule, EvaluationResult } from './base';

/**
 * 日文發音規則實作
 */
export class JapanesePronunciationRule implements PronunciationRule {
  /**
   * 評估使用者發音
   * @param recognized 語音辨識結果
   * @param target 目標發音（卡片背面讀音）
   * @returns 評估結果
   */
  evaluate(recognized: string, target: string): EvaluationResult {
    const errors: string[] = [];
    
    // 標準化輸入（移除空白、統一大小寫）
    const normalizedRecognized = this.normalize(recognized);
    const normalizedTarget = this.normalize(target);
    
    // 完全匹配
    if (normalizedRecognized === normalizedTarget) {
      return {
        passed: true,
        similarity: 1.0,
        feedback: '発音正確！',
        errors: [],
      };
    }
    
    // 檢查長音規則
    const longVowelIssue = this.checkLongVowel(normalizedRecognized, normalizedTarget);
    if (longVowelIssue) {
      errors.push(longVowelIssue);
    }
    
    // 檢查促音規則
    const smallTsuIssue = this.checkSmallTsu(normalizedRecognized, normalizedTarget);
    if (smallTsuIssue) {
      errors.push(smallTsuIssue);
    }
    
    // 檢查濁音/半濁音規則
    const voicedSoundIssue = this.checkVoicedSound(normalizedRecognized, normalizedTarget);
    if (voicedSoundIssue) {
      errors.push(voicedSoundIssue);
    }
    
    // 計算相似度
    const similarity = this.calculateSimilarity(normalizedRecognized, normalizedTarget);
    
    // 判斷是否通過（相似度 >= 0.8 且無嚴重錯誤）
    const passed = similarity >= 0.8 && errors.length === 0;
    
    let feedback: string;
    if (passed) {
      feedback = '発音正確！';
    } else if (errors.length > 0) {
      feedback = `發音有差異：${errors.join('、')}`;
    } else {
      feedback = `發音相似度 ${Math.round(similarity * 100)}%。目標：${target}，識別：${recognized}`;
    }
    
    return {
      passed,
      similarity,
      feedback,
      errors,
    };
  }
  
  /**
   * 標準化字串：移除空白、統一為小寫
   */
  private normalize(text: string): string {
    return text.trim().toLowerCase();
  }
  
  /**
   * 檢查長音規則（ー、う、い 延長音）
   */
  private checkLongVowel(recognized: string, target: string): string | null {
    // 如果目標有長音符號但識別沒有，可能是長音不足
    if (target.includes('ー') && !recognized.includes('ー')) {
      return '長音不足';
    }
    // 檢查平假名長音（こう、とう、のう等）- 使用 includes 而非嚴格結尾匹配
    const longVowelPatterns = [
      'こう', 'とう', 'のう', 'そう', 'ちょう',
      'せー', 'ねー', 'れー', 'めー',
    ];
    
    for (const pattern of longVowelPatterns) {
      if (target.includes(pattern) && !recognized.includes(pattern)) {
        return '長音不足';
      }
    }
    
    return null;
  }
  
  /**
   * 檢查促音規則（っ）
   */
  private checkSmallTsu(recognized: string, target: string): string | null {
    // 如果目標有促音但識別沒有
    if (target.includes('っ') && !recognized.includes('っ')) {
      return '促音缺失';
    }
    // 如果識別有促音但目標沒有
    if (!target.includes('っ') && recognized.includes('っ')) {
      return '多餘的促音';
    }
    return null;
  }
  
  /**
   * 檢查濁音/半濁音規則（がざだばぱ等）
   */
  private checkVoicedSound(recognized: string, target: string): string | null {
    // 濁音對應表（清音 → 濁音）
    const voicedMap: Record<string, string> = {
      'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
      'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
      'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
      'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ',
    };
    
    // 半濁音對應表（清音 → 半濁音）
    const semiVoicedMap: Record<string, string> = {
      'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ',
    };
    
    // 檢查是否有濁音混淆
    for (const [clear, voiced] of Object.entries(voicedMap)) {
      if (target.includes(voiced) && recognized.includes(clear)) {
        return `濁音錯誤：應為${voiced}而非${clear}`;
      }
      if (target.includes(clear) && recognized.includes(voiced)) {
        return `濁音錯誤：應為${clear}而非${voiced}`;
      }
    }
    
    // 檢查是否有半濁音混淆
    for (const [clear, semiVoiced] of Object.entries(semiVoicedMap)) {
      if (target.includes(semiVoiced) && recognized.includes(clear)) {
        return `半濁音錯誤：應為${semiVoiced}而非${clear}`;
      }
      if (target.includes(clear) && recognized.includes(semiVoiced)) {
        return `半濁音錯誤：應為${clear}而非${semiVoiced}`;
      }
    }
    
    return null;
  }
  
  /**
   * 計算相似度（使用編輯距離）
   */
  private calculateSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    
    const maxLen = Math.max(s1.length, s2.length);
    const distance = this.levenshteinDistance(s1, s2);
    
    return 1 - distance / maxLen;
  }
  
  /**
   * 計算 Levenshtein 編輯距離
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    
    // 建立 DP 表
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // 初始化
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    // 填充 DP 表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // 刪除
            dp[i][j - 1],     // 插入
            dp[i - 1][j - 1]  // 替換
          );
        }
      }
    }
    
    return dp[m][n];
  }
}
