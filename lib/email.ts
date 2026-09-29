const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Betty Aksesuar <onboarding@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(`sendEmail: RESEND_API_KEY tanımlı değil, e-posta gönderilmedi (${to} — ${subject})`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!response.ok) {
      console.error("sendEmail error:", await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendEmail exception:", err);
    return false;
  }
}
