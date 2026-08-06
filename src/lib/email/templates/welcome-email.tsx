import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./email-layout";

export interface WelcomeEmailProps {
  name: string;
  appUrl?: string;
}

export default function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to AgroVision! Let's get your farm set up." title={`Welcome to AgroVision, ${name}!`}>
      <Text style={paragraph}>
        We&apos;re thrilled to have you on board. AgroVision gives you a complete
        digital twin of your farm — real-time monitoring, AI-powered insights,
        and intelligent automation in one place.
      </Text>
      <Text style={paragraph}>
        Here&apos;s what you can do next:
      </Text>
      <Section style={list}>
        <Text style={listItem}>🌱 Add your first field</Text>
        <Text style={listItem}>📡 Connect IoT sensors</Text>
        <Text style={listItem}>🌤️ Explore weather forecasts</Text>
        <Text style={listItem}>🤖 Chat with your AI farming assistant</Text>
      </Section>
      <Section style={buttonRow}>
        <Button href={appUrl || "http://localhost:3000/dashboard"} style={button}>
          Go to your dashboard
        </Button>
      </Section>
      <Text style={muted}>
        If you have any questions, our team is always happy to help. Reply to
        this email or reach out anytime.
      </Text>
    </EmailLayout>
  );
}

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#33443e",
  margin: "0 0 16px",
};

const list: React.CSSProperties = {
  margin: "0 0 20px",
};

const listItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.7",
  color: "#33443e",
  margin: "0",
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
  margin: "0",
  lineHeight: "1.5",
};
