import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// ============================================================
// Shared AgroVision email layout & branding
// ============================================================

export interface EmailLayoutProps {
  preview: string;
  title: string;
  children: React.ReactNode;
}

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export default function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header / Brand */}
          <Section style={header}>
            <Row>
              <Column>
                <div style={brandRow}>
                  <div style={brandBadge}>
                    <Img
                      src={`${APP_URL}/icons/icon-192.png`}
                      alt="AgroVision"
                      width={28}
                      height={28}
                      style={brandImg}
                    />
                  </div>
                  <Text style={brandText}>AgroVision</Text>
                </div>
              </Column>
            </Row>
            <Hr style={hr} />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={titleStyle}>{title}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Text style={footerText}>
              © {new Date().getFullYear()} AgroVision — Digital Twin of Your Farm
            </Text>
            <Text style={footerSub}>
              You received this email because you have an account at AgroVision.
              If you didn&apos;t request this, you can safely ignore it.
            </Text>
            <div style={footerLinks}>
              <Link href={APP_URL} style={footerLink}>
                Visit AgroVision
              </Link>
              <span style={footerDot}>·</span>
              <Link href={`${APP_URL}/dashboard/settings`} style={footerLink}>
                Notification Settings
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================
// Styles
// ============================================================

const body: React.CSSProperties = {
  backgroundColor: "#f6f9f8",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "32px 12px",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "600px",
  margin: "0 auto",
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  border: "1px solid #e6ecea",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  padding: "24px 32px 16px",
};

const brandRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const brandBadge: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: "#16a34a",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const brandImg: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
};

const brandText: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#14532d",
  margin: 0,
};

const hr: React.CSSProperties = {
  borderColor: "#e6ecea",
  margin: "16px 0",
};

const content: React.CSSProperties = {
  padding: "8px 32px 24px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#1a2e2a",
  margin: "0 0 16px",
  lineHeight: "1.3",
};

const footer: React.CSSProperties = {
  padding: "8px 32px 28px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#8a9a93",
  margin: "0 0 4px",
};

const footerSub: React.CSSProperties = {
  fontSize: "12px",
  color: "#a3b0aa",
  margin: "0 0 8px",
  lineHeight: "1.5",
};

const footerLinks: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const footerLink: React.CSSProperties = {
  fontSize: "12px",
  color: "#16a34a",
  textDecoration: "underline",
};

const footerDot: React.CSSProperties = {
  color: "#c7d1cc",
};
