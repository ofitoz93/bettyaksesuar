"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useFavorites } from "@/lib/favorites/FavoritesContext";

interface Particle {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  delay: number;
}

let particleIdCounter = 0;

export default function FavoriteButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const [popKey, setPopKey] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const willBeFavorite = !active;
    toggleFavorite(productId);
    setPopKey((k) => k + 1);

    if (willBeFavorite) {
      const next: Particle[] = Array.from({ length: 6 }, () => ({
        id: particleIdCounter++,
        dx: Math.round((Math.random() - 0.5) * 140),
        dy: Math.round(50 + Math.random() * 90),
        rot: Math.round((Math.random() - 0.5) * 60),
        delay: Math.round(Math.random() * 150),
      }));
      setParticles(next);
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(() => setParticles([]), 1100);
    }
  };

  return (
    <span className={className}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
        aria-pressed={active}
        className="relative flex h-full w-full items-center justify-center"
      >
        <svg
          key={popKey}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="favorite-pop"
        >
          <path d="M12 21s-7.5-4.6-10.1-9.3C.3 8.6 1.6 5 5 4a5 5 0 0 1 7 1.5A5 5 0 0 1 19 4c3.4 1 4.7 4.6 3.1 7.7C19.5 16.4 12 21 12 21Z" />
        </svg>

        {particles.map((p) => (
          <span
            key={p.id}
            className="heart-particle"
            style={
              {
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--rot": `${p.rot}deg`,
                animationDelay: `${p.delay}ms`,
              } as CSSProperties
            }
          >
            ❤
          </span>
        ))}
      </button>
    </span>
  );
}
