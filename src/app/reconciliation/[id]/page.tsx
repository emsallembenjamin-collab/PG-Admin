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
import type { ReconciliationWithDiscrepancies } from "@/lib/goldpay-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getReconciliationStatusClass(status: ReconciliationWithDiscrepancies["status"]) {
  if (status === "completed") return "merchant-status-pill-success";
  if (status === "failed") return "merchant-status-pill-error";
  if (status === "discrepancy") return "merchant-status-pill-warn";
  return "merchant-status-pill-neutral";
}

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [rec, setRec] = useState<ReconciliationWithDiscrepancies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesByDiscrepancyId, setNotesByDiscrepancyId] = useState<Record<number, string>>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [replayingId, setReplayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    goldpayApi.reconciliation
      .get(id)
      .then(setRec)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleResolve = async (discrepancyId: number) => {
    const notes = notesByDiscrepancyId[discrepancyId]?.trim();
    if (!notes) return;
    setResolvingId(discrepancyId);
    try {
      await goldpayApi.reconciliation.resolveDiscrepancy(
        discrepancyId,
        notes,
        1 // resolvedBy - in real app use current admin user id
      );
      const updated = await goldpayApi.reconciliation.get(id);
      setRec(updated);
      setNotesByDiscrepancyId((prev) => ({ ...prev, [discrepancyId]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setResolvingId(null);
    }
  };

  const handleReplayCallback = async (discrepancyId: number) => {
    setReplayingId(discrepancyId);
    try {
      await goldpayApi.reconciliation.replayCallback(discrepancyId);
      const updated = await goldpayApi.reconciliation.get(id);
      setRec(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to replay callback");
    } finally {
      setReplayingId(null);
    }
  };

  const parseJson = (raw?: string | null): Record<string, unknown> | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  if (loading && !rec) {
    return (
      <>
        <Breadcrumb pageName="Reconciliation" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading…</p>
        </div>
      </>
    );
  }

  if (error && !rec) {
    return (
      <>
        <Breadcrumb pageName="Reconciliation" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error}</p>
          <Link href="/reconciliation" className="mt-4 inline-block text-primary hover:underline">
            Back to Reconciliation
          </Link>
        </div>
      </>
    );
  }

  if (!rec) return null;

  const discrepancies = rec.discrepancies ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName={`Reconciliation #${rec.id}`} />
        <Link href="/reconciliation" className="font-semibold text-primary transition hover:text-primary/80">
          ← Back to Reconciliation
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Summary</h3>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-body-sm text-dark-6">Type</dt>
              <dd className="font-medium text-dark dark:text-white capitalize">{rec.type}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Date</dt>
              <dd className="font-medium text-dark dark:text-white">
                {new Date(rec.reconciliation_date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Status</dt>
              <dd>
                <span
                  className={cn(
                    "merchant-status-pill",
                    getReconciliationStatusClass(rec.status),
                  )}
                >
                  {rec.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Total transactions</dt>
              <dd className="font-medium text-dark dark:text-white">{rec.total_transactions}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Total amount</dt>
              <dd className="font-medium text-dark dark:text-white">{rec.total_amount}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Succeeded</dt>
              <dd className="font-medium text-dark dark:text-white">
                {rec.succeeded_count} ({rec.succeeded_amount})
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Failed</dt>
              <dd className="font-medium text-dark dark:text-white">
                {rec.failed_count} ({rec.failed_amount})
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-dark-6">Discrepancies</dt>
              <dd className="font-medium text-dark dark:text-white">{rec.discrepancy_count}</dd>
            </div>
          </dl>
          {rec.notes && (
            <div className="mt-4">
              <dt className="text-body-sm text-dark-6">Notes</dt>
              <dd className="mt-1 text-dark dark:text-white">{rec.notes}</dd>
            </div>
          )}
        </div>

        {discrepancies.length > 0 && (
          <div className="merchant-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Discrepancies
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2">
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expected / Actual</TableHead>
                  <TableHead>Resolution</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discrepancies.map((d) => (
                  (() => {
                    const expected = parseJson(d.expected_value);
                    const actual = parseJson(d.actual_value);
                    const canReplay =
                      d.status === "open" &&
                      d.type === "status_mismatch" &&
                      (d.description.toLowerCase().includes("callback") ||
                        d.description.toLowerCase().includes("merchant webhook"));
                    return (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.id}</TableCell>
                    <TableCell className="capitalize">{d.type?.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-block rounded-full px-3.5 py-1 text-sm font-medium",
                          d.status === "resolved" && "bg-[#219653]/[0.08] text-[#219653]",
                          d.status === "open" && "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                        )}
                      >
                        {d.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{d.description}</TableCell>
                    <TableCell className="max-w-xs text-xs text-dark-6">
                      <div>
                        <p className="font-semibold text-dark dark:text-white">Expected</p>
                        <pre className="mt-1 whitespace-pre-wrap break-all">
                          {expected ? JSON.stringify(expected, null, 2) : "—"}
                        </pre>
                      </div>
                      <div className="mt-2">
                        <p className="font-semibold text-dark dark:text-white">Actual</p>
                        <pre className="mt-1 whitespace-pre-wrap break-all">
                          {actual ? JSON.stringify(actual, null, 2) : "—"}
                        </pre>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-dark-6">
                      {d.resolution_notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "open" && (
                        <div className="flex items-center justify-end gap-2">
                          {canReplay && (
                            <button
                              type="button"
                              disabled={replayingId !== null || resolvingId !== null}
                              onClick={() => handleReplayCallback(d.id)}
                              className="merchant-secondary-button px-3 py-1 text-sm disabled:opacity-50"
                            >
                              {replayingId === d.id ? "Replaying…" : "Replay Callback"}
                            </button>
                          )}
                          <input
                            type="text"
                            value={notesByDiscrepancyId[d.id] ?? ""}
                            onChange={(e) =>
                              setNotesByDiscrepancyId((prev) => ({
                                ...prev,
                                [d.id]: e.target.value,
                              }))
                            }
                            placeholder="Resolution notes"
                            className="merchant-input h-10 w-40 px-3 py-1 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleResolve(d.id);
                            }}
                          />
                          <button
                            type="button"
                            disabled={
                              !(notesByDiscrepancyId[d.id]?.trim()) || resolvingId !== null
                            }
                            onClick={() => handleResolve(d.id)}
                            className="merchant-primary-button px-3 py-1 text-sm disabled:opacity-50"
                          >
                            {resolvingId === d.id ? "Saving…" : "Resolve"}
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                    );
                  })()
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
