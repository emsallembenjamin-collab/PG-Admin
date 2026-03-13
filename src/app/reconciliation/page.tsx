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
import type { Reconciliation as RecType } from "@/lib/goldpay-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Merchant } from "@/lib/goldpay-api";
import type { Provider } from "@/lib/goldpay-api";

function getReconciliationStatusClass(status: RecType["status"]) {
  if (status === "completed") return "merchant-status-pill-success";
  if (status === "failed") return "merchant-status-pill-error";
  if (status === "discrepancy") return "merchant-status-pill-warn";
  return "merchant-status-pill-neutral";
}

export default function ReconciliationPage() {
  const [list, setList] = useState<RecType[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterMerchant, setFilterMerchant] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, mList, pList] = await Promise.all([
        goldpayApi.reconciliation.list({
          status: filterStatus || undefined,
          merchantId: filterMerchant ? Number(filterMerchant) : undefined,
        }),
        goldpayApi.merchants.list(),
        goldpayApi.providers.list(),
      ]);
      setList(Array.isArray(recs) ? recs : []);
      setMerchants(mList);
      setProviders(pList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reconciliations");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMerchant]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Reconciliation" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Reconciliation" />

      <div className="merchant-toolbar mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="merchant-label">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="merchant-select min-w-[180px]"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="discrepancy">Discrepancy</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="merchant-label">Merchant</label>
          <select
            value={filterMerchant}
            onChange={(e) => setFilterMerchant(e.target.value)}
            className="merchant-select min-w-[180px]"
          >
            <option value="">All</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      <div className="merchant-card">
        <div className="p-4 sm:p-7.5">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2 [&>th]:py-4">
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Succeeded</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Discrepancies</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-dark-6">
                    No reconciliations found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((r) => (
                  <TableRow key={r.id} className="border-[#eee] dark:border-dark-3">
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell>
                      {new Date(r.reconciliation_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          getReconciliationStatusClass(r.status),
                        )}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell>{r.total_transactions} tx</TableCell>
                    <TableCell>{r.succeeded_count}</TableCell>
                    <TableCell>{r.failed_count}</TableCell>
                    <TableCell>{r.discrepancy_count}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/reconciliation/${r.id}`}
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
