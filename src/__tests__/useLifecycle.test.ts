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

describe('useLifecycle - Phase 2: watch & dependency array management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('watchが発火する', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ count }: { count: number }) =>
        useLifecycle({
          watch: {
            target: [count],
            handler
          }
        }),
      { initialProps: { count: 0 } }
    );

    // 初回マウント時は実行されない（immediate: falseがデフォルト）
    expect(handler).not.toHaveBeenCalled();

    // 値が変わったときに実行される
    rerender({ count: 1 });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith([1], [0]);

    unmount();
  });

  it('複数のwatch値を監視', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ count, name }: { count: number; name: string }) =>
        useLifecycle({
          watch: {
            target: [count, name],
            handler
          }
        }),
      { initialProps: { count: 0, name: 'initial' } }
    );

    expect(handler).not.toHaveBeenCalled();

    // countが変わったときに発火
    rerender({ count: 1, name: 'initial' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith([1, 'initial'], [0, 'initial']);

    handler.mockClear();

    // nameが変わったときに発火
    rerender({ count: 1, name: 'updated' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith([1, 'updated'], [1, 'initial']);

    unmount();
  });

  it('immediate: trueで初回実行', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(
      ({ count }: { count: number }) =>
        useLifecycle({
          watch: {
            target: [count],
            handler,
            immediate: true
          }
        }),
      { initialProps: { count: 0 } }
    );

    // マウント時に即座に実行される
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith([0], undefined);

    unmount();
  });

  it('immediate: false（デフォルト）で初回実行されない', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ count }: { count: number }) =>
        useLifecycle({
          watch: {
            target: [count],
            handler,
            immediate: false
          }
        }),
      { initialProps: { count: 0 } }
    );

    // マウント時は実行されない
    expect(handler).not.toHaveBeenCalled();

    // 値が変わったときのみ実行
    rerender({ count: 1 });
    expect(handler).toHaveBeenCalledOnce();

    unmount();
  });

  it('前回値と現在値が正しく渡される', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ count }: { count: number }) =>
        useLifecycle({
          watch: {
            target: [count],
            handler
          }
        }),
      { initialProps: { count: 0 } }
    );

    // 初回は実行されない
    expect(handler).not.toHaveBeenCalled();

    // 1回目の変更
    rerender({ count: 1 });
    expect(handler).toHaveBeenNthCalledWith(1, [1], [0]);

    // 2回目の変更
    rerender({ count: 2 });
    expect(handler).toHaveBeenNthCalledWith(2, [2], [1]);

    // 3回目の変更
    rerender({ count: 5 });
    expect(handler).toHaveBeenNthCalledWith(3, [5], [2]);

    expect(handler).toHaveBeenCalledTimes(3);

    unmount();
  });

  it('複数回のwatch実行', () => {
    const handler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ value }: { value: number }) =>
        useLifecycle({
          watch: {
            target: [value],
            handler
          }
        }),
      { initialProps: { value: 0 } }
    );

    // 複数回の変更をテスト
    rerender({ value: 1 });
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });

    expect(handler).toHaveBeenCalledTimes(4);
    expect(handler).toHaveBeenNthCalledWith(1, [1], [0]);
    expect(handler).toHaveBeenNthCalledWith(2, [2], [1]);
    expect(handler).toHaveBeenNthCalledWith(3, [3], [2]);
    expect(handler).toHaveBeenNthCalledWith(4, [4], [3]);

    unmount();
  });

  it('watchとonMountを同時に使用', () => {
    const onMountCallback = vi.fn();
    const watchHandler = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ count }: { count: number }) =>
        useLifecycle({
          onMount: onMountCallback,
          watch: {
            target: [count],
            handler: watchHandler
          }
        }),
      { initialProps: { count: 0 } }
    );

    // onMountは実行されて、watchハンドラは実行されない
    expect(onMountCallback).toHaveBeenCalledOnce();
    expect(watchHandler).not.toHaveBeenCalled();

    // 値が変わるとwatchハンドラが実行される
    rerender({ count: 1 });
    expect(onMountCallback).toHaveBeenCalledOnce();
    expect(watchHandler).toHaveBeenCalledOnce();

    unmount();
  });
});
