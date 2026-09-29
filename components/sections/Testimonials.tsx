import { getTestimonials } from "@/lib/data/testimonials";

function StarRow({ count }: { count: number }) {
  return (
    <div className="mb-4 flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-gold)">
          <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7Z" />
        </svg>
      ))}
    </div>
  );
}

export default async function Testimonials() {
  const testimonials = await getTestimonials();

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-ivory-deep px-8 py-22">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            MÜŞTERİLERİMİZ ANLATIYOR
          </div>
          <h2 className="font-display mt-2.5 text-[34px]">Bize Güveniyorlar</h2>
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="border border-line bg-white p-8">
              <StarRow count={t.rating} />
              <p className="text-[14.5px] leading-relaxed text-ink-soft italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 text-[13px] tracking-wide">— {t.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
