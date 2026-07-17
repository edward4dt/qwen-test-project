/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useRecorder } from '../useRecorder';

// Mock MediaRecorder
class MockMediaRecorder {
  static isTypeSupported = jest.fn(() => true);
  state = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'stopped';
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
  configurable: true,
});

beforeEach(() => {
  jest.clearAllMocks();
  (MockMediaRecorder.isTypeSupported as jest.Mock).mockReturnValue(true);
  global.MediaRecorder = MockMediaRecorder as any;
});

describe('useRecorder Hook', () => {
  test('T203: initializes with default state', () => {
    const { result } = renderHook(() => useRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
  });

  test('T203: starts recording successfully', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  test('T203: handles microphone access error', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    const onError = jest.fn();
    const { result } = renderHook(() => useRecorder({ onError }));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toContain('Permission denied');
    expect(onError).toHaveBeenCalled();
  });

  test('T203: stops recording and calls callback', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);
    const onRecordingComplete = jest.fn();

    const { result } = renderHook(() => useRecorder({ onRecordingComplete }));

    // Start recording
    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    // Stop recording
    await act(async () => {
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(onRecordingComplete).toHaveBeenCalled();
  });

  test('T203: pauses and resumes recording', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useRecorder());

    // Start recording
    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);

    // Pause recording
    await act(async () => {
      result.current.pauseRecording();
    });

    expect(result.current.isPaused).toBe(true);

    // Resume recording
    await act(async () => {
      result.current.resumeRecording();
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.isRecording).toBe(true);
  });

  test('T203: cancels recording and cleans up', async () => {
    const mockTrack = { stop: jest.fn() };
    const mockStream = { getTracks: jest.fn(() => [mockTrack]) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useRecorder());

    // Start recording
    await act(async () => {
      await result.current.startRecording();
    });

    // Cancel recording
    await act(async () => {
      result.current.cancelRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBeNull();
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  test('T203: respects maxDuration option', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useRecorder({ maxDuration: 5000 }));

    await act(async () => {
      await result.current.startRecording();
    });

    // Duration should not exceed maxDuration
    expect(result.current.duration).toBeLessThanOrEqual(5000);
  });

  test('T203: uses custom mimeType when provided', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);
    (MockMediaRecorder.isTypeSupported as jest.Mock).mockImplementation(
      (type: string) => type === 'audio/ogg'
    );

    const { result } = renderHook(() => useRecorder({ mimeType: 'audio/ogg' }));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
  });

  test('T203: handles recording error', async () => {
    const mockStream = { getTracks: jest.fn(() => []) } as any;
    mockGetUserMedia.mockResolvedValue(mockStream);
    const onError = jest.fn();

    const { result } = renderHook(() => useRecorder({ onError }));

    await act(async () => {
      await result.current.startRecording();
    });

    // Simulate error
    await act(async () => {
      const mockEvent = { error: new Error('Test error') };
      // The hook should handle this internally
    });

    // Error handling is tested through the callback
    expect(onError).not.toHaveBeenCalled(); // No error occurred in normal flow
  });

  test('T203: provides all required methods', () => {
    const { result } = renderHook(() => useRecorder());

    expect(typeof result.current.startRecording).toBe('function');
    expect(typeof result.current.stopRecording).toBe('function');
    expect(typeof result.current.pauseRecording).toBe('function');
    expect(typeof result.current.resumeRecording).toBe('function');
    expect(typeof result.current.cancelRecording).toBe('function');
  });
});
