"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCurrencyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    name: "",
    symbol: "",
    decimal_places: "2",
    status: "active",
    config: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currency = await goldpayApi.currencies.create({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        symbol: form.symbol.trim() || null,
        decimal_places: Number(form.decimal_places),
        status: form.status as "active" | "inactive",
        config: form.config.trim() || null,
      });

      router.push(`/currencies/${currency.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create currency");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="New Currency" />
        <Link
          href="/currencies"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to Currencies
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
              <label className="merchant-label">Currency Code</label>
              <input
                className="merchant-input uppercase"
                value={form.code}
                onChange={(e) =>
                  setForm((current) => ({ ...current, code: e.target.value }))
                }
                placeholder="USD"
                maxLength={3}
                required
              />
            </div>
            <div>
              <label className="merchant-label">Currency Name</label>
              <input
                className="merchant-input"
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                placeholder="US Dollar"
                required
              />
            </div>
            <div>
              <label className="merchant-label">Symbol</label>
              <input
                className="merchant-input"
                value={form.symbol}
                onChange={(e) =>
                  setForm((current) => ({ ...current, symbol: e.target.value }))
                }
                placeholder="$"
              />
            </div>
            <div>
              <label className="merchant-label">Decimal Places</label>
              <input
                type="number"
                min="0"
                className="merchant-input"
                value={form.decimal_places}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    decimal_places: e.target.value,
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
                  setForm((current) => ({ ...current, status: e.target.value }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              placeholder='{"locale":"en-US"}'
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="merchant-primary-button px-6 disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Currency"}
            </button>
            <Link href="/currencies" className="merchant-secondary-button px-6">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
