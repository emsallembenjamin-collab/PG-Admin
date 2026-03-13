import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing = data.growthRate < 0;

  return (
    <div className="merchant-card flex h-full flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
            {label}
          </p>
          <dt className="mt-2 text-[2rem] font-black leading-none tracking-[-0.05em] text-dark dark:text-white">
            {data.value}
          </dt>
        </div>

        <span className="grid size-12 place-items-center rounded-2xl bg-[#FBF2E7] text-[#D8A44D] dark:bg-dark-2 dark:text-brand-gold-light">
          <Icon className="size-6" />
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between">
        <dd className="text-sm font-medium text-dark-6">vs last period</dd>

        <dl
          className={cn(
            "merchant-status-pill",
            isDecreasing
              ? "merchant-status-pill-error"
              : "merchant-status-pill-success",
          )}
        >
          <dt className="flex items-center gap-1.5">
            {data.growthRate}%
            {isDecreasing ? (
              <ArrowDownIcon aria-hidden />
            ) : (
              <ArrowUpIcon aria-hidden />
            )}
          </dt>

          <dd className="sr-only">
            {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
            {data.growthRate}%
          </dd>
        </dl>
      </div>
    </div>
  );
}
