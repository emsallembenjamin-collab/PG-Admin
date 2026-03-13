"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProviderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    status: "active",
    priority: "100",
    fee_percentage: "",
    min_amount: "",
    max_amount: "",
    config: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const provider = await goldpayApi.providers.create({
        name: form.name.trim(),
        display_name: form.display_name.trim(),
        status: form.status as "active" | "inactive" | "maintenance",
        priority: Number(form.priority),
        fee_percentage: form.fee_percentage ? Number(form.fee_percentage) : null,
        min_amount: form.min_amount ? Number(form.min_amount) : null,
        max_amount: form.max_amount ? Number(form.max_amount) : null,
        config: form.config.trim() || null,
      });

      router.push(`/providers/${provider.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create provider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="New Provider" />
        <Link
          href="/providers"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to Providers
        </Link>
      </div>

      <div className="merchant-card p-6 sm:p-7.5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="merchant-label">Provider Key</label>
              <input
                className="merchant-input"
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="sandbox_gateway"
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
                placeholder="Sandbox Gateway"
                required
              />
            </div>
            <div>
              <label className="merchant-label">Status</label>
              <select
                className="merchant-select"
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({ ...current, status: e.target.value }))
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
                className="merchant-input"
                value={form.priority}
                onChange={(e) =>
                  setForm((current) => ({ ...current, priority: e.target.value }))
                }
                min="0"
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
                placeholder="2.25"
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
              className="merchant-textarea min-h-[160px]"
              value={form.config}
              onChange={(e) =>
                setForm((current) => ({ ...current, config: e.target.value }))
              }
              placeholder='{"mode":"sandbox"}'
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="merchant-primary-button px-6 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Provider"}
            </button>
            <Link href="/providers" className="merchant-secondary-button px-6">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
