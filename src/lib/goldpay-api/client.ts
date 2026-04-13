"use client";

import { GOLDPAY_API_BASE, AUTH_TOKEN_KEY } from "./config";
import type {
  AuthLoginResponse,
  AuthUser,
  Merchant,
  MerchantApiKey,
  Provider,
  Currency,
  CurrencyRate,
  Transaction,
  TransactionWithRelations,
  PaginatedResponse,
  Reconciliation,
  ReconciliationWithDiscrepancies,
  NotificationListResponse,
  AppNotification,
  CreateMerchantBody,
  UpdateMerchantBody,
  CreateProviderBody,
  UpdateProviderBody,
  CreateCurrencyBody,
  UpdateCurrencyBody,
  UpsertCurrencyRateBody,
  AssignProviderBody,
  ReconciliationFilters,
  AdminTransactionFilters,
  TransactionDetails,
  ForceSandboxOutcomeBody,
  ReplaySandboxCallbackBody,
  SystemFeeSettings,
  UpdateSystemFeeSettingsBody,
} from "./types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function dispatchUnauthorized(): void {
  clearAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("goldpay-unauthorized"));
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${GOLDPAY_API_BASE}/${path.replace(/^\//, "")}`;
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    dispatchUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message ?? json.error ?? text;
    } catch {
      // use text as message
    }
    throw new Error(message || `HTTP ${res.status}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ——— Auth ———
export const authApi = {
  login: (email: string, password: string) =>
    request<AuthLoginResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AuthUser>("auth/me"),
};

// ——— Merchants ———
export const merchantsApi = {
  list: () => request<Merchant[]>("merchants"),
  get: (id: number) => request<Merchant>(`merchants/${id}`),
  create: (body: CreateMerchantBody) =>
    request<Merchant>("merchants", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: UpdateMerchantBody) =>
    request<Merchant>(`merchants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  createApiKey: (merchantId: number, name?: string) =>
    request<{ api_key: string }>(`merchants/${merchantId}/api-keys`, {
      method: "POST",
      body: JSON.stringify({ name: name ?? "Admin key" }),
    }),
  revokeApiKey: (merchantId: number, keyId: number) =>
    request<{ message: string }>(`merchants/${merchantId}/api-keys/${keyId}/revoke`, {
      method: "POST",
    }),
  assignProvider: (merchantId: number, providerId: number) =>
    request<{ message: string; merchant: { id: number; name: string; provider_id: number | null } }>(
      `merchants/${merchantId}/provider`,
      { method: "POST", body: JSON.stringify({ providerId } as AssignProviderBody) }
    ),
  removeProvider: (merchantId: number) =>
    request<{ message: string; merchant: { id: number; name: string; provider_id: number | null } }>(
      `merchants/${merchantId}/provider`,
      { method: "DELETE" }
    ),
  getProvider: (merchantId: number) =>
    request<{ provider: Provider } | { message: string }>(`merchants/${merchantId}/provider`),
  listApiKeys: (merchantId: number) =>
    request<{ id: number; name: string; status: string; key_prefix: string; created_at: string }[]>(
      `merchants/${merchantId}/api-keys`
    ),
};

// ——— Providers ———
export const providersApi = {
  list: () => request<Provider[]>("providers"),
  create: (body: CreateProviderBody) =>
    request<Provider>("providers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  get: (id: number) => request<Provider>(`providers/${id}`),
  update: (id: number, body: UpdateProviderBody) =>
    request<Provider>(`providers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const currenciesApi = {
  list: () => request<Currency[]>("currencies"),
  create: (body: CreateCurrencyBody) =>
    request<Currency>("currencies", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  get: (id: number) => request<Currency>(`currencies/${id}`),
  update: (id: number, body: UpdateCurrencyBody) =>
    request<Currency>(`currencies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  listRates: (id: number) => request<CurrencyRate[]>(`currencies/${id}/rates`),
  upsertRate: (id: number, body: UpsertCurrencyRateBody) =>
    request<CurrencyRate>(`currencies/${id}/rates`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ——— Transactions (admin) ———
export const transactionsApi = {
  /** List all transactions with filters (admin JWT). */
  listAdmin: (filters: AdminTransactionFilters = {}) => {
    const params = new URLSearchParams();
    const {
      page = 1,
      limit = 20,
      merchantId,
      providerId,
      status,
      type,
      startDate,
      endDate,
      sandbox,
    } = filters;
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (merchantId != null) params.set("merchantId", String(merchantId));
    if (providerId != null) params.set("providerId", String(providerId));
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (sandbox != null) params.set("sandbox", String(sandbox));
    return request<PaginatedResponse<TransactionWithRelations>>(
      `admin/transactions?${params.toString()}`
    );
  },
  get: (id: number) => request<TransactionDetails>(`admin/transactions/${id}`),
  forceOutcome: (id: number, body: ForceSandboxOutcomeBody) =>
    request<TransactionDetails>(`admin/transactions/${id}/sandbox/force-outcome`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  replayCallback: (id: number, body: ReplaySandboxCallbackBody = {}) =>
    request<TransactionDetails>(`admin/transactions/${id}/sandbox/replay-callback`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ——— Reconciliation (admin) ———
export const reconciliationApi = {
  list: (filters?: ReconciliationFilters) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.merchantId != null) params.set("merchantId", String(filters.merchantId));
    if (filters?.providerId != null) params.set("providerId", String(filters.providerId));
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    const qs = params.toString();
    return request<Reconciliation[]>(`admin/reconciliation${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) =>
    request<ReconciliationWithDiscrepancies>(`admin/reconciliation/${id}`),
  runMerchant: (merchantId: number, startDate: string, endDate: string) =>
    request(`admin/reconciliation/merchant/${merchantId}`, {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    }),
  runProvider: (providerId: number, startDate: string, endDate: string) =>
    request(`admin/reconciliation/provider/${providerId}`, {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    }),
  runDaily: (date: string) =>
    request(`admin/reconciliation/daily`, {
      method: "POST",
      body: JSON.stringify({ date }),
    }),
  resolveDiscrepancy: (id: number, resolutionNotes: string, resolvedBy: number) =>
    request(`admin/reconciliation/discrepancies/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNotes, resolvedBy }),
    }),
};

export const notificationsApi = {
  listAdmin: (params: { unreadOnly?: boolean; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.unreadOnly != null) {
      search.set("unreadOnly", String(params.unreadOnly));
    }
    if (params.limit != null) {
      search.set("limit", String(params.limit));
    }
    return request<NotificationListResponse>(`notifications/admin?${search.toString()}`);
  },
  markReadAdmin: (notificationId: number) =>
    request<AppNotification>(`notifications/admin/${notificationId}/read`, {
      method: "PATCH",
    }),
  markAllReadAdmin: () =>
    request<{ updated: number }>("notifications/admin/read-all", {
      method: "PATCH",
    }),
};

export const systemFeeApi = {
  get: () => request<SystemFeeSettings>("admin/system-fee"),
  update: (body: UpdateSystemFeeSettingsBody) =>
    request<SystemFeeSettings>("admin/system-fee", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const goldpayApi = {
  auth: authApi,
  merchants: merchantsApi,
  providers: providersApi,
  currencies: currenciesApi,
  transactions: transactionsApi,
  reconciliation: reconciliationApi,
  notifications: notificationsApi,
  systemFee: systemFeeApi,
};
