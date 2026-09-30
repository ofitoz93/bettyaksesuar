export default function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <h1 className="font-display mb-4 text-[28px]">{title}</h1>
      <div className="border border-dashed border-line bg-white p-8 text-sm text-ink-soft">
        Bu bölüm yakında eklenecek.
        {note && <p className="mt-2 text-xs text-ink-faint">{note}</p>}
      </div>
    </div>
  );
}
