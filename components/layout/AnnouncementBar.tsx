"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ROTATE_MS = 20000;

export default function AnnouncementBar({ texts }: { texts: string[] }) {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messages = texts.filter((t) => t.trim().length > 0);

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (messages.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_MS);
  }, [messages.length]);

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartTimer]);

  const goTo = (next: number) => {
    setIndex(((next % messages.length) + messages.length) % messages.length);
    restartTimer();
  };

  if (pathname?.startsWith("/admin") || messages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-ink px-4 py-2.5 text-center text-[11.5px] tracking-wide text-ivory">
      {messages.length > 1 && (
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Önceki mesaj"
          className="shrink-0 px-1 text-ivory/70 hover:text-ivory"
        >
          ‹
        </button>
      )}
      <span>{messages[index]}</span>
      {messages.length > 1 && (
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Sonraki mesaj"
          className="shrink-0 px-1 text-ivory/70 hover:text-ivory"
        >
          ›
        </button>
      )}
    </div>
  );
}
