import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export default function VerificationEmail({
  name,
  verificationUrl,
  expiresInHours = 24,
}: VerificationEmailProps) {
  return (
    <EmailLayout
      preview="Confirm your email address to activate your AgroVision account."
      title="Confirm your email address"
    >
      <Text style={paragraph}>
        Hi {name}, thanks for signing up for AgroVision! To activate your account
        and start managing your farm, please confirm your email address by
        clicking the button below.
      </Text>
      <Section style={buttonRow}>
        <Button href={verificationUrl} style={button}>
          Verify your email
        </Button>
      </Section>
      <Text style={muted}>
        This link will expire in {expiresInHours} hours. If you didn&apos;t create an
        AgroVision account, you can safely ignore this email.
      </Text>
      <Text style={muted}>
        Or copy and paste this link into your browser:
      </Text>
      <Text style={linkBox}>{verificationUrl}</Text>
    </EmailLayout>
  );
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#33443e",
  margin: "0 0 16px",
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

const muted: React.CSSProperties = {
  fontSize: "13px",
  color: "#8a9a93",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const linkBox: React.CSSProperties = {
  fontSize: "12px",
  color: "#16a34a",
  backgroundColor: "#f0f7f3",
  border: "1px solid #d7eade",
  borderRadius: "8px",
  padding: "10px 12px",
  wordBreak: "break-all",
  margin: "0",
};
