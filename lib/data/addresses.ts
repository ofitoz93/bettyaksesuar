import { createClient } from "@/lib/supabase/server";

export interface CustomerAddress {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighbourhood: string;
  addressLine: string;
  isDefault: boolean;
}

interface AddressRow {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  neighbourhood: string;
  address_line: string;
  is_default: boolean;
}

function mapAddress(row: AddressRow): CustomerAddress {
  return {
    id: row.id,
    title: row.title,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    district: row.district,
    neighbourhood: row.neighbourhood,
    addressLine: row.address_line,
    isDefault: row.is_default,
  };
}

// Varsayılan adres önce, sonra en yeni eklenen
async function fetchAddresses(customerId: string): Promise<CustomerAddress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("id, title, full_name, phone, city, district, neighbourhood, address_line, is_default")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    // 032 migration'ı henüz çalıştırılmadıysa tablo yoktur — sayfa boş liste ile açılır
    console.error("fetchAddresses error:", error.message);
    return [];
  }

  return (data ?? []).map(mapAddress);
}

export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];
  return fetchAddresses(user.id);
}

// Admin müşteri detayı için (RLS: yalnızca admin okuyabilir)
export async function getAddressesForCustomer(customerId: string): Promise<CustomerAddress[]> {
  return fetchAddresses(customerId);
}

export function formatAddress(address: Pick<CustomerAddress, "addressLine" | "neighbourhood" | "district" | "city">): string {
  return [address.addressLine, address.neighbourhood, `${address.district} / ${address.city}`]
    .filter(Boolean)
    .join(", ");
}
