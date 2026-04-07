import { useEffect, useRef } from 'react';
import type { LifecycleOptions } from './types';

/**
 * A structured lifecycle hook providing Vue-style explicit lifecycle management
 * with powerful debugging capabilities.
 *
 * Phase 1: Implements onMount and onUnmount functionality
 *
 * @param options - Configuration object with lifecycle callbacks
 *
 * @example
 * ```tsx
 * useLifecycle({
 *   onMount: () => {
 *     console.log('Component mounted');
 *     return () => {
 *       console.log('Component unmounting');
 *     };
 *   },
 *   debug: true,
 * });
 * ```
 */
export function useLifecycle(options: LifecycleOptions): void {
  const { onMount, debug } = options;
  const debugEnabled = useRef(false);
  const debugLabel = useRef<string | undefined>();
  const debugDetailed = useRef(false);

  // Normalize debug options
  if (debug) {
    debugEnabled.current = typeof debug === 'boolean' ? debug : true;
    if (typeof debug === 'object') {
      debugLabel.current = debug.label;
      debugDetailed.current = debug.detailed ?? false;
    }
  }

  useEffect(() => {
    if (debugEnabled.current) {
      const label = debugLabel.current ? ` [${debugLabel.current}]` : '';
      console.group(`🔄 useLifecycle Mount${label}`);
      console.log('Lifecycle event: MOUNT');
      if (debugDetailed.current) {
        console.log('Timestamp:', new Date().toISOString());
      }
    }

    // Execute onMount and capture cleanup function
    const cleanup = onMount?.();

    if (debugEnabled.current) {
      const hasCleanup = typeof cleanup === 'function';
      console.log(`Cleanup registered: ${hasCleanup}`);
      console.groupEnd();
    }

    // Return cleanup function for unmount
    return () => {
      if (debugEnabled.current) {
        const label = debugLabel.current ? ` [${debugLabel.current}]` : '';
        console.group(`🔄 useLifecycle Unmount${label}`);
        console.log('Lifecycle event: UNMOUNT');
        if (debugDetailed.current) {
          console.log('Timestamp:', new Date().toISOString());
        }
      }

      // Execute cleanup function if provided
      if (typeof cleanup === 'function') {
        cleanup();
      }

      if (debugEnabled.current) {
        console.groupEnd();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
