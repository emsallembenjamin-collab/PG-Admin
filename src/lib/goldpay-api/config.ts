/**
 * GoldPay API configuration.
 * Set NEXT_PUBLIC_GOLDPAY_API_URL in .env.local (e.g. http://localhost:4000).
 */
const baseUrl = process.env.NEXT_PUBLIC_GOLDPAY_API_URL ?? "http://localhost:4000";
const apiPrefix = process.env.NEXT_PUBLIC_GOLDPAY_API_PREFIX ?? "api/v1";

export const GOLDPAY_API_BASE = `${baseUrl}/${apiPrefix}`;
export const GOLDPAY_ADMIN_PREFIX = `${baseUrl}/${apiPrefix.replace("v1", "").replace(/\/$/, "")}`;

export const AUTH_TOKEN_KEY = "goldpay_admin_token";
