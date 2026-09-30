import { createClient } from "@/lib/supabase/server";

export interface NotificationSettings {
  smtpHost: string | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpPort: number | null;
  smtpTimeout: number;
  alertNewCustomer: boolean;
  alertNewOrder: boolean;
  alertNewReview: boolean;
  alertExtraEmail: string | null;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  smtpHost: null,
  smtpUsername: null,
  smtpPassword: null,
  smtpPort: null,
  smtpTimeout: 30,
  alertNewCustomer: false,
  alertNewOrder: true,
  alertNewReview: false,
  alertExtraEmail: null,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  return {
    smtpHost: data.smtp_host,
    smtpUsername: data.smtp_username,
    smtpPassword: data.smtp_password,
    smtpPort: data.smtp_port,
    smtpTimeout: data.smtp_timeout,
    alertNewCustomer: data.alert_new_customer,
    alertNewOrder: data.alert_new_order,
    alertNewReview: data.alert_new_review,
    alertExtraEmail: data.alert_extra_email,
  };
}
