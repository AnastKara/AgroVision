import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface SubscriptionUpdateEmailProps {
  name: string;
  planName: string;
  status: string;
  message: string;
  billingUrl: string;
}

export default function SubscriptionUpdateEmail({
  name,
  planName,
  status,
  message,
  billingUrl,
}: SubscriptionUpdateEmailProps) {
  return (
    <EmailLayout
      preview={`Your AgroVision subscription (${planName}) has been updated.`}
      title="Subscription update"
    >
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>{message}</Text>

      <Section style={summary}>
        <SummaryRow label="Plan" value={planName} />
        <SummaryRow label="Status" value={formatStatus(status)} />
      </Section>

      <Text style={paragraph}>
        You can manage your subscription, payment method, and billing anytime
        from the billing section of your dashboard.
      </Text>

      <Section style={buttonRow}>
        <Button href={billingUrl} style={button}>
          Manage subscription
        </Button>
      </Section>
    </EmailLayout>
  );
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Past due",
    canceled: "Canceled",
    unpaid: "Unpaid",
    incomplete: "Incomplete",
    paused: "Paused",
  };
  return map[status] || status;
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
