import { useEffect, useRef } from 'react';
import type { LifecycleOptions } from './types';

/**
 * A structured lifecycle hook providing Vue-style explicit lifecycle management
 * with powerful debugging capabilities.
 *
 * Phase 1: Implements onMount and onUnmount functionality
 * Phase 2: Implements watch functionality with dependency array management
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
 *   watch: {
 *     target: [count, name],
 *     handler: (values, prevValues) => {
 *       console.log('Values changed:', values);
 *     },
 *     immediate: true,
 *   },
 *   debug: true,
 * });
 * ```
 */
export function useLifecycle(options: LifecycleOptions): void {
  const { onMount, watch, debug } = options;
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

  // Phase 1: Handle onMount and onUnmount
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

  // Phase 2: Handle watch functionality
  if (watch) {
    const prevValuesRef = useRef<any[] | undefined>();
    const isInitialRef = useRef(true);

    useEffect(() => {
      const { target, handler, immediate } = watch;
      const currentValues = target;

      // Check if any value has changed using Object.is
      const hasChanged =
        prevValuesRef.current === undefined ||
        currentValues.some((value, index) => !Object.is(value, prevValuesRef.current?.[index]));

      // Handle immediate execution on mount
      if (immediate && isInitialRef.current) {
        if (debugEnabled.current) {
          const label = debugLabel.current ? ` [${debugLabel.current}]` : '';
          console.group(`🔄 useLifecycle Watch (immediate)${label}`);
          console.log('Watch event: IMMEDIATE EXECUTION');
          if (debugDetailed.current) {
            console.log('Current values:', currentValues);
            console.log('Previous values:', undefined);
          }
        }

        handler(currentValues, undefined);

        if (debugEnabled.current) {
          console.groupEnd();
        }

        isInitialRef.current = false;
        prevValuesRef.current = [...currentValues];
      } else if (hasChanged && !isInitialRef.current) {
        // Handle change detection
        if (debugEnabled.current) {
          const label = debugLabel.current ? ` [${debugLabel.current}]` : '';
          console.group(`🔄 useLifecycle Watch${label}`);
          console.log('Change detected');
          if (debugDetailed.current) {
            console.log('Current values:', currentValues);
            console.log('Previous values:', prevValuesRef.current);
            // Log changed indices
            const changedIndices = currentValues
              .map((value, index) => (!Object.is(value, prevValuesRef.current?.[index]) ? index : -1))
              .filter(index => index !== -1);
            if (changedIndices.length > 0) {
              console.log('Changed indices:', changedIndices);
              changedIndices.forEach(index => {
                console.log(
                  `  [${index}]: ${JSON.stringify(prevValuesRef.current?.[index])} -> ${JSON.stringify(
                    currentValues[index]
                  )}`
                );
              });
            }
          }
        }

        handler(currentValues, prevValuesRef.current);

        if (debugEnabled.current) {
          console.groupEnd();
        }

        prevValuesRef.current = [...currentValues];
      } else if (!isInitialRef.current) {
        // Mark as initialized after first run (even if no change)
        isInitialRef.current = false;
      }

      // Mark as initialized
      if (isInitialRef.current && !immediate) {
        isInitialRef.current = false;
        prevValuesRef.current = [...currentValues];
      }
    }, watch.target); // eslint-disable-line react-hooks/exhaustive-deps
  }
}
