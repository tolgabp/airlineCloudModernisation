import { useEffect, useRef } from 'react';

interface UsePeriodicRefreshOptions {
  intervalMs?: number;
  enabled?: boolean;
  onRefresh: () => void;
}

// Hook for periodic data refresh
export const usePeriodicRefresh = ({
  intervalMs = 30000, // Default: 30 seconds
  enabled = true,
  onRefresh
}: UsePeriodicRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      onRefresh();
    }, intervalMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intervalMs, enabled, onRefresh]);

  // Return function to manually trigger refresh
  const triggerRefresh = () => {
    onRefresh();
  };

  return { triggerRefresh };
}; 