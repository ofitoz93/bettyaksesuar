const items: { label: string; paths: string[] }[] = [
  {
    label: "Su Geçirmez Çelik",
    paths: ["M12 3c3.5 4 6 7.3 6 10.5A6 6 0 0 1 6 13.5C6 10.3 8.5 7 12 3Z"],
  },
  {
    label: "2 Yıl Garanti",
    paths: [
      "M12 3 20 6.5v5.4c0 5-3.4 8.3-8 9.6-4.6-1.3-8-4.6-8-9.6V6.5L12 3Z",
      "M9 12l2 2 4-4.2",
    ],
  },
  {
    label: "1.000 TL Üzeri Kargo Bedava",
    paths: ["M2 8h13v9H2z", "M15 11h4l3 3v3h-7z"],
  },
  {
    label: "14 Gün Kolay İade",
    paths: ["M4 12a8 8 0 1 1 3 6.2", "M4 18v-5h5"],
  },
];

export default function TrustBar() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-8 py-7 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-3"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-gold-deep)"
              strokeWidth={1.3}
            >
              {item.paths.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
            <span className="text-[12.5px] tracking-wide">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
