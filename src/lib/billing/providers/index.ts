/**
 * Payment Provider Factory
 *
 * Returns the configured PaymentService implementation based on the
 * PAYMENT_PROVIDER environment variable. This allows the application
 * to switch payment providers (Stripe, Adyen, Paddle) without
 * rewriting any business logic.
 */

import type { PaymentService } from "../payment-service";
import type { PaymentProvider } from "../types";
import { StripeProvider } from "./stripe-provider";

// ============================================================
// Provider Registry
// ============================================================

const providers: Partial<Record<PaymentProvider, () => PaymentService>> = {
  stripe: () => new StripeProvider(),
  // Future providers (implement PaymentService interface):
  // adyen: () => new AdyenProvider(),
  // paddle: () => new PaddleProvider(),
};

// ============================================================
// Factory
// ============================================================

let cachedProvider: PaymentService | null = null;

/**
 * Get the configured payment provider.
 * Defaults to Stripe if PAYMENT_PROVIDER is not set.
 */
export function getPaymentProvider(): PaymentService {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.PAYMENT_PROVIDER || "stripe") as PaymentProvider;
  const factory = providers[providerName] || providers.stripe;

  if (!factory) {
    throw new Error(`No payment provider found for: ${providerName}`);
  }

  cachedProvider = factory();
  return cachedProvider;
}

/**
 * Get the current provider name.
 */
export function getProviderName(): PaymentProvider {
  return getPaymentProvider().providerName;
}
