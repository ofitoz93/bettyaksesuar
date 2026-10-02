import { createClient } from "@/lib/supabase/server";

export interface Campaign {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountPercent: number;
  enabled: boolean;
  createdAt: string;
}

function mapRow(row: {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_percent: number;
  enabled: boolean;
  created_at: string;
}): Campaign {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    discountPercent: Number(row.discount_percent),
    enabled: row.enabled,
    createdAt: row.created_at,
  };
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discount_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discount_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}
