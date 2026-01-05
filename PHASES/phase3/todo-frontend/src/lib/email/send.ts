import { PasswordResetEmail } from "../../../emails/password-reset";
import { VerificationEmail } from "../../../emails/verification-email";
import { render } from "@react-email/render";
import { transporter } from "./transporter";

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export const sendEmail = async ({ to, subject, react }: SendEmailParams): Promise<boolean> => {
  try {
    const emailHtml = await render(react);

    const mailOptions = {
      from: "TaskFlow <noreply@taskflow.com>",
      to,
      subject,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, url: string, name?: string) => {
  try {
    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset Request",
      react: PasswordResetEmail({ userName: name, resetLink: url }),
    });

    if (emailSent) {
      console.log(`Password reset email sent to: ${email}`);
      return true;
    } else {
      console.error(`Failed to send password reset email to: ${email}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

export const sendVerificationEmail = async (email: string, url: string, name?: string) => {
  try {
    const emailSent = await sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      react: VerificationEmail({ userName: name, verificationLink: url }),
    });

    if (emailSent) {
      console.log(`Verification email sent to: ${email}`);
      return true;
    } else {
      console.error(`Failed to send verification email to: ${email}`);
      return false;
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};