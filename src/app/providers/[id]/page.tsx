"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api";
import type { Provider } from "@/lib/goldpay-api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getProviderStatusClass(status: Provider["status"]) {
  if (status === "active") return "merchant-status-pill-success";
  if (status === "maintenance") return "merchant-status-pill-warn";
  return "merchant-status-pill-neutral";
}

export default function ProviderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    status: "active" as Provider["status"],
    priority: "100",
    fee_percentage: "",
    min_amount: "",
    max_amount: "",
    config: "",
  });

  useEffect(() => {
    if (!id || isNaN(id)) return;
    goldpayApi.providers
      .get(id)
      .then(setProvider)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!provider) return;

    setForm({
      name: provider.name,
      display_name: provider.display_name,
      status: provider.status,
      priority: String(provider.priority),
      fee_percentage:
        provider.fee_percentage === null || provider.fee_percentage === undefined
          ? ""
          : String(provider.fee_percentage),
      min_amount:
        provider.min_amount === null || provider.min_amount === undefined
          ? ""
          : String(provider.min_amount),
      max_amount:
        provider.max_amount === null || provider.max_amount === undefined
          ? ""
          : String(provider.max_amount),
      config: provider.config ?? "",
    });
  }, [provider]);

  const isDirty =
    !!provider &&
    (form.name.trim() !== provider.name ||
      form.display_name.trim() !== provider.display_name ||
      form.status !== provider.status ||
      Number(form.priority) !== provider.priority ||
      (form.fee_percentage === "" ? null : Number(form.fee_percentage)) !==
        (provider.fee_percentage ?? null) ||
      (form.min_amount === "" ? null : Number(form.min_amount)) !==
        (provider.min_amount ?? null) ||
      (form.max_amount === "" ? null : Number(form.max_amount)) !==
        (provider.max_amount ?? null) ||
      form.config.trim() !== (provider.config ?? ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await goldpayApi.providers.update(id, {
        name: form.name.trim(),
        display_name: form.display_name.trim(),
        status: form.status,
        priority: Number(form.priority),
        fee_percentage: form.fee_percentage ? Number(form.fee_percentage) : null,
        min_amount: form.min_amount ? Number(form.min_amount) : null,
        max_amount: form.max_amount ? Number(form.max_amount) : null,
        config: form.config.trim() || null,
      });

      setProvider(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update provider");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !provider) {
    return (
      <>
        <Breadcrumb pageName="Provider" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading…</p>
        </div>
      </>
    );
  }

  if (error && !provider) {
    return (
      <>
        <Breadcrumb pageName="Provider" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error}</p>
          <Link href="/providers" className="mt-4 inline-block text-primary hover:underline">
            Back to Providers
          </Link>
        </div>
      </>
    );
  }

  if (!provider) return null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName={provider.display_name || provider.name} />
        <Link href="/providers" className="font-semibold text-primary transition hover:text-primary/80">
          ← Back to Providers
        </Link>
      </div>

      <div className="merchant-card p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Provider Details
            </h3>
            <p className="mt-1 text-sm text-dark-6">
              Configure routing, fee, limits, and provider settings.
            </p>
          </div>

          <span
            className={cn(
              "merchant-status-pill",
              getProviderStatusClass(form.status),
            )}
          >
            {form.status}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="merchant-label">Provider Key</label>
              <input
                className="merchant-input"
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="merchant-label">Display Name</label>
              <input
                className="merchant-input"
                value={form.display_name}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    display_name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="merchant-label">Status</label>
              <select
                className="merchant-select"
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    status: e.target.value as Provider["status"],
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="merchant-label">Priority</label>
              <input
                type="number"
                min="0"
                className="merchant-input"
                value={form.priority}
                onChange={(e) =>
                  setForm((current) => ({ ...current, priority: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="merchant-label">Fee %</label>
              <input
                type="number"
                step="0.01"
                className="merchant-input"
                value={form.fee_percentage}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    fee_percentage: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="merchant-label">Min Amount</label>
              <input
                type="number"
                step="0.01"
                className="merchant-input"
                value={form.min_amount}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    min_amount: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="merchant-label">Max Amount</label>
              <input
                type="number"
                step="0.01"
                className="merchant-input"
                value={form.max_amount}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    max_amount: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className="merchant-label">Config JSON</label>
            <textarea
              className="merchant-textarea min-h-[180px]"
              value={form.config}
              onChange={(e) =>
                setForm((current) => ({ ...current, config: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-3 rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                Provider ID
              </p>
              <p className="mt-2 font-semibold text-dark dark:text-white">
                #{provider.id}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7A61] dark:text-dark-6">
                Last Updated
              </p>
              <p className="mt-2 font-semibold text-dark dark:text-white">
                {new Date(provider.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="merchant-secondary-button"
              onClick={() =>
                provider &&
                setForm({
                  name: provider.name,
                  display_name: provider.display_name,
                  status: provider.status,
                  priority: String(provider.priority),
                  fee_percentage:
                    provider.fee_percentage === null ||
                    provider.fee_percentage === undefined
                      ? ""
                      : String(provider.fee_percentage),
                  min_amount:
                    provider.min_amount === null || provider.min_amount === undefined
                      ? ""
                      : String(provider.min_amount),
                  max_amount:
                    provider.max_amount === null || provider.max_amount === undefined
                      ? ""
                      : String(provider.max_amount),
                  config: provider.config ?? "",
                })
              }
              disabled={!isDirty || saving}
            >
              Reset
            </button>
            <button
              type="submit"
              className="merchant-primary-button"
              disabled={!isDirty || saving}
            >
              {saving ? "Saving..." : "Save Provider"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
