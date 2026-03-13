"use client";

import { goldpayApi, type TransactionWithRelations } from "@/lib/goldpay-api";
import { useRealtimeQuery } from "./use-realtime-query";

type DashboardMetadata = {
  dashboard?: {
    channel?: unknown;
    device?: unknown;
    visitors?: unknown;
  };
};

type DeviceMetric = {
  name: string;
  amount: number;
};

type ChannelMetric = {
  name: string;
  visitors: number;
  transactions: number;
  share: number;
};

export type AdminDashboardMetrics = {
  devices: DeviceMetric[];
  channels: ChannelMetric[];
  totalVisitors: number;
  totalTransactions: number;
};

const DEVICE_ORDER = ["Desktop", "Mobile", "Tablet", "Unknown"];
const PAGE_LIMIT = 100;
const MAX_PAGES = 20;
const METRICS_CACHE_TTL_MS = 15_000;

const metricsCache = new Map<
  string,
  {
    data?: AdminDashboardMetrics;
    promise?: Promise<AdminDashboardMetrics>;
    expiresAt: number;
  }
>();

function normalizeTimeFrame(timeFrame?: string) {
  return timeFrame === "yearly" ? "yearly" : "monthly";
}

function getStartDate(timeFrame?: string) {
  const start = new Date();

  if (normalizeTimeFrame(timeFrame) === "yearly") {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    start.setMonth(start.getMonth() - 1);
  }

  return start.toISOString();
}

function parseDashboardMetadata(metadata: string | null): DashboardMetadata["dashboard"] {
  if (!metadata) return undefined;

  try {
    const parsed = JSON.parse(metadata) as DashboardMetadata;
    return parsed.dashboard;
  } catch {
    return undefined;
  }
}

function toLabel(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized || fallback;
}

function toVisitors(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1;
}

async function fetchDashboardTransactions(timeFrame?: string) {
  const startDate = getStartDate(timeFrame);
  const transactions: TransactionWithRelations[] = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages && currentPage <= MAX_PAGES) {
    const response = await goldpayApi.transactions.listAdmin({
      page: currentPage,
      limit: PAGE_LIMIT,
      startDate,
    });

    transactions.push(...response.data);
    totalPages = response.totalPages;
    currentPage += 1;
  }

  return transactions;
}

function aggregateDashboardMetrics(
  transactions: TransactionWithRelations[],
): AdminDashboardMetrics {
  const deviceTotals = new Map<string, number>();
  const channelTotals = new Map<
    string,
    {
      visitors: number;
      transactions: number;
    }
  >();

  for (const transaction of transactions) {
    const dashboard = parseDashboardMetadata(transaction.metadata);
    const device = toLabel(dashboard?.device, "Unknown");
    const channel = toLabel(dashboard?.channel, "Unknown");
    const visitors = toVisitors(dashboard?.visitors);

    deviceTotals.set(device, (deviceTotals.get(device) ?? 0) + visitors);

    const existingChannel = channelTotals.get(channel);
    channelTotals.set(channel, {
      visitors: (existingChannel?.visitors ?? 0) + visitors,
      transactions: (existingChannel?.transactions ?? 0) + 1,
    });
  }

  const totalVisitors = [...deviceTotals.values()].reduce(
    (sum, amount) => sum + amount,
    0,
  );

  const orderedDevices = DEVICE_ORDER.map((name) => ({
    name,
    amount: deviceTotals.get(name) ?? 0,
  })).filter((item) => item.amount > 0);

  const remainingDevices = [...deviceTotals.entries()]
    .filter(([name]) => !DEVICE_ORDER.includes(name))
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const channels = [...channelTotals.entries()]
    .map(([name, value]) => ({
      name,
      visitors: value.visitors,
      transactions: value.transactions,
      share: totalVisitors > 0 ? value.visitors / totalVisitors : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);

  return {
    devices: [...orderedDevices, ...remainingDevices],
    channels,
    totalVisitors,
    totalTransactions: transactions.length,
  };
}

async function getCachedDashboardMetrics(timeFrame?: string) {
  const cacheKey = normalizeTimeFrame(timeFrame);
  const now = Date.now();
  const cached = metricsCache.get(cacheKey);

  if (cached?.data && cached.expiresAt > now) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetchDashboardTransactions(cacheKey)
    .then(aggregateDashboardMetrics)
    .then((data) => {
      metricsCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + METRICS_CACHE_TTL_MS,
      });
      return data;
    })
    .catch((error) => {
      metricsCache.delete(cacheKey);
      throw error;
    });

  metricsCache.set(cacheKey, {
    ...cached,
    promise,
    expiresAt: now + METRICS_CACHE_TTL_MS,
  });

  return promise;
}

export function useAdminDashboardMetrics(timeFrame?: string) {
  const normalizedTimeFrame = normalizeTimeFrame(timeFrame);

  return useRealtimeQuery(
    `admin-dashboard-metrics:${normalizedTimeFrame}`,
    () => getCachedDashboardMetrics(normalizedTimeFrame),
    {
      refetchIntervalMs: 30_000,
    },
  );
}
