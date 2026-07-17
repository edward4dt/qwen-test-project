/**
 * 日文發音規則引擎測試
 * 使用 fixtures 驗證規則引擎的正確性
 */

import { JapanesePronunciationRule } from '../ja';
import testCases from '../__fixtures__/ja.test-cases.json';

describe('JapanesePronunciationRule', () => {
  let rule: JapanesePronunciationRule;

  beforeEach(() => {
    rule = new JapanesePronunciationRule();
  });

  describe('evaluate', () => {
    testCases.forEach((testCase) => {
      it(`應正確處理：${testCase.description}`, () => {
        const result = rule.evaluate(testCase.recognized, testCase.target);

        // 檢查 passed
        expect(result.passed).toBe(testCase.expected.passed);

        // 檢查相似度（允許小範圍誤差）
        if (testCase.expected.similarity !== undefined) {
          expect(result.similarity).toBeCloseTo(testCase.expected.similarity, 2);
        } else if (testCase.expected.similarityMin !== undefined && testCase.expected.similarityMax !== undefined) {
          expect(result.similarity).toBeGreaterThanOrEqual(testCase.expected.similarityMin);
          expect(result.similarity).toBeLessThanOrEqual(testCase.expected.similarityMax);
        }

        // 檢查是否有錯誤
        if (testCase.expected.hasErrors) {
          expect(result.errors).toBeDefined();
          expect(result.errors!.length).toBeGreaterThan(0);

          // 如果有指定錯誤類型，檢查是否包含
          if (testCase.expected.errorContains) {
            const hasExpectedError = result.errors!.some(err =>
              err.includes(testCase.expected!.errorContains!)
            );
            expect(hasExpectedError).toBe(true);
          }
        } else {
          expect(result.errors).toEqual([]);
        }
      });
    });

    it('應支援完整的評估結果結構', () => {
      const result = rule.evaluate('おはよう', 'おはよう');

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('similarity');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('errors');
    });

    it('應為完全匹配提供正面回饋', () => {
      const result = rule.evaluate('ありがとう', 'ありがとう');

      expect(result.passed).toBe(true);
      expect(result.similarity).toBe(1.0);
      expect(result.feedback).toContain('正確');
    });

    it('應為不匹配提供詳細回饋', () => {
      const result = rule.evaluate('ありがと', 'ありがとう');

      expect(result.passed).toBe(false);
      expect(result.feedback).toBeDefined();
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('邊界情況', () => {
    it('應處理空字串', () => {
      const result = rule.evaluate('', '');
      expect(result.passed).toBe(true);
      expect(result.similarity).toBe(1.0);
    });

    it('應處理目標為空的情況', () => {
      const result = rule.evaluate('テスト', '');
      expect(result.passed).toBe(false);
      expect(result.similarity).toBe(0.0);
    });

    it('應處理識別為空的情況', () => {
      const result = rule.evaluate('', 'テスト');
      expect(result.passed).toBe(false);
      expect(result.similarity).toBe(0.0);
    });
  });
});
