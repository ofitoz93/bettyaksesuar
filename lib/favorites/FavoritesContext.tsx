"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FavoritesContextValue {
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled || !user) return;
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);
      if (!cancelled && data) {
        setFavoriteIds(new Set(data.map((row) => row.product_id as string)));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.has(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      const supabase = createClient();

      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) {
          router.push("/hesabim/giris");
          return;
        }

        const alreadyFavorite = favoriteIds.has(productId);

        setFavoriteIds((current) => {
          const next = new Set(current);
          if (alreadyFavorite) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });

        if (alreadyFavorite) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("favorites")
            .insert({ user_id: user.id, product_id: productId });
        }
      });
    },
    [favoriteIds, router],
  );

  const value = useMemo(
    () => ({ isFavorite, toggleFavorite }),
    [isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites, FavoritesProvider içinde kullanılmalı");
  }
  return ctx;
}
