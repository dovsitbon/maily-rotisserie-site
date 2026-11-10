import type { IllusKind } from "@/lib/carte";

// Petits dessins au trait, faits pour Maily. Ils tiennent la place des photos de plats tant que
// le commerce n'en a pas fourni (liste dans assets/A-PHOTOGRAPHIER.md). viewBox 0 0 120 120, trait = currentColor.

export type IllusName = IllusKind | "leaf" | "facade" | "hat";

const P: Record<IllusName, string[]> = {
  banhmi: [
    "M12 70C12 58 30 50 60 49S108 54 108 64 92 80 60 82 12 82 12 70Z",
    "M32 58 40 67M50 54 58 64M68 53 76 63M86 55 92 63",
    "M20 74C38 80 82 79 102 69",
    "M30 50C26 40 34 34 40 42M46 48C48 36 58 38 56 47M70 47C74 37 84 41 78 49",
  ],
  bowl: [
    "M16 58H104C104 82 86 98 60 98S16 82 16 58Z",
    "M44 98 46 106H74L76 98",
    "M28 58C32 50 38 50 42 58 46 50 52 50 56 58 60 50 66 50 70 58 74 50 80 50 84 58 88 50 94 50 96 58",
    "M70 40C70 30 80 26 86 30 84 38 76 42 70 40ZM70 40 82 32",
    "M84 22 112 8M90 26 116 16",
  ],
  nem: [
    "M18 70 64 46C70 43 78 46 80 52S78 64 72 67L26 90C20 93 13 90 11 84S12 73 18 70Z",
    "M40 84 86 60C92 57 100 60 102 66S100 78 94 81L48 104",
    "M28 74 32 84M40 68 44 78M52 62 56 72",
    "M92 30C92 20 102 16 108 20 106 28 98 32 92 30ZM92 30 104 22",
  ],
  samosa: ["M20 90 60 22 100 90Z", "M34 90 60 44 86 90", "M60 22V12", "M30 98H90"],
  box: ["M18 46H102L94 100H26Z", "M18 46 28 30H92L102 46", "M34 60C40 54 48 54 52 60M58 64C64 58 72 58 76 64M44 76C50 70 58 70 62 76", "M80 26 104 6M86 30 110 12"],
  noodles: ["M16 58H104C104 82 86 98 60 98S16 82 16 58Z", "M30 58C34 44 44 64 50 48S62 62 68 46 80 62 88 50", "M60 46V20C60 14 66 12 70 16", "M44 98 46 106H74L76 98"],
  chicken: [
    "M24 78C24 58 42 46 62 46S100 56 100 74C100 88 86 96 62 96S24 92 24 78Z",
    "M88 54 104 38C108 34 114 38 110 44L98 60",
    "M34 60 22 46C18 42 22 36 28 40L44 52",
    "M14 100H106",
    "M50 66C56 62 66 62 72 66",
  ],
  skewer: ["M10 100 110 20", "M30 72a10 10 0 1 0 0.1 0M54 54a11 11 0 1 0 0.1 0M78 36a10 10 0 1 0 0.1 0", "M24 96a6 6 0 1 0 0.1 0"],
  tray: ["M10 82H110L102 96H18Z", "M24 82C24 62 40 50 60 50S96 62 96 82", "M60 50V40M52 40H68", "M34 70C40 66 46 66 50 70"],
  glass: ["M36 30H84L78 104H42Z", "M38 52H82", "M66 30 78 8H90", "M48 66a4 4 0 1 0 0.1 0M64 78a4 4 0 1 0 0.1 0M54 90a4 4 0 1 0 0.1 0"],
  cake: ["M20 64H100V98H20Z", "M20 64C20 50 40 40 60 40S100 50 100 64", "M20 80C32 86 44 74 60 80S88 86 100 80", "M60 40V28M56 24C56 18 64 18 64 24"],
  cup: ["M30 36H90L80 92H40Z", "M30 36C30 24 44 18 60 18S90 24 90 36", "M40 92 44 104H76L80 92", "M60 18V8"],
  can: ["M38 22H82V104H38Z", "M38 30H82M38 96H82", "M50 50H70V72H50Z", "M54 22V14H66V22"],
  leaf: ["M20 100C20 50 50 22 100 20 98 70 70 100 20 100Z", "M20 100 76 44M40 80 40 62M54 66 56 50M60 70 76 70M44 84 62 84"],
  facade: ["M16 104V34H104V104", "M10 34H110L104 20H16Z", "M30 104V58H54V104", "M66 58H92V84H66Z", "M36 48H84"],
  hat: ["M10 78 60 30 110 78Z", "M10 78C30 88 90 88 110 78", "M34 70 60 46 86 70"],
};

export function Illus({ name, className = "h-24 w-24", strokeWidth = 3 }: { name: IllusName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Feuille de coriandre (l'ouverture en fait tomber quelques-unes). */
export const LEAF = "M0 0C-3-6-1-12 4-14 5-11 8-11 9-14 13-11 13-5 9-2 12-1 12 3 9 4 5 6 2 4 0 0ZM0 0 7-7";
