import { env } from "@/utils/env";
import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    secure: false, // true for 465, false for other ports like 587
    port: 587,
    name: "hi",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const transporter = createTransporter();
