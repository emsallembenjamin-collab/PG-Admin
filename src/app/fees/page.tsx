"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api/client";
import { useEffect, useState, type FormEvent } from "react";

export default function FeesPage() {
  const [depositFee, setDepositFee] = useState("1");
  const [withdrawalFee, setWithdrawalFee] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await goldpayApi.systemFee.get();
        if (!mounted) return;
        setDepositFee(String(settings.deposit_fee_percentage ?? "1"));
        setWithdrawalFee(String(settings.withdrawal_fee_percentage ?? "1"));
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load system fees.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const deposit = Number(depositFee);
      const withdrawal = Number(withdrawalFee);
      if (!Number.isFinite(deposit) || deposit < 0 || deposit > 100) {
        throw new Error("Deposit fee must be a number between 0 and 100.");
      }
      if (!Number.isFinite(withdrawal) || withdrawal < 0 || withdrawal > 100) {
        throw new Error("Withdrawal fee must be a number between 0 and 100.");
      }
      const saved = await goldpayApi.systemFee.update({
        deposit_fee_percentage: deposit,
        withdrawal_fee_percentage: withdrawal,
      });
      setDepositFee(String(saved.deposit_fee_percentage));
      setWithdrawalFee(String(saved.withdrawal_fee_percentage));
      setSuccess("Fee settings updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update fee settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[980px]">
      <Breadcrumb pageName="Transaction Fees" />

      <div className="merchant-card p-6">
        <h2 className="text-xl font-semibold text-dark dark:text-white">
          Platform Fee Configuration
        </h2>
        <p className="mt-2 text-sm text-dark-6">
          Fees are stored in DB and applied to each transaction:
          deposits credit merchant balance as amount - fee, withdrawals lock and settle amount + fee.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-dark-6">Loading fee settings...</p>
        ) : (
          <form onSubmit={onSave} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Deposit Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={depositFee}
                onChange={(e) => setDepositFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Withdrawal Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="merchant-primary-button px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Fees"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
