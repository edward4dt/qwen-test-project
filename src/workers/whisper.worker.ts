/**
 * Whisper.cpp Web Worker
 * 負責在背景執行語音辨識推理
 */

// 類型定義
interface WhisperMessage {
  type: 'init' | 'transcribe' | 'terminate';
  payload?: any;
}

interface InitPayload {
  modelUrl: string;
}

interface TranscribePayload {
  audioBlob: Blob;
  language?: string;
}

interface ResultMessage {
  type: 'ready' | 'result' | 'error' | 'progress';
  payload?: any;
}

// 全域變數
let whisperModule: any = null;
let isInitialized = false;

/**
 * 載入並初始化 whisper.cpp WASM 模組
 * 注意：實際專案中需要編譯 whisper.cpp 為 WASM
 * 這裡使用模擬實作展示架構
 */
async function loadWhisperModule(modelUrl: string): Promise<any> {
  // 在真實實作中，這裡會載入編譯後的 whisper.cpp WASM
  // 例如：import('/models/whisper.cpp/whisper.js')
  
  // 模擬延遲載入
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 模擬的 whisper 模組介面
  return {
    init: async (modelPath: string) => {
      console.log(`[WhisperWorker] 初始化模型：${modelPath}`);
      // 真實實作：await Module.init(modelPath);
      return true;
    },
    transcribe: async (audioData: Float32Array, options: any) => {
      console.log('[WhisperWorker] 開始轉錄...');
      // 真實實作：return Module.transcribe(audioData, options);
      
      // 模擬結果
      return {
        text: 'これはテストです',
        segments: [
          { start: 0, end: 1.5, text: 'これは' },
          { start: 1.5, end: 3.0, text: 'テストです' }
        ],
        language: 'ja'
      };
    },
    terminate: () => {
      console.log('[WhisperWorker] 終止模組');
    }
  };
}

/**
 * 將 AudioBlob 轉換為 Float32Array
 * 使用 Web Audio API 解碼
 */
async function audioBlobToFloat32(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (globalThis as any).AudioContext({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // 轉為單聲道
  const channelData = audioBuffer.getChannelData(0);
  return new Float32Array(channelData);
}

// 監聽主執行緒訊息
self.onmessage = async (event: MessageEvent<WhisperMessage>) => {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'init': {
        const { modelUrl } = payload as InitPayload;
        
        if (isInitialized) {
          self.postMessage({
            type: 'ready',
            payload: { message: 'Already initialized' }
          } as ResultMessage);
          break;
        }
        
        console.log('[WhisperWorker] 初始化中...', modelUrl);
        whisperModule = await loadWhisperModule(modelUrl);
        await whisperModule.init(modelUrl);
        isInitialized = true;
        
        self.postMessage({
          type: 'ready',
          payload: { message: 'Whisper module initialized' }
        } as ResultMessage);
        break;
      }
      
      case 'transcribe': {
        if (!isInitialized || !whisperModule) {
          throw new Error('Whisper module not initialized');
        }
        
        const { audioBlob, language = 'ja' } = payload as TranscribePayload;
        
        // 發送進度更新
        self.postMessage({
          type: 'progress',
          payload: { stage: 'converting', progress: 0.2 }
        } as ResultMessage);
        
        // 轉換音訊格式
        const audioData = await audioBlobToFloat32(audioBlob);
        
        self.postMessage({
          type: 'progress',
          payload: { stage: 'transcribing', progress: 0.5 }
        } as ResultMessage);
        
        // 執行轉錄
        const result = await whisperModule.transcribe(audioData, { language });
        
        self.postMessage({
          type: 'progress',
          payload: { stage: 'complete', progress: 1.0 }
        } as ResultMessage);
        
        // 返回結果
        self.postMessage({
          type: 'result',
          payload: result
        } as ResultMessage);
        break;
      }
      
      case 'terminate': {
        if (whisperModule) {
          whisperModule.terminate();
        }
        isInitialized = false;
        whisperModule = null;
        self.close();
        break;
      }
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    } as ResultMessage);
  }
};

// 匯出類型供 TypeScript 使用
export type { WhisperMessage, ResultMessage, InitPayload, TranscribePayload };
