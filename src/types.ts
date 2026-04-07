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
   * Debug configuration for logging lifecycle events
   */
  debug?: boolean | {
    label?: string;
    detailed?: boolean;
  };
};
