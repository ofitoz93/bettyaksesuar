"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";

const STORAGE_KEY = "verastone-cart";

function readFromStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let cartSnapshot: CartItem[] =
  typeof window !== "undefined" ? readFromStorage() : [];
const listeners = new Set<() => void>();

function setCart(updater: (current: CartItem[]) => CartItem[]) {
  cartSnapshot = updater(cartSnapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartSnapshot));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartSnapshot;
}

const EMPTY_CART: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = (product: Product, quantity = 1) => {
    const stock = product.stock ?? 0;
    if (stock <= 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, stock);
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? null,
          quantity: Math.min(quantity, stock),
          stock,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clear = () => setCart(() => []);

  const { totalCount, totalPrice } = useMemo(
    () => ({
      totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, totalCount, totalPrice, addItem, removeItem, updateQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart, CartProvider içinde kullanılmalı");
  }
  return ctx;
}
