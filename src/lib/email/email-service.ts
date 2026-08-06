/**
 * EmailService Abstraction
 *
 * Defines the contract for transactional email providers (Resend, and future
 * providers like SendGrid, Postmark, SES, etc.). Application business logic
 * depends only on this interface, so we can switch providers without
 * rewriting any business logic or email templates.
 */

// ============================================================
// Email Types
// ============================================================

export interface BaseEmailParams {
  /** Recipient email address */
  to: string;
  /** Recipient name (optional, used for personalization) */
  name?: string;
}

export interface WelcomeEmailParams extends BaseEmailParams {
  appUrl?: string;
}

export interface VerificationEmailParams extends BaseEmailParams {
  verificationUrl: string;
  expiresInHours?: number;
}

export interface PaymentSuccessEmailParams extends BaseEmailParams {
  planName: string;
  amount: number;
  currency: string;
  date: string;
  invoicesUrl: string;
}

export interface InvoiceEmailParams extends BaseEmailParams {
  invoiceNumber: string;
  planName: string;
  amount: number;
  currency: string;
  date: string;
  invoicePdfUrl: string;
  invoicesUrl: string;
}

export interface SubscriptionUpdateEmailParams extends BaseEmailParams {
  planName: string;
  status: string;
  message: string;
  billingUrl: string;
}

export interface PaymentFailedEmailParams extends BaseEmailParams {
  planName: string;
  amount: number;
  currency: string;
  dueDate: string;
  billingUrl: string;
}

// ============================================================
// Email Result
// ============================================================

export interface EmailResult {
  success: boolean;
  /** Email provider message ID if sent */
  messageId?: string;
  /** Whether the email was simulated (dev mode) */
  simulated?: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================
// EmailService Interface
// ============================================================

export interface EmailService {
  readonly providerName: string;

  sendWelcome(params: WelcomeEmailParams): Promise<EmailResult>;
  sendVerification(params: VerificationEmailParams): Promise<EmailResult>;
  sendPaymentSuccess(params: PaymentSuccessEmailParams): Promise<EmailResult>;
  sendInvoice(params: InvoiceEmailParams): Promise<EmailResult>;
  sendSubscriptionUpdate(
    params: SubscriptionUpdateEmailParams
  ): Promise<EmailResult>;
  sendPaymentFailed(params: PaymentFailedEmailParams): Promise<EmailResult>;
}

// ============================================================
// Shared helpers
// ============================================================

/** Default "from" sender address for all AgroVision emails */
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "AgroVision <onboarding@agrovizion.com>";

/** Resolve the app base URL for links in emails */
export function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}
