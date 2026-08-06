/**
 * Email Provider Factory
 *
 * Returns the configured EmailService implementation based on the
 * EMAIL_PROVIDER environment variable. Defaults to Resend.
 */

import type { EmailService } from "../email-service";
import { ResendProvider } from "./resend-provider";

// ============================================================
// Provider Registry
// ============================================================

const providers: Record<string, () => EmailService> = {
  resend: () => new ResendProvider(),
  // Future providers:
  // sendgrid: () => new SendGridProvider(),
  // postmark: () => new PostmarkProvider(),
};

// ============================================================
// Factory
// ============================================================

let cachedProvider: EmailService | null = null;

/**
 * Get the configured email provider.
 * Defaults to Resend if EMAIL_PROVIDER is not set.
 */
export function getEmailProvider(): EmailService {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.EMAIL_PROVIDER || "resend";
  const factory = providers[providerName] || providers.resend;

  if (!factory) {
    throw new Error(`No email provider found for: ${providerName}`);
  }

  cachedProvider = factory();
  return cachedProvider;
}
