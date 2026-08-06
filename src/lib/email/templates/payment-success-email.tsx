import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface PaymentSuccessEmailProps {
  name: string;
  planName: string;
  amount: number; // in cents
  currency: string;
  date: string; // ISO date
  invoicesUrl: string;
}

export default function PaymentSuccessEmail({
  name,
  planName,
  amount,
  currency,
  date,
  invoicesUrl,
}: PaymentSuccessEmailProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amount / 100);

  return (
    <EmailLayout
      preview="Your Agrovision payment was successful."
      title="Your payment was successful 🎉"
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>
        Your Agrovision payment was successful. Thank you for subscribing to the{" "}
        <strong>{planName}</strong> plan!
      </Text>

      <Section style={summary}>
        <SummaryRow label="Plan" value={planName} />
        <SummaryRow label="Amount paid" value={formattedAmount} />
        <SummaryRow label="Date" value={new Date(date).toLocaleDateString()} />
      </Section>

      <Text style={paragraph}>
        Your invoice is available for download. You can view all your invoices
        and receipts in the billing section of your dashboard, or by clicking
        the button below.
      </Text>

      <Section style={buttonRow}>
        <Button href={invoicesUrl} style={button}>
          View invoices &amp; receipts
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
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#16a34a",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 28px",
  display: "inline-block",
};
