/**
 * useWhisper Hook
 * 包裝 Web Worker 通訊，提供簡潔的語音辨識 API
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// 類型定義
interface TranscribeResult {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language: string;
}

interface WhisperProgress {
  stage: 'converting' | 'transcribing' | 'complete';
  progress: number;
}

interface UseWhisperOptions {
  modelUrl?: string;
  language?: string;
  autoInit?: boolean;
}

interface UseWhisperReturn {
  isReady: boolean;
  isTranscribing: boolean;
  progress: WhisperProgress | null;
  error: string | null;
  init: () => Promise<void>;
  transcribe: (audioBlob: Blob) => Promise<TranscribeResult | null>;
  terminate: () => void;
}

const DEFAULT_MODEL_URL = '/models/whisper-small.bin';
const DEFAULT_LANGUAGE = 'ja';

/**
 * useWhisper Hook
 * 管理 whisper.cpp Web Worker 的生命週期與通訊
 */
export function useWhisper(options: UseWhisperOptions = {}): UseWhisperReturn {
  const {
    modelUrl = DEFAULT_MODEL_URL,
    language = DEFAULT_LANGUAGE,
    autoInit = false
  } = options;

  const [isReady, setIsReady] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<WhisperProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingResolves = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());
  const messageIdRef = useRef(0);

  // 初始化 Worker
  const init = useCallback(async (): Promise<void> => {
    if (workerRef.current) {
      console.log('[useWhisper] Worker already initialized');
      return;
    }

    try {
      // 建立 Worker
      // 在測試環境中使用 mock，在實際環境中載入真實 worker
      let worker: Worker;
      
      if (typeof window !== 'undefined') {
        // 瀏覽器環境：使用簡單路徑
        // 實際專案中會使用：new Worker(new URL('/workers/whisper.worker.js', import.meta.url))
        worker = new Worker('/workers/whisper.worker.js', { type: 'module' });
      } else {
        // Node/測試環境：使用預設路徑（會被 mock 覆蓋）
        worker = new Worker('/workers/whisper.worker.js', { type: 'module' });
      }

      workerRef.current = worker;

      // 設定訊息處理器
      worker.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'ready':
            setIsReady(true);
            setError(null);
            break;

          case 'result':
            setIsTranscribing(false);
            setProgress(null);
            // 解析等待中的 promise
            const resultHandler = pendingResolves.current.get('transcribe');
            if (resultHandler) {
              resultHandler.resolve(payload);
              pendingResolves.current.delete('transcribe');
            }
            break;

          case 'progress':
            setProgress(payload);
            break;

          case 'error':
            setError(payload.message);
            setIsTranscribing(false);
            setProgress(null);
            const errorHandler = pendingResolves.current.get('transcribe');
            if (errorHandler) {
              errorHandler.reject(new Error(payload.message));
              pendingResolves.current.delete('transcribe');
            }
            break;
        }
      };

      worker.onerror = (err) => {
        console.error('[useWhisper] Worker error:', err);
        setError(`Worker error: ${err.message}`);
        setIsTranscribing(false);
      };

      // 發送初始化訊息
      worker.postMessage({
        type: 'init',
        payload: { modelUrl }
      });

      // 等待初始化完成 - 使用 ref 追蹤狀態避免 closure 問題
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Initialization timeout'));
        }, 30000); // 30 秒超時

        const checkReady = () => {
          if (workerRef.current && isReady) {
            clearTimeout(timeoutId);
            resolve();
          } else if (!workerRef.current) {
            // Worker 被銷毀了
            clearTimeout(timeoutId);
            reject(new Error('Worker terminated during initialization'));
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize worker';
      setError(errorMessage);
      throw err;
    }
  }, [modelUrl, isReady]);

  // 執行語音辨識
  const transcribe = useCallback(async (audioBlob: Blob): Promise<TranscribeResult | null> => {
    if (!workerRef.current) {
      throw new Error('Worker not initialized. Call init() first.');
    }

    if (isTranscribing) {
      throw new Error('Already transcribing');
    }

    setIsTranscribing(true);
    setError(null);
    setProgress(null);

    // 發送轉錄請求
    workerRef.current.postMessage({
      type: 'transcribe',
      payload: { audioBlob, language }
    });

    // 返回 Promise 等待結果
    return new Promise((resolve, reject) => {
      pendingResolves.current.set('transcribe', { resolve, reject });

      // 設定超時
      setTimeout(() => {
        const handler = pendingResolves.current.get('transcribe');
        if (handler) {
          reject(new Error('Transcription timeout'));
          pendingResolves.current.delete('transcribe');
        }
      }, 60000); // 60 秒超時
    });
  }, [language, isTranscribing]);

  // 終止 Worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'terminate' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsReady(false);
    setIsTranscribing(false);
    setProgress(null);
    setError(null);
    pendingResolves.current.clear();
  }, []);

  // 自動初始化
  useEffect(() => {
    if (autoInit && !isReady && !workerRef.current) {
      init().catch(console.error);
    }

    // 清理函數
    return () => {
      terminate();
    };
  }, [autoInit, isReady, init, terminate]);

  return {
    isReady,
    isTranscribing,
    progress,
    error,
    init,
    transcribe,
    terminate
  };
}

export default useWhisper;
