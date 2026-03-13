import type { Transaction } from "./types";

type SandboxMetadata = {
  sandbox?: boolean;
  sandbox_outcome?: string;
  sandbox_delivery_mode?: string;
  sandbox_delay_ms?: number;
};

export function getSandboxMetadata(
  transaction: Pick<Transaction, "metadata">,
): SandboxMetadata | null {
  if (!transaction.metadata) {
    return null;
  }

  try {
    const parsed = JSON.parse(transaction.metadata) as SandboxMetadata;
    return parsed?.sandbox ? parsed : null;
  } catch {
    return null;
  }
}

export function isSandboxTransaction(transaction: Pick<Transaction, "metadata">) {
  return getSandboxMetadata(transaction) !== null;
}
