"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { goldpayApi } from "@/lib/goldpay-api/client";
import { useEffect, useState, type FormEvent } from "react";

export default function FeesPage() {
  const [serviceDepositFee, setServiceDepositFee] = useState("1");
  const [serviceWithdrawalFee, setServiceWithdrawalFee] = useState("1");
  const [thirdPartyDepositFee, setThirdPartyDepositFee] = useState("0");
  const [thirdPartyWithdrawalFee, setThirdPartyWithdrawalFee] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const totalDepositFee = (
    Number(serviceDepositFee || 0) + Number(thirdPartyDepositFee || 0)
  ).toFixed(2);
  const totalWithdrawalFee = (
    Number(serviceWithdrawalFee || 0) + Number(thirdPartyWithdrawalFee || 0)
  ).toFixed(2);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await goldpayApi.systemFee.get();
        if (!mounted) return;
        setServiceDepositFee(String(settings.deposit_fee_percentage ?? "1"));
        setServiceWithdrawalFee(String(settings.withdrawal_fee_percentage ?? "1"));
        setThirdPartyDepositFee(
          String(settings.third_party_deposit_fee_percentage ?? "0"),
        );
        setThirdPartyWithdrawalFee(
          String(settings.third_party_withdrawal_fee_percentage ?? "0"),
        );
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
      const serviceDeposit = Number(serviceDepositFee);
      const serviceWithdrawal = Number(serviceWithdrawalFee);
      const thirdPartyDeposit = Number(thirdPartyDepositFee);
      const thirdPartyWithdrawal = Number(thirdPartyWithdrawalFee);
      const isValidPercent = (value: number) =>
        Number.isFinite(value) && value >= 0 && value <= 100;
      if (!isValidPercent(serviceDeposit)) {
        throw new Error("Service deposit fee must be a number between 0 and 100.");
      }
      if (!isValidPercent(serviceWithdrawal)) {
        throw new Error(
          "Service withdrawal fee must be a number between 0 and 100.",
        );
      }
      if (!isValidPercent(thirdPartyDeposit)) {
        throw new Error(
          "Third-party deposit fee must be a number between 0 and 100.",
        );
      }
      if (!isValidPercent(thirdPartyWithdrawal)) {
        throw new Error(
          "Third-party withdrawal fee must be a number between 0 and 100.",
        );
      }
      const saved = await goldpayApi.systemFee.update({
        deposit_fee_percentage: serviceDeposit,
        withdrawal_fee_percentage: serviceWithdrawal,
        third_party_deposit_fee_percentage: thirdPartyDeposit,
        third_party_withdrawal_fee_percentage: thirdPartyWithdrawal,
      });
      setServiceDepositFee(String(saved.deposit_fee_percentage));
      setServiceWithdrawalFee(String(saved.withdrawal_fee_percentage));
      setThirdPartyDepositFee(String(saved.third_party_deposit_fee_percentage));
      setThirdPartyWithdrawalFee(
        String(saved.third_party_withdrawal_fee_percentage),
      );
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
          Configure both fee layers: third-party provider fee (e.g. DPay) and our
          platform service fee. Total fee = third-party fee + service fee.
          Deposits settle as amount - total fee; withdrawals settle as amount + total fee.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-dark-6">Loading fee settings...</p>
        ) : (
          <form onSubmit={onSave} className="mt-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8A7A61] dark:text-dark-6">
              Our Service Fee (%)
            </h3>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Deposit Service Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={serviceDepositFee}
                onChange={(e) => setServiceDepositFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Withdrawal Service Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={serviceWithdrawalFee}
                onChange={(e) => setServiceWithdrawalFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-[#8A7A61] dark:text-dark-6">
              Third-Party Provider Fee (%)
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Deposit Third-Party Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={thirdPartyDepositFee}
                onChange={(e) => setThirdPartyDepositFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                Withdrawal Third-Party Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={thirdPartyWithdrawalFee}
                onChange={(e) => setThirdPartyWithdrawalFee(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            <div className="rounded-lg border border-stroke bg-[#FCFAF7] p-4 dark:border-dark-3 dark:bg-dark-2">
              <p className="text-sm font-semibold text-dark dark:text-white">
                Effective Total Fees
              </p>
              <p className="mt-2 text-sm text-dark-6">
                Deposit total fee: <span className="font-semibold text-dark dark:text-white">{totalDepositFee}%</span>
              </p>
              <p className="mt-1 text-sm text-dark-6">
                Withdrawal total fee: <span className="font-semibold text-dark dark:text-white">{totalWithdrawalFee}%</span>
              </p>
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
