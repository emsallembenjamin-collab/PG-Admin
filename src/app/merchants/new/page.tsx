"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import InputGroup from "@/components/FormElements/InputGroup";
import { goldpayApi } from "@/lib/goldpay-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMerchantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const merchant = await goldpayApi.merchants.create({
        name,
        email,
        webhook_url: webhookUrl || undefined,
      });
      router.push(`/merchants/${merchant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create merchant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb pageName="New Merchant" />
        <Link
          href="/merchants"
          className="font-semibold text-primary transition hover:text-primary/80"
        >
          ← Back to Merchants
        </Link>
      </div>

      <div className="merchant-card p-6 sm:p-7.5">
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>
          )}
          <InputGroup
            label="Name"
            type="text"
            name="name"
            placeholder="Merchant display name"
            value={name}
            handleChange={(e) => setName(e.target.value)}
            required
          />
          <InputGroup
            label="Email"
            type="email"
            name="email"
            placeholder="merchant@example.com"
            value={email}
            handleChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputGroup
            label="Webhook URL (optional)"
            type="url"
            name="webhook_url"
            placeholder="https://..."
            value={webhookUrl}
            handleChange={(e) => setWebhookUrl(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="merchant-primary-button px-6 py-3 disabled:opacity-70"
            >
              {loading ? "Creating…" : "Create Merchant"}
            </button>
            <Link
              href="/merchants"
              className="merchant-secondary-button px-6 py-3"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
