"use client";

import { useEffect, useRef, useState } from "react";
import TurkeyMap, { type CityType } from "turkey-map-react";
import type { CityOrderCount } from "@/lib/data/dashboard";

interface ViewBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_VIEWBOX: ViewBox = { top: 0, left: 80, width: 1050, height: 585 };

export default function TurkeyOrdersMap({ cities }: { cities: CityOrderCount[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewBoxRef = useRef<ViewBox>(DEFAULT_VIEWBOX);
  const animRef = useRef<number | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>(DEFAULT_VIEWBOX);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const maxCount = Math.max(1, ...cities.map((c) => c.orderCount));
  const cityDataByName = new Map(cities.map((c) => [c.city, c]));

  const findCityElement = (name: string): SVGGraphicsElement | null => {
    const svg = containerRef.current?.querySelector("svg");
    return (svg?.querySelector(`[data-iladi="${CSS.escape(name)}"]`) as SVGGraphicsElement) ?? null;
  };

  const recomputePositions = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    for (const city of cities) {
      const el = findCityElement(city.city);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      next[city.city] = {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
      };
    }
    setPositions(next);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(recomputePositions);
    window.addEventListener("resize", recomputePositions);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recomputePositions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.length]);

  const animateTo = (target: ViewBox) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = viewBoxRef.current;
    const startTime = performance.now();
    const duration = 450;

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next: ViewBox = {
        left: start.left + (target.left - start.left) * eased,
        top: start.top + (target.top - start.top) * eased,
        width: start.width + (target.width - start.width) * eased,
        height: start.height + (target.height - start.height) * eased,
      };
      viewBoxRef.current = next;
      setViewBox(next);
      recomputePositions();
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const zoomToCity = (name: string) => {
    const el = findCityElement(name);
    if (!el) return;
    const bbox = el.getBBox();
    const paddingX = bbox.width * 0.5;
    const paddingY = bbox.height * 0.5;
    animateTo({
      left: bbox.x - paddingX,
      top: bbox.y - paddingY,
      width: bbox.width + paddingX * 2,
      height: bbox.height + paddingY * 2,
    });
    setSelectedCity(name);
  };

  const resetZoom = () => {
    animateTo(DEFAULT_VIEWBOX);
    setSelectedCity(null);
  };

  const handleMapClick = (city: CityType) => {
    zoomToCity(city.name);
  };

  const selected = selectedCity ? cityDataByName.get(selectedCity) : null;

  return (
    <div className="border border-line bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-ink-soft">
          {cities.length === 0
            ? "Henüz il bilgisi içeren sipariş yok."
            : "Bir ile tıklayarak yakınlaşabilirsiniz."}
        </p>
        {selectedCity && (
          <button
            type="button"
            onClick={resetZoom}
            className="text-xs text-ink-soft underline hover:text-ink"
          >
            ← Tüm Türkiye
          </button>
        )}
      </div>

      {selected && (
        <div className="mb-4 border border-line bg-ivory px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.city}</span> — {selected.orderCount} sipariş
          (₺{selected.revenue.toLocaleString("tr-TR")})
        </div>
      )}

      <div ref={containerRef} className="relative">
        <TurkeyMap
          viewBox={viewBox}
          hoverable
          showTooltip
          customStyle={{ idleColor: "#E4D9C4", hoverColor: "#C9A24B" }}
          onClick={handleMapClick}
        />
        {cities.map((city) => {
          const pos = positions[city.city];
          if (!pos) return null;
          const ratio = city.orderCount / maxCount;
          const size = Math.round(18 + ratio * 24);
          return (
            <button
              key={city.city}
              type="button"
              onClick={() => zoomToCity(city.city)}
              title={`${city.city} — ${city.orderCount} sipariş (₺${city.revenue.toLocaleString("tr-TR")})`}
              style={{
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute flex items-center justify-center rounded-full bg-gold-deep text-[10px] font-medium text-white shadow-md ring-2 ring-white hover:bg-ink"
            >
              {city.orderCount}
            </button>
          );
        })}
      </div>
    </div>
  );
}
