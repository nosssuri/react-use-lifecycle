import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLifecycle } from '../useLifecycle';

describe('useLifecycle - Phase 1: onMount & onUnmount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('onMountコールバックが実行される', () => {
    const mockCallback = vi.fn();
    const { unmount } = renderHook(() => useLifecycle({ onMount: mockCallback }));

    expect(mockCallback).toHaveBeenCalledOnce();
    unmount();
  });

  it('onUnmountクリーンアップが実行される', () => {
    const mockCleanup = vi.fn();
    const mockCallback = vi.fn(() => mockCleanup);
    const { unmount } = renderHook(() => useLifecycle({ onMount: mockCallback }));

    expect(mockCallback).toHaveBeenCalledOnce();
    expect(mockCleanup).not.toHaveBeenCalled();

    unmount();
    expect(mockCleanup).toHaveBeenCalledOnce();
  });

  it('onMountがなくても動作する', () => {
    const { unmount } = renderHook(() => useLifecycle({}));

    // Should not throw any error
    expect(() => unmount()).not.toThrow();
  });

  it('debug: trueで出力される', () => {
    const groupSpy = vi.spyOn(console, 'group');
    const logSpy = vi.spyOn(console, 'log');
    const groupEndSpy = vi.spyOn(console, 'groupEnd');

    const { unmount } = renderHook(() =>
      useLifecycle({ onMount: () => {}, debug: true })
    );

    // MOUNT時の出力確認
    expect(groupSpy).toHaveBeenCalledWith(expect.stringContaining('Mount'));
    expect(logSpy).toHaveBeenCalledWith('Lifecycle event: MOUNT');
    expect(groupEndSpy).toHaveBeenCalled();

    groupSpy.mockClear();
    logSpy.mockClear();
    groupEndSpy.mockClear();

    // UNMOUNT時の出力確認
    unmount();
    expect(groupSpy).toHaveBeenCalledWith(expect.stringContaining('Unmount'));
    expect(logSpy).toHaveBeenCalledWith('Lifecycle event: UNMOUNT');
    expect(groupEndSpy).toHaveBeenCalled();

    groupSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();
  });

  it('デバッグラベルが出力に含まれる', () => {
    const groupSpy = vi.spyOn(console, 'group');

    const { unmount } = renderHook(() =>
      useLifecycle({
        onMount: () => {},
        debug: { label: 'TestComponent' }
      })
    );

    // ラベルが含まれていることを確認
    expect(groupSpy).toHaveBeenCalledWith(expect.stringContaining('TestComponent'));

    groupSpy.mockClear();

    unmount();
    expect(groupSpy).toHaveBeenCalledWith(expect.stringContaining('TestComponent'));

    groupSpy.mockRestore();
  });

  it('デバッグ詳細（detailed）でタイムスタンプが出力される', () => {
    const logSpy = vi.spyOn(console, 'log');

    const { unmount } = renderHook(() =>
      useLifecycle({
        onMount: () => {},
        debug: { detailed: true }
      })
    );

    // MOUNT時にタイムスタンプが出力されていることを確認
    expect(logSpy).toHaveBeenCalledWith('Timestamp:', expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));

    logSpy.mockClear();

    unmount();
    // UNMOUNT時にもタイムスタンプが出力されていることを確認
    expect(logSpy).toHaveBeenCalledWith('Timestamp:', expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/));

    logSpy.mockRestore();
  });
});
