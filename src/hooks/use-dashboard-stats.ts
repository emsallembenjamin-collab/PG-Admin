"use client";

import { useMemo } from "react";
import { goldpayApi } from "@/lib/goldpay-api";
import { useRealtimeQuery } from "./use-realtime-query";

export interface DashboardStats {
  merchantsCount: number;
  providersCount: number;
  activeMerchantsCount: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [merchants, providers] = await Promise.all([
    goldpayApi.merchants.list(),
    goldpayApi.providers.list(),
  ]);
  const activeMerchantsCount = merchants.filter((m) => m.status === "active").length;
  return {
    merchantsCount: merchants.length,
    providersCount: providers.length,
    activeMerchantsCount,
  };
}

/**
 * Dashboard KPIs with real-time polling (refetch every 15s).
 * Uses GoldPay API; ensure user is logged in (JWT).
 */
export function useDashboardStats(options?: { refetchIntervalMs?: number; enabled?: boolean }) {
  const fetcher = useMemo(() => fetchDashboardStats, []);
  return useRealtimeQuery<DashboardStats>(
    "dashboard-stats",
    fetcher,
    {
      refetchIntervalMs: options?.refetchIntervalMs ?? 15_000,
      enabled: options?.enabled ?? true,
    }
  );
}
