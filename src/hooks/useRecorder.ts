/**
 * useRecorder Hook
 * Wraps MediaRecorder API to record user pronunciation
 */

import { useState, useRef, useCallback } from 'react';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

export interface UseRecorderOptions {
  mimeType?: string;
  maxDuration?: number; // in milliseconds
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export const useRecorder = ({
  mimeType = 'audio/webm',
  maxDuration = 30000, // 30 seconds default
  onRecordingComplete,
  onError,
}: UseRecorderOptions = {}) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateDuration = useCallback(() => {
    if (startTimeRef.current && !state.isPaused) {
      const elapsed = Date.now() - startTimeRef.current;
      setState((prev) => ({ ...prev, duration: Math.min(elapsed, maxDuration) }));
    }
  }, [state.isPaused, maxDuration]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Check for supported MIME type
      let selectedMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = 'audio/webm'; // Fallback
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          selectedMimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });

      chunksRef.current = [];
      startTimeRef.current = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearTimer();
        
        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        onRecordingComplete?.(blob);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          duration: 0,
        }));
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`Recording error: ${event.error}`);
        setState((prev) => ({ ...prev, error: error.message }));
        onError?.(error);
        
        // Stop recording on error
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = window.setInterval(updateDuration, 100);

      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        error: null,
      });

      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to access microphone');
      setState((prev) => ({ ...prev, error: err.message }));
      onError?.(err);
    }
  }, [mimeType, onRecordingComplete, onError, updateDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
      clearTimer();
    }
  }, [state.isRecording, state.isPaused, clearTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - state.duration;
      setState((prev) => ({ ...prev, isPaused: false }));
      timerRef.current = window.setInterval(updateDuration, 100);
    }
  }, [state.isRecording, state.isPaused, state.duration, updateDuration]);

  const cancelRecording = useCallback(() => {
    clearTimer();
    
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    chunksRef.current = [];
    startTimeRef.current = null;

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      error: null,
    });
  }, [state.isRecording, clearTimer]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  };
};

export default useRecorder;
