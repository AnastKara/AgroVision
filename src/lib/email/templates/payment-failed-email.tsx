import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface PaymentFailedEmailProps {
  name: string;
  planName: string;
  amount: number; // in cents
  currency: string;
  dueDate: string; // ISO date
  billingUrl: string;
}

export default function PaymentFailedEmail({
  name,
  planName,
  amount,
  currency,
  dueDate,
  billingUrl,
}: PaymentFailedEmailProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(amount / 100);

  return (
    <EmailLayout
      preview="We couldn't process your AgroVision payment."
      title="Payment failed — action needed"
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>
        We weren&apos;t able to process your payment of{" "}
        <strong>{formattedAmount}</strong> for the <strong>{planName}</strong>{" "}
        plan. To avoid any interruption to your subscription, please update your
        payment method.
      </Text>

      <Section style={summary}>
        <SummaryRow label="Plan" value={planName} />
        <SummaryRow label="Amount due" value={formattedAmount} />
        <SummaryRow label="Due date" value={new Date(dueDate).toLocaleDateString()} />
      </Section>

      <Text style={paragraph}>
        If the payment remains unsuccessful, your access to premium features may
        be downgraded to the Starter plan.
      </Text>

      <Section style={buttonRow}>
        <Button href={billingUrl} style={button}>
          Update payment method
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
  backgroundColor: "#fdf6f6",
  border: "1px solid #f3dcdc",
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
