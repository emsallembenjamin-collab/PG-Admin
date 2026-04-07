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
import type { Merchant, Provider, TransactionStatus, TransactionWithRelations } from "@/lib/goldpay-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ApiKeyRow {
  id: number;
  name: string;
  status: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string | null;
}

interface MerchantTransactionSnapshot {
  total: number;
  sampleSize: number;
  succeeded: number;
  failed: number;
  pending: number;
  currencies: number;
  latestActivityAt: string | null;
  recentTransactions: TransactionWithRelations[];
}

function getMerchantStatusClass(status: Merchant["status"]) {
  if (status === "active") return "merchant-status-pill-success";
  if (status === "suspended") return "merchant-status-pill-error";
  return "merchant-status-pill-neutral";
}

function getTransactionStatusClass(status: TransactionStatus) {
  if (status === "succeeded") return "merchant-status-pill-success";
  if (status === "failed") return "merchant-status-pill-error";
  if (status === "pending" || status === "processing") {
    return "merchant-status-pill-warn";
  }
  return "merchant-status-pill-neutral";
}

function maskApiKeyPrefix(keyPrefix: string) {
  const normalized = keyPrefix.trim();
  if (!normalized) return "Hidden";
  if (normalized.includes("*")) return normalized;
  if (normalized.endsWith("...")) return `${normalized}******`;
  return `${normalized}...******`;
}

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

function buildTransactionSnapshot(
  transactions: TransactionWithRelations[],
  total: number,
): MerchantTransactionSnapshot {
  const currencies = new Set(
    transactions.map((transaction) => transaction.currency).filter(Boolean),
  );

  return {
    total,
    sampleSize: transactions.length,
    succeeded: transactions.filter((transaction) => transaction.status === "succeeded").length,
    failed: transactions.filter((transaction) => transaction.status === "failed").length,
    pending: transactions.filter(
      (transaction) =>
        transaction.status === "pending" || transaction.status === "processing",
    ).length,
    currencies: currencies.size,
    latestActivityAt: transactions[0]?.created_at ?? null,
    recentTransactions: transactions.slice(0, 5),
  };
}

export default function MerchantDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [transactionSnapshot, setTransactionSnapshot] =
    useState<MerchantTransactionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [rotatingKeyId, setRotatingKeyId] = useState<number | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [assignProviderId, setAssignProviderId] = useState<string>("");
  const [savingMerchant, setSavingMerchant] = useState(false);
  const [merchantForm, setMerchantForm] = useState({
    name: "",
    email: "",
    status: "active" as Merchant["status"],
    webhookUrl: "",
  });

  const load = useCallback(async () => {
    if (!id || isNaN(id)) return;
    setLoading(true);
    setError(null);
    setAnalyticsError(null);
    try {
      const [m, keys, provList] = await Promise.all([
        goldpayApi.merchants.get(id),
        goldpayApi.merchants.listApiKeys(id),
        goldpayApi.providers.list(),
      ]);
      setMerchant(m);
      setApiKeys(keys);
      setProviders(provList);

      const [provRes, txRes] = await Promise.allSettled([
        goldpayApi.merchants.getProvider(id),
        goldpayApi.transactions.listAdmin({
          merchantId: id,
          page: 1,
          limit: 100,
        }),
      ]);

      if (provRes.status === "fulfilled" && provRes.value && "provider" in provRes.value) {
        setProvider(provRes.value.provider);
      } else {
        setProvider(null);
      }

      if (txRes.status === "fulfilled") {
        setTransactionSnapshot(buildTransactionSnapshot(txRes.value.data, txRes.value.total));
      } else {
        setTransactionSnapshot(null);
        setAnalyticsError(
          txRes.reason instanceof Error
            ? txRes.reason.message
            : "Failed to load merchant analytics",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!merchant) return;

    setMerchantForm({
      name: merchant.name,
      email: merchant.email,
      status: merchant.status,
      webhookUrl: merchant.webhook_url ?? "",
    });
    setAssignProviderId(merchant.provider_id ? String(merchant.provider_id) : "");
  }, [merchant]);

  const isMerchantDirty =
    !!merchant &&
    (merchantForm.name.trim() !== merchant.name ||
      merchantForm.email.trim().toLowerCase() !== merchant.email ||
      merchantForm.status !== merchant.status ||
      merchantForm.webhookUrl.trim() !== (merchant.webhook_url ?? ""));

  const handleMerchantUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    setSavingMerchant(true);
    setError(null);

    try {
      const updatedMerchant = await goldpayApi.merchants.update(id, {
        name: merchantForm.name.trim(),
        email: merchantForm.email.trim().toLowerCase(),
        status: merchantForm.status,
        webhook_url: merchantForm.webhookUrl.trim() || null,
      });

      setMerchant(updatedMerchant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update merchant");
    } finally {
      setSavingMerchant(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setCreatingKey(true);
    setNewKeyValue(null);
    try {
      const res = await goldpayApi.merchants.createApiKey(id, newKeyName || undefined);
      setNewKeyValue(res.api_key);
      setNewKeyName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm("Revoke this API key? It will stop working immediately.")) return;
    try {
      await goldpayApi.merchants.revokeApiKey(id, keyId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke");
    }
  };

  const handleRotateKey = async (keyId: number, keyName?: string) => {
    if (!confirm("Rotate this API key? A replacement key will be created and this key will be revoked.")) {
      return;
    }

    setRotatingKeyId(keyId);
    setNewKeyValue(null);
    setError(null);

    try {
      const res = await goldpayApi.merchants.createApiKey(id, keyName || undefined);
      await goldpayApi.merchants.revokeApiKey(id, keyId);
      setNewKeyValue(res.api_key);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate key");
    } finally {
      setRotatingKeyId(null);
    }
  };

  const handleAssignProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = Number(assignProviderId);
    if (!pid) return;
    setError(null);
    try {
      await goldpayApi.merchants.assignProvider(id, pid);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign provider");
    }
  };

  const handleRemoveProvider = async () => {
    if (!confirm("Remove provider assignment from this merchant?")) return;
    setError(null);
    try {
      await goldpayApi.merchants.removeProvider(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove provider");
    }
  };

  if (loading && !merchant) {
    return (
      <>
        <Breadcrumb pageName="Merchant" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading…</p>
        </div>
      </>
    );
  }

  if (error && !merchant) {
    return (
      <>
        <Breadcrumb pageName="Merchant" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error}</p>
          <Link href="/merchants" className="mt-4 inline-block text-primary hover:underline">
            Back to Merchants
          </Link>
        </div>
      </>
    );
  }

  if (!merchant) return null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName={merchant.name} />
        <Link href="/merchants" className="font-semibold text-primary transition hover:text-primary/80">
          ← Back to Merchants
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
      )}

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Transaction Overview
              </h3>
              <p className="mt-1 text-sm text-dark-6">
                Merchant activity snapshot from the latest 100 transactions.
              </p>
            </div>

            <Link
              href={`/transactions?merchantId=${merchant.id}`}
              className="font-semibold text-primary transition hover:text-primary/80"
            >
              View all transactions
            </Link>
          </div>

          {analyticsError ? (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {analyticsError}
            </div>
          ) : transactionSnapshot ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Total Transactions
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-dark dark:text-white">
                    {transactionSnapshot.total}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Succeeded
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#219653]">
                    {transactionSnapshot.succeeded}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Failed
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-red-500">
                    {transactionSnapshot.failed}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Active Currencies
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-dark dark:text-white">
                    {transactionSnapshot.currencies}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Pending Or Processing
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {transactionSnapshot.pending}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Latest Activity
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {transactionSnapshot.latestActivityAt
                      ? new Date(transactionSnapshot.latestActivityAt).toLocaleString()
                      : "No activity yet"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                    Sample Window
                  </p>
                  <p className="mt-2 font-semibold text-dark dark:text-white">
                    {transactionSnapshot.sampleSize} recent records
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2">
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionSnapshot.recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-dark-6">
                          No transactions yet for this merchant.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionSnapshot.recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell className="capitalize">{transaction.type}</TableCell>
                          <TableCell>
                            {transaction.amount} {transaction.currency}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "merchant-status-pill",
                                getTransactionStatusClass(transaction.status),
                              )}
                            >
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Link
                              href={`/transactions/${transaction.id}`}
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
            </>
          ) : (
            <p className="text-sm text-dark-6">No analytics available yet.</p>
          )}
        </div>

        <div className="merchant-card p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-dark dark:text-white">Internal ledger</h3>
            <p className="mt-1 text-sm text-dark-6">
              Platform-held balance per currency (available, locked in pending withdrawals, and total).
            </p>
          </div>

          {merchant.balances && merchant.balances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2">
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Locked</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchant.balances.map((row) => (
                  <TableRow key={row.currency}>
                    <TableCell className="font-medium">{row.currency}</TableCell>
                    <TableCell className="text-right">
                      {formatLedgerAmount(row.balance_available, row.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatLedgerAmount(row.balance_locked, row.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatLedgerAmount(row.balance_total, row.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                Summary ({merchant.balance_currency ?? "USD"})
              </p>
              <p className="mt-2 text-sm text-dark dark:text-white">
                Available{" "}
                <span className="font-semibold">
                  {formatLedgerAmount(merchant.balance_available, merchant.balance_currency)}
                </span>
                {" · "}
                Locked{" "}
                <span className="font-semibold">
                  {formatLedgerAmount(merchant.balance_locked, merchant.balance_currency)}
                </span>
                {" · "}
                Total{" "}
                <span className="font-semibold">
                  {formatLedgerAmount(merchant.balance_total, merchant.balance_currency)}
                </span>
              </p>
              <p className="mt-2 text-xs text-dark-6">
                No per-currency rows yet; amounts reflect the primary currency only.
              </p>
            </div>
          )}
        </div>

        <div className="merchant-card p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Merchant Details
              </h3>
              <p className="mt-1 text-sm text-dark-6">
                Update merchant profile, status, and webhook settings.
              </p>
            </div>

            <span
              className={cn(
                "merchant-status-pill",
                getMerchantStatusClass(merchantForm.status),
              )}
            >
              {merchantForm.status}
            </span>
          </div>

          <form onSubmit={handleMerchantUpdate} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="merchant-label">Merchant Name</label>
                <input
                  type="text"
                  value={merchantForm.name}
                  onChange={(e) =>
                    setMerchantForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                  className="merchant-input"
                  placeholder="Merchant display name"
                  required
                />
              </div>

              <div>
                <label className="merchant-label">Email</label>
                <input
                  type="email"
                  value={merchantForm.email}
                  onChange={(e) =>
                    setMerchantForm((current) => ({
                      ...current,
                      email: e.target.value,
                    }))
                  }
                  className="merchant-input"
                  placeholder="merchant@example.com"
                  required
                />
              </div>

              <div>
                <label className="merchant-label">Status</label>
                <select
                  value={merchantForm.status}
                  onChange={(e) =>
                    setMerchantForm((current) => ({
                      ...current,
                      status: e.target.value as Merchant["status"],
                    }))
                  }
                  className="merchant-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="merchant-label">Webhook URL</label>
                <input
                  type="url"
                  value={merchantForm.webhookUrl}
                  onChange={(e) =>
                    setMerchantForm((current) => ({
                      ...current,
                      webhookUrl: e.target.value,
                    }))
                  }
                  className="merchant-input"
                  placeholder="https://example.com/webhooks/goldpay"
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                  Merchant ID
                </p>
                <p className="mt-2 font-semibold text-dark dark:text-white">
                  #{merchant.id}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                  Created
                </p>
                <p className="mt-2 font-semibold text-dark dark:text-white">
                  {new Date(merchant.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                  Last Updated
                </p>
                <p className="mt-2 font-semibold text-dark dark:text-white">
                  {new Date(merchant.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="merchant-secondary-button"
                onClick={() =>
                  setMerchantForm({
                    name: merchant.name,
                    email: merchant.email,
                    status: merchant.status,
                    webhookUrl: merchant.webhook_url ?? "",
                  })
                }
                disabled={!isMerchantDirty || savingMerchant}
              >
                Reset
              </button>
              <button
                type="submit"
                className="merchant-primary-button"
                disabled={!isMerchantDirty || savingMerchant}
              >
                {savingMerchant ? "Saving..." : "Save Merchant"}
              </button>
            </div>
          </form>
        </div>

        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Provider</h3>
          <p className="mb-4 text-sm text-dark-6">
            {provider
              ? `Current provider: ${provider.display_name || provider.name} (ID: ${provider.id})`
              : "No provider assigned yet."}
          </p>

          <form onSubmit={handleAssignProvider} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px]">
              <label className="merchant-label">Assigned provider</label>
              <select
                value={assignProviderId}
                onChange={(e) => setAssignProviderId(e.target.value)}
                className="merchant-select w-full"
              >
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name || p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!assignProviderId}
              className="merchant-primary-button px-4 py-2.5 disabled:opacity-50"
            >
              {provider ? "Update Provider" : "Assign Provider"}
            </button>
            {provider && (
              <button
                type="button"
                onClick={handleRemoveProvider}
                className="merchant-secondary-button border-red-200 text-red-500"
              >
                Remove Provider
              </button>
            )}
          </form>
        </div>

        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">API Keys</h3>
          {newKeyValue && (
            <div className="mb-4 rounded-lg border border-[#219653] bg-[#219653]/[0.08] p-4">
              <p className="mb-2 text-sm font-medium text-[#219653]">
                New API key (copy now — it won’t be shown again):
              </p>
              <code className="block break-all rounded bg-white/80 px-2 py-2 text-dark dark:bg-dark-2">
                {newKeyValue}
              </code>
            </div>
          )}
          <form onSubmit={handleCreateKey} className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label className="merchant-label">Key name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production"
                className="merchant-input"
              />
            </div>
            <button
              type="submit"
              disabled={creatingKey}
              className="merchant-primary-button px-4 py-2.5 disabled:opacity-70"
            >
              {creatingKey ? "Creating…" : "Create API Key"}
            </button>
          </form>
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#FCFAF7] dark:bg-dark-2">
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-dark-6">
                    No API keys. Create one above.
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell>{k.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskApiKeyPrefix(k.key_prefix)}
                    </TableCell>
                    <TableCell>{k.status}</TableCell>
                    <TableCell>
                      <div>{new Date(k.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-dark-6">
                        {k.last_used_at
                          ? `Last used ${new Date(k.last_used_at).toLocaleString()}`
                          : "Never used"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {k.status === "active" && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleRotateKey(k.id, k.name)}
                            disabled={rotatingKeyId === k.id}
                            className="text-primary hover:underline disabled:opacity-60"
                          >
                            {rotatingKeyId === k.id ? "Rotating..." : "Rotate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.id)}
                            className="text-red-500 hover:underline"
                          >
                            Revoke
                          </button>
                        </div>
                      )}
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
