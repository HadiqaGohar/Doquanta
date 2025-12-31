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
  Row,
  Column,
} from "@react-email/components";
import { CoffeeIcon } from "lucide-react";

interface VerificationEmailProps {
  userName?: string;
  verificationLink: string;
  expiresAt?: Date;
}

export const VerificationEmail = ({
  userName = "User",
  verificationLink,
  expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000),
}: VerificationEmailProps) => {
  const formattedExpiry = expiresAt.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

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
    borderRadius: "16px",
    backgroundImage: "linear-gradient(135deg, #51341f 0%, #382517 100%)",
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
    textAlign: "center" as const,
    marginBottom: "24px",
  };

  const paragraph = {
    color: "#4a4a4a",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  };

  const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
  };

  const button = {
    backgroundColor: "#8B7355",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold" as const,
    padding: "14px 32px",
    textDecoration: "none",
    display: "inline-block",
    cursor: "pointer",
  };

  const footer = {
    color: "#8B7355",
    fontSize: "14px",
    marginTop: "32px",
    textAlign: "center" as const,
    borderTop: "1px solid #eaeaea",
    paddingTop: "20px",
  };

  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>

      <Body style={main}>
        <Container style={card}>
          <Container style={{ textAlign: "center" }}>
            <Container style={iconWrapper}>
              <CoffeeIcon style={icon} />
            </Container>
          </Container>

          <Heading style={title}>Verify Your Email Address</Heading>

          <Text style={paragraph}>Hello {userName},</Text>

          <Text style={paragraph}>
            Thanks for creating an account! Please verify your email address by
            clicking the button below. This link will expire on{" "}
            <strong>{formattedExpiry}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Row>
              <Column align="center">
                <Button style={button} href={verificationLink}>
                  Verify Email
                </Button>
              </Column>
            </Row>
          </Section>

          <Text style={paragraph}>
            If you didn’t sign up for an account, feel free to ignore this email.
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;
