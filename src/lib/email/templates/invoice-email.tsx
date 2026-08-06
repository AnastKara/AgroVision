import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface InvoiceEmailProps {
  name: string;
  invoiceNumber: string;
  planName: string;
  amount: number; // in cents
  currency: string;
  date: string; // ISO date
  invoicePdfUrl: string;
  invoicesUrl: string;
}

export default function InvoiceEmail({
  name,
  invoiceNumber,
  planName,
  amount,
  currency,
  date,
  invoicePdfUrl,
  invoicesUrl,
}: InvoiceEmailProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amount / 100);

  return (
    <EmailLayout
      preview={`Your AgroVision invoice ${invoiceNumber} is now available.`}
      title="Your invoice is ready"
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>
        Your invoice for the <strong>{planName}</strong> plan is now available.
        You can download it as a PDF below or view it anytime in the billing
        section of your dashboard.
      </Text>

      <Section style={summary}>
        <SummaryRow label="Invoice number" value={invoiceNumber} />
        <SummaryRow label="Plan" value={planName} />
        <SummaryRow label="Amount" value={formattedAmount} />
        <SummaryRow label="Date" value={new Date(date).toLocaleDateString()} />
      </Section>

      <Section style={buttonRow}>
        <Button href={invoicePdfUrl} style={buttonPrimary}>
          Download invoice PDF
        </Button>
      </Section>
      <Section style={buttonRowSecondary}>
        <Button href={invoicesUrl} style={buttonSecondary}>
          View all invoices
        </Button>
      </Section>
    </EmailLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={row}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </div>
  );
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#33443e",
  margin: "0 0 16px",
};

const summary: React.CSSProperties = {
  backgroundColor: "#f8fbf9",
  border: "1px solid #e3eee7",
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "0 0 20px",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
};

const rowLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7d75",
  margin: 0,
};

const rowValue: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#1a2e2a",
  margin: 0,
};

const buttonRow: React.CSSProperties = {
  textAlign: "center",
  margin: "8px 0",
};

const buttonRowSecondary: React.CSSProperties = {
  textAlign: "center",
  margin: "8px 0 0",
};

const buttonPrimary: React.CSSProperties = {
  backgroundColor: "#16a34a",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 28px",
  display: "inline-block",
};

const buttonSecondary: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  color: "#16a34a",
  fontSize: "14px",
  fontWeight: 600,
  border: "1px solid #16a34a",
  textDecoration: "none",
  padding: "10px 24px",
  display: "inline-block",
};
