import { notFound } from "next/navigation";
import { getTestimonialById } from "@/lib/data/testimonials";
import { updateTestimonial } from "@/app/admin/actions";
import TestimonialForm from "../TestimonialForm";

interface EditYorumPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditYorumPage({ params }: EditYorumPageProps) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  const updateWithId = updateTestimonial.bind(null, id);

  return (
    <div>
      <h1 className="font-display mb-8 text-[28px]">Yorumu Düzenle</h1>
      <TestimonialForm
        action={updateWithId}
        testimonial={testimonial}
        submitLabel="Değişiklikleri Kaydet"
      />
    </div>
  );
}
