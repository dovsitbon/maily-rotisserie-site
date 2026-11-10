"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import site from "@/data/site.json";
import { isItem, ITEMS, type ItemId } from "@/lib/carte";

// Panier de la commande à emporter : gardé dans le navigateur (localStorage), partagé par toutes les pages.

export type Line = { item: ItemId; choice: string; qty: number };
type Toast = { item: ItemId; n: number } | null;
type Cart = {
  lines: Line[];
  count: number;
  add: (item: ItemId, choice?: string, qty?: number) => void;
  setQty: (item: ItemId, choice: string, qty: number) => void;
  clear: () => void;
  qtyOf: (item: ItemId) => number;
  toast: Toast;
  ready: boolean;
};

const KEY = "maily-panier";
const CartContext = createContext<Cart | null>(null);

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart hors de CartProvider");
  return v;
}

const clean = (v: unknown): Line[] =>
  Array.isArray(v)
    ? v
        .filter((l) => l && isItem(l.item) && Number.isInteger(l.qty) && l.qty > 0)
        .map((l) => ({ item: l.item as ItemId, choice: ITEMS[l.item as ItemId].choices?.includes(l.choice) ? l.choice : (ITEMS[l.item as ItemId].choices?.[0] ?? ""), qty: Math.min(l.qty, site.order.maxPerLine) }))
    : [];

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- panier du navigateur, lu après hydratation
      setLines(clean(JSON.parse(localStorage.getItem(KEY) || "[]")));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((item: ItemId, choice = ITEMS[item].choices?.[0] ?? "", qty = 1) => {
    setLines((ls) => {
      const i = ls.findIndex((l) => l.item === item && l.choice === choice);
      if (i === -1) return [...ls, { item, choice, qty }];
      return ls.map((l, j) => (j === i ? { ...l, qty: Math.min(l.qty + qty, site.order.maxPerLine) } : l));
    });
    setToast((t) => ({ item, n: (t?.n ?? 0) + 1 }));
  }, []);

  const setQty = useCallback((item: ItemId, choice: string, qty: number) => {
    setLines((ls) => (qty <= 0 ? ls.filter((l) => !(l.item === item && l.choice === choice)) : ls.map((l) => (l.item === item && l.choice === choice ? { ...l, qty: Math.min(qty, site.order.maxPerLine) } : l))));
  }, []);

  const value = useMemo<Cart>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add,
      setQty,
      clear: () => setLines([]),
      qtyOf: (item) => lines.filter((l) => l.item === item).reduce((s, l) => s + l.qty, 0),
      toast,
      ready,
    }),
    [lines, add, setQty, toast, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Total connu du panier, et s'il reste des articles « à partir de » ou au prix du comptoir. */
export function totals(lines: Line[]) {
  let total = 0;
  let from = false;
  let unknown = false;
  for (const l of lines) {
    const it = ITEMS[l.item];
    if (it.price === null) unknown = true;
    else total += it.price * l.qty;
    if (it.from) from = true;
  }
  return { total, from, unknown };
}
