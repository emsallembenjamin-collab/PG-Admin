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
import type { TransactionStatus, TransactionWithRelations } from "@/lib/goldpay-api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Merchant } from "@/lib/goldpay-api";

const PAGE_SIZE = 20;

function getHistoryStatusClass(status: TransactionStatus) {
  if (status === "succeeded") return "merchant-status-pill-success";
  if (status === "failed") return "merchant-status-pill-error";
  if (status === "pending" || status === "processing") {
    return "merchant-status-pill-warn";
  }
  return "merchant-status-pill-neutral";
}

export default function HistoryPage() {
  const [data, setData] = useState<{
    data: TransactionWithRelations[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filterMerchant, setFilterMerchant] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, mList] = await Promise.all([
        goldpayApi.transactions.listAdmin({
          page,
          limit: PAGE_SIZE,
          merchantId: filterMerchant ? Number(filterMerchant) : undefined,
          status: filterStatus || undefined,
        }),
        goldpayApi.merchants.list(),
      ]);
      setData(txRes);
      setMerchants(mList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [page, filterMerchant, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <>
        <Breadcrumb pageName="History" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading history…</p>
        </div>
      </>
    );
  }

  const list = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <>
      <Breadcrumb pageName="History" />

      <div className="merchant-toolbar mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="merchant-label">Merchant</label>
          <select
            value={filterMerchant}
            onChange={(e) => { setFilterMerchant(e.target.value); setPage(1); }}
            className="merchant-select min-w-[180px]"
          >
            <option value="">All</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="merchant-label">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as TransactionStatus); setPage(1); }}
            className="merchant-select min-w-[160px]"
          >
            <option value="">All</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
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
                <TableHead>Merchant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-dark-6">
                    No history found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((tx) => (
                  <TableRow key={tx.id} className="border-[#eee] dark:border-dark-3">
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>
                      {tx.merchant ? tx.merchant.name : `#${tx.merchant_id}`}
                    </TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell>
                      {tx.amount} {tx.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          getHistoryStatusClass(tx.status),
                        )}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-dark-6">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/transactions/${tx.id}`} className="font-semibold text-primary transition hover:text-primary/80">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-body-sm text-dark-6">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="merchant-secondary-button px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="merchant-secondary-button px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
