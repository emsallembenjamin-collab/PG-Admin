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
import type { Provider } from "@/lib/goldpay-api";
import Link from "next/link";
import { useRealtimeQuery } from "@/hooks/use-realtime-query";
import { cn } from "@/lib/utils";

function getProviderStatusClass(status: Provider["status"]) {
  return status === "active"
    ? "merchant-status-pill-success"
    : "merchant-status-pill-neutral";
}

export default function ProvidersPage() {
  const { data: providers, error, isLoading } = useRealtimeQuery<Provider[]>(
    "providers",
    () => goldpayApi.providers.list(),
    { refetchIntervalMs: 30_000 }
  );

  if (isLoading) {
    return (
      <>
        <Breadcrumb pageName="Providers" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading providers…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Providers" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error.message}</p>
        </div>
      </>
    );
  }

  const list = providers ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="Providers" />
        <Link
          href="/providers/new"
          className="merchant-primary-button px-6"
        >
          New Provider
        </Link>
      </div>

      <div className="merchant-card">
        <div className="p-4 sm:p-7.5">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2 [&>th]:py-4">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Fee %</TableHead>
                <TableHead>Min / Max</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-dark-6">
                    No providers configured.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => (
                  <TableRow key={p.id} className="border-[#eee] dark:border-dark-3">
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-dark dark:text-white">
                      {p.display_name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          getProviderStatusClass(p.status),
                        )}
                      >
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell>{p.priority}</TableCell>
                    <TableCell>{p.fee_percentage ?? "—"}%</TableCell>
                    <TableCell className="text-dark-6">
                      {p.min_amount ?? "—"} / {p.max_amount ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/providers/${p.id}`}
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
