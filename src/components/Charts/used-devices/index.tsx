"use client";

import { PeriodPicker } from "@/components/period-picker";
import { useAdminDashboardMetrics } from "@/hooks/use-admin-dashboard-metrics";
import { cn } from "@/lib/utils";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const { data, error, isLoading, isRefetching } =
    useAdminDashboardMetrics(timeFrame);

  const devices = data?.devices ?? [];

  return (
    <div
      className={cn(
        "merchant-card grid grid-cols-1 grid-rows-[auto_1fr] gap-9 p-7.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            Used Devices
          </h2>
          <p className="mt-1 text-sm text-[#8A7A61] dark:text-dark-6">
            Real admin traffic by device
            {isRefetching ? " · updating" : ""}
          </p>
        </div>

        <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
      </div>

      <div className="grid place-items-center">
        {error ? (
          <p className="text-sm text-red-500">
            Failed to load device usage.
          </p>
        ) : isLoading && devices.length === 0 ? (
          <p className="text-sm text-[#8A7A61] dark:text-dark-6">
            Loading device usage...
          </p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-[#8A7A61] dark:text-dark-6">
            No device data available yet.
          </p>
        ) : (
          <DonutChart data={devices} />
        )}
      </div>
    </div>
  );
}
