"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { goldpayApi } from "@/lib/goldpay-api";
import type { Currency } from "@/lib/goldpay-api";
import { cn } from "@/lib/utils";
import Link from "next/link";

function getCurrencyStatusClass(status: Currency["status"]) {
  return status === "active"
    ? "merchant-status-pill-success"
    : "merchant-status-pill-neutral";
}

export default function CurrenciesPage() {
  const { data, error, isLoading } = useRealtimeQuery<Currency[]>(
    "currencies",
    () => goldpayApi.currencies.list(),
    { refetchIntervalMs: 30_000 },
  );

  if (isLoading) {
    return (
      <>
        <Breadcrumb pageName="Currencies" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading currencies…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Currencies" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error.message}</p>
        </div>
      </>
    );
  }

  const currencies = data ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="Currencies" />
        <Link href="/currencies/new" className="merchant-primary-button px-6">
          New Currency
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {currencies.length === 0 ? (
          <div className="merchant-card p-8">
            <p className="text-dark-6">No currencies configured.</p>
          </div>
        ) : (
          currencies.map((currency) => (
            <Link
              key={currency.id}
              href={`/currencies/${currency.id}`}
              className="merchant-card p-6 transition hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#8A7A61] dark:text-dark-6">
                    {currency.name}
                  </p>
                  <h3 className="mt-2 text-[2rem] font-black leading-none tracking-[-0.05em] text-dark dark:text-white">
                    {currency.code}
                  </h3>
                </div>
                <span
                  className={cn(
                    "merchant-status-pill",
                    getCurrencyStatusClass(currency.status),
                  )}
                >
                  {currency.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 rounded-[20px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Symbol
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {currency.symbol || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Decimals
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {currency.decimal_places}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Config
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {currency.config ? "JSON" : "None"}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
