import carte from "@/data/carte.json";

export type Tag = "halal" | "vege";
export type IllusKind = "banhmi" | "bowl" | "nem" | "samosa" | "box" | "noodles" | "chicken" | "skewer" | "tray" | "glass" | "cake" | "cup" | "can";
export type Item = {
  price: number | null;
  from?: boolean;
  unit?: "piece";
  choices?: string[];
  onOrder?: boolean;
  tags: Tag[];
  photo: string[];
  illus: IllusKind;
};
export type ItemId = keyof typeof carte.items;
export type CategoryId = "banh-mi" | "bo-bun" | "nems" | "box" | "rotisserie" | "menus" | "desserts";

export const ITEMS = carte.items as unknown as Record<ItemId, Item>;
export const CATEGORIES = carte.categories as unknown as { id: CategoryId; items: ItemId[] }[];
export const isItem = (v: unknown): v is ItemId => typeof v === "string" && v in ITEMS;
export const checked = carte.checked;

/** Plus petit prix connu d'une catégorie (pour « dès 6 € » sur les tuiles). */
export function minPrice(cat: CategoryId) {
  const prices = CATEGORIES.find((c) => c.id === cat)!.items.map((id) => ITEMS[id].price).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}
