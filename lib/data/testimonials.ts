import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Testimonial } from "@/lib/types";

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author, rating, quote")
    .order("position", { ascending: true });

  if (error) {
    console.error("getTestimonials error:", error.message);
    return [];
  }
  return data;
}

export interface TestimonialRow {
  id: string;
  author: string;
  rating: number;
  quote: string;
  position: number;
}

export async function getTestimonialsForAdmin(): Promise<TestimonialRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author, rating, quote, position")
    .order("position", { ascending: true });

  if (error) {
    console.error("getTestimonialsForAdmin error:", error.message);
    return [];
  }
  return data;
}

export async function getTestimonialById(id: string): Promise<TestimonialRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, author, rating, quote, position")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}
