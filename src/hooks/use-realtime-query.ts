"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseRealtimeQueryOptions<T> {
  /** Polling interval in milliseconds. Default 10_000 (10s). */
  refetchIntervalMs?: number;
  /** If false, stops polling and does not run initial fetch. Default true. */
  enabled?: boolean;
  /** Initial data before first fetch. */
  initialData?: T;
}

export interface UseRealtimeQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches data and refetches on an interval (polling) for near–real-time updates
 * when the GoldPay server does not yet expose WebSockets/SSE.
 * Use for dashboard KPIs, transaction lists, and reconciliation status.
 */
export function useRealtimeQuery<T>(
  queryKey: string,
  fetcher: () => Promise<T>,
  options: UseRealtimeQueryOptions<T> = {}
): UseRealtimeQueryResult<T> {
  const {
    refetchIntervalMs = 10_000,
    enabled = true,
    initialData,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefetching, setIsRefetching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (isRefetch = false) => {
    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    fetchData(false);

    if (refetchIntervalMs > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchIntervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, queryKey, refetchIntervalMs, fetchData]);

  return {
    data,
    error,
    isLoading,
    isRefetching,
    refetch,
  };
}
