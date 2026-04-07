/**
 * Watch configuration for monitoring value changes
 */
export type WatchConfig<T extends any[] = any[]> = {
  /**
   * Array of values to watch for changes
   */
  target: T;

  /**
   * Callback function invoked when any watched value changes.
   * Receives current and previous values.
   */
  handler: (values: T, prevValues: T | undefined) => void;

  /**
   * Whether to invoke handler immediately on mount.
   * @default false
   */
  immediate?: boolean;
};

/**
 * Lifecycle hook options configuration
 */
export type LifecycleOptions = {
  /**
   * Callback function executed on component mount.
   * Optionally returns a cleanup function to be called on unmount.
   */
  onMount?: () => void | (() => void);

  /**
   * Watch configuration for monitoring value changes
   */
  watch?: WatchConfig;

  /**
   * Debug configuration for logging lifecycle events
   */
  debug?: boolean | {
    label?: string;
    detailed?: boolean;
  };
};
