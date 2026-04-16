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
import type {
  TransactionStatus,
  TransactionType,
  TransactionWithRelations,
} from "@/lib/goldpay-api";
import { isSandboxTransaction } from "@/lib/goldpay-api/sandbox";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Merchant } from "@/lib/goldpay-api";
import { useSearchParams } from "next/navigation";

const PAGE_SIZE = 20;

function getTransactionStatusClass(status: TransactionStatus) {
  if (status === "succeeded") return "merchant-status-pill-success";
  if (status === "failed") return "merchant-status-pill-error";
  if (status === "pending" || status === "processing") {
    return "merchant-status-pill-warn";
  }
  return "merchant-status-pill-neutral";
}

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const merchantIdFromQuery = searchParams.get("merchantId") ?? "";
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
  const [filterMerchant, setFilterMerchant] = useState<string>(merchantIdFromQuery);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterSandbox, setFilterSandbox] = useState<string>("");
  const statusFilter =
    filterStatus === "pending" ||
    filterStatus === "processing" ||
    filterStatus === "succeeded" ||
    filterStatus === "failed" ||
    filterStatus === "reversed"
      ? (filterStatus as TransactionStatus)
      : undefined;
  const typeFilter =
    filterType === "deposit" || filterType === "withdrawal"
      ? (filterType as TransactionType)
      : undefined;
  const sandboxFilter =
    filterSandbox === "sandbox"
      ? true
      : filterSandbox === "live"
        ? false
        : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txRes, mList] = await Promise.all([
        goldpayApi.transactions.listAdmin({
          page,
          limit: PAGE_SIZE,
          merchantId: filterMerchant ? Number(filterMerchant) : undefined,
          status: statusFilter,
          type: typeFilter,
          sandbox: sandboxFilter,
        }),
        goldpayApi.merchants.list(),
      ]);
      setData(txRes);
      setMerchants(mList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
  }, [page, filterMerchant, sandboxFilter, statusFilter, typeFilter]);

  useEffect(() => {
    setFilterMerchant(merchantIdFromQuery);
    setPage(1);
  }, [merchantIdFromQuery]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <>
        <Breadcrumb pageName="Transactions" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading transactions...</p>
        </div>
      </>
    );
  }

  const list = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  return (
    <>
      <Breadcrumb pageName="Transactions" />

      <div className="merchant-toolbar mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="merchant-label">Merchant</label>
          <select
            value={filterMerchant}
            onChange={(e) => {
              setFilterMerchant(e.target.value);
              setPage(1);
            }}
            className="merchant-select min-w-[180px]"
          >
            <option value="">All</option>
            {merchants.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="merchant-label">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="merchant-select min-w-[160px]"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
        <div>
          <label className="merchant-label">Type</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="merchant-select min-w-[160px]"
          >
            <option value="">All</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div>
          <label className="merchant-label">Mode</label>
          <select
            value={filterSandbox}
            onChange={(e) => {
              setFilterSandbox(e.target.value);
              setPage(1);
            }}
            className="merchant-select min-w-[160px]"
          >
            <option value="">All</option>
            <option value="sandbox">Sandbox only</option>
            <option value="live">Live only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="merchant-card">
        <div className="p-4 sm:p-7.5">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2 [&>th]:py-4">
                <TableHead>ID</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-8 text-center text-dark-6"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-[#eee] dark:border-dark-3"
                  >
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          isSandboxTransaction(tx)
                            ? "bg-primary/10 text-primary"
                            : "merchant-status-pill-neutral",
                        )}
                      >
                        {isSandboxTransaction(tx) ? "Sandbox" : "Live"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.merchant ? tx.merchant.name : `#${tx.merchant_id}`}
                    </TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell>
                      {tx.amount} {tx.currency}
                    </TableCell>
                    <TableCell>
                      {Number(
                        tx.total_fee_amount ??
                          Number(tx.system_fee_amount ?? 0) +
                            Number(tx.third_party_fee_amount ?? 0),
                      ).toFixed(2)}{" "}
                      {tx.currency}
                    </TableCell>
                    <TableCell>
                      {Number(tx.merchant_settlement_amount ?? tx.amount).toFixed(2)}{" "}
                      {tx.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "merchant-status-pill",
                          getTransactionStatusClass(tx.status),
                        )}
                      >
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-dark-6">
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/transactions/${tx.id}`}
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-body-sm text-dark-6">
                Page {currentPage} of {totalPages} ({total} total)
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
