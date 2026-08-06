import { Resend } from "resend";
import { render } from "@react-email/components";
import type {
  EmailService,
  EmailResult,
  WelcomeEmailParams,
  VerificationEmailParams,
  PaymentSuccessEmailParams,
  InvoiceEmailParams,
  SubscriptionUpdateEmailParams,
  PaymentFailedEmailParams,
} from "../email-service";
import { EMAIL_FROM, getAppUrl } from "../email-service";
import WelcomeEmail from "../templates/welcome-email";
import VerificationEmail from "../templates/verification-email";
import PaymentSuccessEmail from "../templates/payment-success-email";
import InvoiceEmail from "../templates/invoice-email";
import SubscriptionUpdateEmail from "../templates/subscription-update-email";
import PaymentFailedEmail from "../templates/payment-failed-email";

// ============================================================
// Resend Client
// ============================================================

const apiKey = process.env.RESEND_API_KEY;

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!apiKey) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// ============================================================
// ResendProvider
// ============================================================

export class ResendProvider implements EmailService {
  readonly providerName: string = "resend";

  private async send(
    to: string,
    subject: string,
    template: React.ReactElement
  ): Promise<EmailResult> {
const resend = getResend();

    // Dev mode: no API key configured → simulate and log
    if (!resend) {
      console.log(
        `[Email:simulated] To: ${to} | Subject: "${subject}" | Provider: resend`
      );
      return {
        success: true,
        simulated: true,
      };
    }

try {
      const html = await render(template);
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error(`[Email:error] ${subject} -> ${to}:`, error.message);
        return { success: false, error: error.message };
      }

      console.log(
        `[Email:sent] To: ${to} | Subject: "${subject}" | id: ${data?.id}`
      );
      return { success: true, messageId: data?.id };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown email error";
      console.error(`[Email:error] ${subject} -> ${to}:`, message);
      return { success: false, error: message };
    }
  }

  // ==========================================================
  // Email methods
  // ==========================================================

  async sendWelcome(params: WelcomeEmailParams): Promise<EmailResult> {
    return this.send(
      params.to,
      "Welcome to AgroVision! 🚜",
      WelcomeEmail({
        name: params.name || params.to.split("@")[0],
        appUrl: params.appUrl || getAppUrl(),
      })
    );
  }

  async sendVerification(
    params: VerificationEmailParams
  ): Promise<EmailResult> {
    return this.send(
      params.to,
      "Confirm your email address",
      VerificationEmail({
        name: params.name || params.to.split("@")[0],
        verificationUrl: params.verificationUrl,
        expiresInHours: params.expiresInHours ?? 24,
      })
    );
  }

  async sendPaymentSuccess(
    params: PaymentSuccessEmailParams
  ): Promise<EmailResult> {
    return this.send(
      params.to,
      "Your Agrovision payment was successful",
      PaymentSuccessEmail({
        name: params.name || params.to.split("@")[0],
        planName: params.planName,
        amount: params.amount,
        currency: params.currency,
        date: params.date,
        invoicesUrl: params.invoicesUrl,
      })
    );
  }

  async sendInvoice(params: InvoiceEmailParams): Promise<EmailResult> {
    return this.send(
      params.to,
      `Your AgroVision invoice ${params.invoiceNumber} is ready`,
      InvoiceEmail({
        name: params.name || params.to.split("@")[0],
        invoiceNumber: params.invoiceNumber,
        planName: params.planName,
        amount: params.amount,
        currency: params.currency,
        date: params.date,
        invoicePdfUrl: params.invoicePdfUrl,
        invoicesUrl: params.invoicesUrl,
      })
    );
  }

  async sendSubscriptionUpdate(
    params: SubscriptionUpdateEmailParams
  ): Promise<EmailResult> {
    return this.send(
      params.to,
      "Your AgroVision subscription has been updated",
      SubscriptionUpdateEmail({
        name: params.name || params.to.split("@")[0],
        planName: params.planName,
        status: params.status,
        message: params.message,
        billingUrl: params.billingUrl,
      })
    );
  }

  async sendPaymentFailed(
    params: PaymentFailedEmailParams
  ): Promise<EmailResult> {
    return this.send(
      params.to,
      "Action needed: payment failed",
      PaymentFailedEmail({
        name: params.name || params.to.split("@")[0],
        planName: params.planName,
        amount: params.amount,
        currency: params.currency,
        dueDate: params.dueDate,
        billingUrl: params.billingUrl,
      })
    );
  }
}
