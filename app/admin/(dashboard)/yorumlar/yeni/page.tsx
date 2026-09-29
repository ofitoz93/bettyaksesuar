import { createTestimonial } from "@/app/admin/actions";
import TestimonialForm from "../TestimonialForm";

export default function YeniYorumPage() {
  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yeni Yorum</h1>
      <TestimonialForm action={createTestimonial} submitLabel="Yorumu Ekle" />
    </div>
  );
}
