"use client";

import { compactFormat } from "@/lib/format-number";
import { useAdminDashboardMetrics } from "@/hooks/use-admin-dashboard-metrics";

export function RegionLabels() {
  const { data, error, isLoading, isRefetching } =
    useAdminDashboardMetrics("monthly");
  const channels = data?.channels.slice(0, 6) ?? [];

  return (
    <div className="merchant-card col-span-12 p-7.5 xl:col-span-7">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            Traffic Sources
          </h2>
          <p className="mt-1 text-sm text-[#8A7A61] dark:text-dark-6">
            Last 30 days from admin transaction metadata
            {isRefetching ? " · updating" : ""}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="merchant-card-subtle min-w-[120px] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
              Visitors
            </p>
            <p className="mt-2 text-xl font-black tracking-[-0.04em] text-dark dark:text-white">
              {compactFormat(data?.totalVisitors ?? 0)}
            </p>
          </div>

          <div className="merchant-card-subtle min-w-[120px] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
              Transactions
            </p>
            <p className="mt-2 text-xl font-black tracking-[-0.04em] text-dark dark:text-white">
              {compactFormat(data?.totalTransactions ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-500">
          Failed to load traffic-source data.
        </p>
      ) : isLoading && channels.length === 0 ? (
        <p className="text-sm text-[#8A7A61] dark:text-dark-6">
          Loading traffic-source data...
        </p>
      ) : channels.length === 0 ? (
        <p className="text-sm text-[#8A7A61] dark:text-dark-6">
          No traffic-source metadata available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => (
            <div key={channel.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-dark dark:text-white">
                    {channel.name}
                  </p>
                  <p className="text-sm text-[#8A7A61] dark:text-dark-6">
                    {compactFormat(channel.transactions)} transactions
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold text-dark dark:text-white">
                    {compactFormat(channel.visitors)}
                  </p>
                  <p className="text-sm text-[#8A7A61] dark:text-dark-6">
                    {(channel.share * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#EFE6DA] dark:bg-dark-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[#8EA0FF]"
                  style={{ width: `${Math.max(channel.share * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
