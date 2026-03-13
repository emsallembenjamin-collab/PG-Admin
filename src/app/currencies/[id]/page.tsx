"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api";
import type { Currency, CurrencyRate } from "@/lib/goldpay-api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function getCurrencyStatusClass(status: Currency["status"]) {
  return status === "active"
    ? "merchant-status-pill-success"
    : "merchant-status-pill-neutral";
}

export default function CurrencyDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    symbol: "",
    decimal_places: "2",
    status: "active" as Currency["status"],
    config: "",
  });
  const [rateForm, setRateForm] = useState({
    to_currency_id: "",
    rate: "",
    reverse_rate: "",
    expires_at: "",
  });

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    Promise.all([
      goldpayApi.currencies.get(id),
      goldpayApi.currencies.list(),
      goldpayApi.currencies.listRates(id),
    ])
      .then(([currencyValue, currenciesValue, ratesValue]) => {
        setCurrency(currencyValue);
        setCurrencies(currenciesValue);
        setRates(ratesValue);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load currency"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!currency) return;

    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol ?? "",
      decimal_places: String(currency.decimal_places),
      status: currency.status,
      config: currency.config ?? "",
    });
  }, [currency]);

  const reloadRates = async () => {
    const ratesValue = await goldpayApi.currencies.listRates(id);
    setRates(ratesValue);
  };

  const isDirty =
    !!currency &&
    (form.code.trim().toUpperCase() !== currency.code ||
      form.name.trim() !== currency.name ||
      form.symbol.trim() !== (currency.symbol ?? "") ||
      Number(form.decimal_places) !== currency.decimal_places ||
      form.status !== currency.status ||
      form.config.trim() !== (currency.config ?? ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currency) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await goldpayApi.currencies.update(id, {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        symbol: form.symbol.trim() || null,
        decimal_places: Number(form.decimal_places),
        status: form.status,
        config: form.config.trim() || null,
      });
      setCurrency(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update currency");
    } finally {
      setSaving(false);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateForm.to_currency_id || !rateForm.rate) return;

    setSavingRate(true);
    setError(null);
    try {
      await goldpayApi.currencies.upsertRate(id, {
        to_currency_id: Number(rateForm.to_currency_id),
        rate: Number(rateForm.rate),
        reverse_rate: rateForm.reverse_rate ? Number(rateForm.reverse_rate) : null,
        expires_at: rateForm.expires_at || null,
      });

      setRateForm({
        to_currency_id: "",
        rate: "",
        reverse_rate: "",
        expires_at: "",
      });
      await reloadRates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate");
    } finally {
      setSavingRate(false);
    }
  };

  if (loading && !currency) {
    return (
      <>
        <Breadcrumb pageName="Currency" />
        <div className="merchant-card p-8">
          <p className="text-dark-6">Loading currency…</p>
        </div>
      </>
    );
  }

  if (error && !currency) {
    return (
      <>
        <Breadcrumb pageName="Currency" />
        <div className="merchant-card p-8">
          <p className="text-red-500">{error}</p>
          <Link
            href="/currencies"
            className="mt-4 inline-block font-semibold text-primary transition hover:text-primary/80"
          >
            Back to Currencies
          </Link>
        </div>
      </>
    );
  }

  if (!currency) return null;

  const selectableCurrencies = currencies.filter((item) => item.id !== currency.id);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName={currency.code} />
        <Link
          href="/currencies"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to Currencies
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="merchant-card p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Currency Details
              </h3>
              <p className="mt-1 text-sm text-dark-6">
                Manage code, display format, and activation status.
              </p>
            </div>

            <span
              className={cn(
                "merchant-status-pill",
                getCurrencyStatusClass(form.status),
              )}
            >
              {form.status}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="merchant-label">Currency Code</label>
                <input
                  className="merchant-input uppercase"
                  maxLength={3}
                  value={form.code}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, code: e.target.value }))
                  }
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
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as Currency["status"],
                    }))
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
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="merchant-secondary-button"
                onClick={() =>
                  setForm({
                    code: currency.code,
                    name: currency.name,
                    symbol: currency.symbol ?? "",
                    decimal_places: String(currency.decimal_places),
                    status: currency.status,
                    config: currency.config ?? "",
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
                {saving ? "Saving..." : "Save Currency"}
              </button>
            </div>
          </form>
        </div>

        <div className="merchant-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Currency Rates
          </h3>

          <form
            onSubmit={handleRateSubmit}
            className="mb-6 grid gap-4 rounded-[24px] border border-[#E8DED0] bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2 md:grid-cols-4"
          >
            <div>
              <label className="merchant-label">To Currency</label>
              <select
                className="merchant-select"
                value={rateForm.to_currency_id}
                onChange={(e) =>
                  setRateForm((current) => ({
                    ...current,
                    to_currency_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select currency</option>
                {selectableCurrencies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} · {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="merchant-label">Rate</label>
              <input
                type="number"
                step="0.00000001"
                className="merchant-input"
                value={rateForm.rate}
                onChange={(e) =>
                  setRateForm((current) => ({ ...current, rate: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="merchant-label">Reverse Rate</label>
              <input
                type="number"
                step="0.00000001"
                className="merchant-input"
                value={rateForm.reverse_rate}
                onChange={(e) =>
                  setRateForm((current) => ({
                    ...current,
                    reverse_rate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="merchant-label">Expires At</label>
              <input
                type="datetime-local"
                className="merchant-input"
                value={rateForm.expires_at}
                onChange={(e) =>
                  setRateForm((current) => ({
                    ...current,
                    expires_at: e.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-4">
              <button
                type="submit"
                className="merchant-primary-button"
                disabled={savingRate}
              >
                {savingRate ? "Saving Rate..." : "Save Rate"}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {rates.length === 0 ? (
              <p className="text-sm text-dark-6">
                No outgoing rates configured for this currency yet.
              </p>
            ) : (
              rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#E8DED0] bg-[#FCFAF7] px-4 py-3 dark:border-dark-3 dark:bg-dark-2"
                >
                  <div>
                    <p className="font-semibold text-dark dark:text-white">
                      {rate.from_currency?.code ?? currency.code} →{" "}
                      {rate.to_currency?.code ?? rate.to_currency_id}
                    </p>
                    <p className="mt-1 text-sm text-dark-6">
                      Updated {new Date(rate.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-dark dark:text-white">
                      Rate: {rate.rate}
                    </p>
                    <p className="mt-1 text-sm text-dark-6">
                      Reverse: {rate.reverse_rate ?? "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
