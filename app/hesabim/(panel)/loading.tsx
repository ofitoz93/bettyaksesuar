export default function HesabimLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Yükleniyor">
      <div className="mb-6 h-8 w-40 border-b border-line bg-line" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 border border-line bg-white" />
        ))}
      </div>
    </div>
  );
}
