import { useCallback, useRef } from 'react';

// Custom hook for managing data refresh across the application
export const useDataRefresh = () => {
  const refreshCallbacks = useRef<Set<() => void>>(new Set());

  // Register a callback to be called when data should be refreshed
  const registerRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbacks.current.add(callback);
    
    // Return cleanup function to unregister
    return () => {
      refreshCallbacks.current.delete(callback);
    };
  }, []);

  // Trigger all registered refresh callbacks
  const triggerRefresh = useCallback(() => {
    refreshCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in refresh callback:', error);
      }
    });
  }, []);

  // Trigger refresh after a delay (useful for operations that need time to complete)
  const triggerRefreshAfterDelay = useCallback((delayMs: number = 1000) => {
    setTimeout(() => {
      triggerRefresh();
    }, delayMs);
  }, [triggerRefresh]);

  return {
    registerRefreshCallback,
    triggerRefresh,
    triggerRefreshAfterDelay
  };
}; 