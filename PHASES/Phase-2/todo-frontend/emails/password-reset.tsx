import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
  Img,
} from "@react-email/components";
import { CoffeeIcon } from "lucide-react";

interface PasswordResetEmailProps {
  userName?: string;
  resetLink: string;
  expiresAt?: Date;
}

export const PasswordResetEmail = ({
  userName = "User",
  resetLink,
  expiresAt = new Date(Date.now() + 3600000),
}: PasswordResetEmailProps) => {
  const main = {
    backgroundColor: "#f6f4f1",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    padding: "40px 0",
  };

  const card = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px",
    borderRadius: "12px",
    maxWidth: "480px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const iconWrapper = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    margin: "auto auto",
    borderRadius: "16px",
    backgroundImage: "linear-gradient(135deg, #51341f 0%, #382517 100%)",
    textAlign: "center" as const,
    boxShadow: "0 8px 32px -8px hsla(35, 85%, 55%, 0.25)",
    marginBottom: "16px",
  };

  const icon = {
    width: "32px",
    height: "32px",
    color: "#f7f5f2",
  };

  const title = {
    color: "#5D4037",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 24px",
    textAlign: "center" as const,
  };

  const paragraph = {
    color: "#4a4a4a",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  };

  const muted = {
    color: "#8B7355",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "24px 0 16px",
  };

  const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
  };

  const buttonStyle = {
    backgroundColor: "#8B7355",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    display: "inline-block",
    padding: "14px 32px",
    cursor: "pointer",
  };

  const linkText = {
    color: "#8B7355",
    fontSize: "14px",
    lineHeight: "20px",
    wordBreak: "break-all" as const,
    margin: "8px 0",
  };

  const footer = {
    color: "#8B7355",
    fontSize: "14px",
    marginTop: "32px",
    textAlign: "center" as const,
  };

  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>

      <Body style={main}>
        <Container style={card}>
          <Container style={{ textAlign: "center" }}>
            <Container style={iconWrapper}>
              {/* <CoffeeIcon style={icon} /> */}
              <Img style={icon} src="https://api.iconify.design/lucide:coffee.svg?color=%23f7f5f2" />
            </Container>
          </Container>

          <Heading style={title}>Password Reset Request</Heading>

          <Text style={paragraph}>Hi {userName},</Text>

          <Text style={paragraph}>
            We received a request to reset the password for your account.
          </Text>

          <Section style={buttonContainer}>
            <Button href={resetLink} style={buttonStyle}>
              Reset Password
            </Button>
          </Section>

          <Text style={paragraph}>
            Or copy and paste this link into your browser:
          </Text>

          <Text style={linkText}>{resetLink}</Text>

          <Text style={muted}>
            This link will expire on{" "}
            <strong>{expiresAt.toLocaleString()}</strong>. If you didn't request
            a password reset, ignore this email.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html >
  );
};

export default PasswordResetEmail;
