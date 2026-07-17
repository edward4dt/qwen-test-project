/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhisper } from '../useWhisper';

// Mock Worker
class MockWorker {
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  
  constructor(scriptUrl?: string | URL, options?: any) {
    // 忽略路徑參數
  }
  
  postMessage(message: any) {
    // 模擬非同步回應
    setTimeout(() => {
      if (this.onmessage) {
        if (message.type === 'init') {
          this.onmessage({ data: { type: 'ready', payload: { message: 'Initialized' } } });
        } else if (message.type === 'transcribe') {
          this.onmessage({ data: { type: 'progress', payload: { stage: 'converting', progress: 0.2 } } });
          this.onmessage({ data: { type: 'progress', payload: { stage: 'transcribing', progress: 0.5 } } });
          this.onmessage({ data: { type: 'progress', payload: { stage: 'complete', progress: 1.0 } } });
          this.onmessage({ 
            data: { 
              type: 'result', 
              payload: { 
                text: 'これはテストです',
                segments: [
                  { start: 0, end: 1.5, text: 'これは' },
                  { start: 1.5, end: 3.0, text: 'テストです' }
                ],
                language: 'ja'
              } 
            } 
          });
        } else if (message.type === 'terminate') {
          // 終止
        }
      }
    }, 10);
  }
  
  terminate() {}
}

// 替換全局 Worker
const OriginalWorker = global.Worker;
beforeAll(() => {
  (global as any).Worker = MockWorker;
});

afterAll(() => {
  (global as any).Worker = OriginalWorker;
});

describe('useWhisper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本功能', () => {
    it('應該正確導出 hook', () => {
      expect(useWhisper).toBeDefined();
    });

    it('應該在初始狀態時 isReady 為 false', () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      // 使用 act 包裝讀取
      act(() => {
        expect(result.current).toBeDefined();
      });
      
      expect(result.current?.isReady).toBe(false);
      expect(result.current?.isTranscribing).toBe(false);
      expect(result.current?.error).toBeNull();
    });

    it('應該提供 init 函數', () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      act(() => {
        expect(typeof result.current?.init).toBe('function');
      });
    });

    it('應該提供 transcribe 函數', () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      act(() => {
        expect(typeof result.current?.transcribe).toBe('function');
      });
    });

    it('應該提供 terminate 函數', () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      act(() => {
        expect(typeof result.current?.terminate).toBe('function');
      });
    });
  });

  describe('錯誤處理', () => {
    it('應該在沒有初始化時呼叫 transcribe 拋出錯誤', async () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });
      
      await expect(async () => {
        await act(async () => {
          await result.current!.transcribe(mockBlob);
        });
      }).rejects.toThrow('Worker not initialized');
    });
  });

  describe('終止', () => {
    it('應該可以呼叫 terminate', () => {
      const { result } = renderHook(() => useWhisper({ autoInit: false }));
      
      act(() => {
        result.current?.terminate();
      });
      
      expect(result.current?.isReady).toBe(false);
    });
  });
});
