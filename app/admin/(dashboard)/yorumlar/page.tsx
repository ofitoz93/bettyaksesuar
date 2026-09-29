import Link from "next/link";
import { getTestimonialsForAdmin } from "@/lib/data/testimonials";
import DeleteTestimonialButton from "./DeleteTestimonialButton";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonialsForAdmin();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px]">Müşteri Yorumları</h1>
        <Link
          href="/admin/yorumlar/yeni"
          className="bg-ink px-6 py-3 text-xs font-medium tracking-[0.14em] text-ivory uppercase hover:bg-gold-deep"
        >
          + Yeni Yorum
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Henüz yorum yok. &ldquo;Yeni Yorum&rdquo; ile ilk yorumu ekleyin.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-line border-y border-line bg-white">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-center gap-5 px-5 py-4">
              <div className="flex-1">
                <div className="text-sm">{t.author}</div>
                <p className="mt-1 line-clamp-1 text-xs text-ink-soft">{t.quote}</p>
              </div>
              <div className="text-xs text-gold-deep">{"★".repeat(t.rating)}</div>
              <Link
                href={`/admin/yorumlar/${t.id}`}
                className="text-xs tracking-wide text-ink-soft hover:text-ink"
              >
                Düzenle
              </Link>
              <DeleteTestimonialButton id={t.id} author={t.author} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
