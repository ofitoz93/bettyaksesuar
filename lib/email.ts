import { getNotificationSettings } from "@/lib/data/notificationSettings";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Betty Aksesuar <onboarding@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendViaSmtp(
  params: SendEmailParams,
  smtp: { host: string; port: number; username: string | null; password: string | null; timeout: number },
): Promise<boolean> {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.username ? { user: smtp.username, pass: smtp.password ?? "" } : undefined,
      connectionTimeout: smtp.timeout * 1000,
    });

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (err) {
    console.error("sendEmail (SMTP) exception:", err);
    return false;
  }
}

async function sendViaResend(params: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(
      `sendEmail: ne SMTP ne RESEND_API_KEY tanımlı, e-posta gönderilmedi (${params.to} — ${params.subject})`,
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: params.to, subject: params.subject, html: params.html }),
    });

    if (!response.ok) {
      console.error("sendEmail (Resend) error:", await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendEmail (Resend) exception:", err);
    return false;
  }
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const notificationSettings = await getNotificationSettings();

  if (notificationSettings.smtpHost && notificationSettings.smtpPort) {
    return sendViaSmtp(params, {
      host: notificationSettings.smtpHost,
      port: notificationSettings.smtpPort,
      username: notificationSettings.smtpUsername,
      password: notificationSettings.smtpPassword,
      timeout: notificationSettings.smtpTimeout,
    });
  }

  return sendViaResend(params);
}
