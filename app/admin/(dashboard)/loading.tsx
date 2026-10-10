// Sayfa geçişlerinde sunucu cevabı beklenirken anında gösterilen iskelet
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Yükleniyor">
      <div className="mb-6 h-8 w-48 bg-line" />
      <div className="mb-4 h-9 w-full bg-line/60" />
      <div className="border border-line bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-line px-4 py-4 last:border-0">
            <div className="h-4 w-1/4 bg-line/70" />
            <div className="h-4 w-1/5 bg-line/50" />
            <div className="h-4 w-1/4 bg-line/50" />
            <div className="ml-auto h-4 w-16 bg-line/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
