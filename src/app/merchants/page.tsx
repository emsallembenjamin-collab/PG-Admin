"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { goldpayApi } from "@/lib/goldpay-api";
import type { Merchant } from "@/lib/goldpay-api";
import Link from "next/link";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { cn } from "@/lib/utils";

function formatLedgerAmount(amount: number | undefined, currency: string | undefined) {
  const c = (currency || "USD").toUpperCase();
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
}

function ledgerSummary(m: Merchant): { primary: string; hint?: string } {
  const rows = m.balances?.filter(Boolean) ?? [];
  if (rows.length > 0) {
    const primaryRow = rows.find((r) => r.currency?.toUpperCase() === "USD") ?? rows[0];
    const primary = formatLedgerAmount(primaryRow.balance_total, primaryRow.currency);
    if (rows.length > 1) {
      return { primary, hint: `${rows.length} currencies` };
    }
    return { primary };
  }
  return {
    primary: formatLedgerAmount(m.balance_total, m.balance_currency),
  };
}

function getMerchantStatusClass(status: Merchant["status"]) {
  if (status === "active") return "merchant-status-pill-success";
  if (status === "suspended") return "merchant-status-pill-error";
  return "merchant-status-pill-neutral";
}

export default function MerchantsPage() {
  const { data: merchants, error, isLoading } = useRealtimeQuery<Merchant[]>(
    "merchants",
    () => goldpayApi.merchants.list(),
    { refetchIntervalMs: 30_000 }
  );

  if (isLoading) {
    return (
      <>
        <Breadcrumb pageName="Merchants" />
        <div className="merchant-card p-8">
          <p className="text-dark-6 dark:text-dark-5">Loading merchants…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Merchants" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error.message}</p>
        </div>
      </>
    );
  }

  const list = merchants ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="Merchants" />
        <Link
          href="/merchants/new"
          className="merchant-primary-button px-6"
        >
          New Merchant
        </Link>
      </div>

      <div className="merchant-card">
        <div className="p-4 sm:p-7.5">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2 [&>th]:py-4">
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="min-w-[140px]">Ledger</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-dark-6">
                    No merchants yet. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((m) => (
                  <TableRow key={m.id} className="border-[#eee] dark:border-dark-3">
                    <TableCell>
                      <Link href={`/merchants/${m.id}`} className="font-medium text-primary hover:underline">
                        {m.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-dark dark:text-white">{m.email}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          getMerchantStatusClass(m.status),
                        )}
                      >
                        {m.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {m.provider
                        ? m.provider.display_name || m.provider.name
                        : m.provider_id
                        ? `#${m.provider_id}`
                        : <span className="text-dark-6">—</span>}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const { primary, hint } = ledgerSummary(m);
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-dark dark:text-white">{primary}</span>
                            {hint ? (
                              <span className="text-[11px] text-dark-6 dark:text-dark-5">{hint}</span>
                            ) : null}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/merchants/${m.id}`}
                        className="font-semibold text-primary transition hover:text-primary/80"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
