/**
 * Types matching GoldPay backend entities and API responses.
 */

export type MerchantStatus = "active" | "suspended" | "inactive";
export type ProviderStatus = "active" | "inactive" | "maintenance";
export type CurrencyStatus = "active" | "inactive";
export type NotificationCategory =
  | "system"
  | "account"
  | "security"
  | "transaction"
  | "reconciliation"
  | "webhook";
export type TransactionType = "deposit" | "withdrawal";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "reversed";
export type SandboxOutcome =
  | "success"
  | "failed"
  | "processing_then_success"
  | "processing_then_failed";
export type SandboxDeliveryMode = "direct" | "callback";

export interface Merchant {
  id: number;
  name: string;
  email: string;
  status: MerchantStatus;
  webhook_url: string | null;
  webhook_secret?: string | null;
  provider_id: number | null;
  created_at: string;
  updated_at: string;
  provider?: { id: number; name: string; display_name: string } | null;
}

export interface MerchantApiKey {
  id: number;
  name: string;
  key_prefix: string;
  last_used_at?: string | null;
  created_at: string;
}

export interface Provider {
  id: number;
  name: string;
  display_name: string;
  status: ProviderStatus;
  priority: number;
  fee_percentage: number | null;
  min_amount: number | null;
  max_amount: number | null;
  config?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderBody {
  name: string;
  display_name: string;
  status?: ProviderStatus;
  priority?: number;
  fee_percentage?: number | null;
  min_amount?: number | null;
  max_amount?: number | null;
  config?: string | null;
}

export interface UpdateProviderBody extends Partial<CreateProviderBody> {}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string | null;
  decimal_places: number;
  status: CurrencyStatus;
  config: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurrencyRate {
  id: number;
  from_currency_id: number;
  to_currency_id: number;
  rate: number | string;
  reverse_rate: number | string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  from_currency?: Currency;
  to_currency?: Currency;
}

export interface CreateCurrencyBody {
  code: string;
  name: string;
  symbol?: string | null;
  decimal_places?: number;
  status?: CurrencyStatus;
  config?: string | null;
}

export interface UpdateCurrencyBody extends Partial<CreateCurrencyBody> {}

export interface UpsertCurrencyRateBody {
  to_currency_id: number;
  rate: number;
  reverse_rate?: number | null;
  expires_at?: string | null;
}

export interface Transaction {
  id: number;
  merchant_id: number;
  provider_id: number;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  external_id: string | null;
  reference_id: string | null;
  metadata: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionDetails extends Transaction {
  merchant?: { id: number; name: string; email: string };
  provider?: { id: number; name: string; display_name: string };
  attempts?: { id: number; status: string; attempted_at: string }[];
}

export interface TransactionAttempt {
  id: number;
  transaction_id: number;
  status: string;
  attempted_at: string;
}

export interface Reconciliation {
  id: number;
  type: string;
  status: string;
  reconciliation_date: string;
  merchant_id: number | null;
  provider_id: number | null;
  total_transactions: number;
  total_amount: string;
  succeeded_count: number;
  succeeded_amount: string;
  failed_count: number;
  failed_amount: string;
  pending_count: number;
  pending_amount: string;
  discrepancy_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthUser {
  id: number | null;
  email: string;
  name: string;
}

export interface AuthLoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface CreateMerchantBody {
  name: string;
  email: string;
  webhook_url?: string | null;
}

export interface UpdateMerchantBody {
  name?: string;
  email?: string;
  webhook_url?: string | null;
  status?: MerchantStatus;
}

export interface AssignProviderBody {
  providerId: number;
}

export interface ReconciliationFilters {
  type?: string;
  status?: string;
  merchantId?: number;
  providerId?: number;
  startDate?: string;
  endDate?: string;
}

/** Transaction with merchant & provider (admin list) */
export interface TransactionWithRelations extends Transaction {
  merchant?: { id: number; name: string; email: string };
  provider?: { id: number; name: string; display_name: string };
}

export interface AdminTransactionFilters {
  page?: number;
  limit?: number;
  merchantId?: number;
  providerId?: number;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  sandbox?: boolean;
}

export interface ForceSandboxOutcomeBody {
  status: TransactionStatus;
  failureReason?: string;
}

export interface ReplaySandboxCallbackBody {
  status?: Extract<TransactionStatus, "processing" | "succeeded" | "failed">;
  message?: string;
}

export interface ReconciliationDiscrepancy {
  id: number;
  reconciliation_id: number;
  transaction_id: number | null;
  type: string;
  status: string;
  description: string;
  expected_value: string | null;
  actual_value: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: number | null;
  created_at: string;
}

export interface ReconciliationWithDiscrepancies extends Reconciliation {
  discrepancies?: ReconciliationDiscrepancy[];
  merchant?: { id: number; name: string } | null;
  provider?: { id: number; name: string; display_name: string } | null;
}

export interface AppNotification {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  metadata: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: AppNotification[];
  unreadCount: number;
}
