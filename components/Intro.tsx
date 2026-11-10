"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { LEAF } from "@/components/Illus";
import { Wordmark } from "@/components/Logo";

const KEY = "maily-intro";
const at = (d: number, t?: number) => ({ "--d": `${d}s`, ...(t ? { "--t": `${t}s` } : {}) }) as CSSProperties;

const LEAVES = [
  { x: 70, y: 52, r: -24, r0: -90, d: 0.4 },
  { x: 100, y: 46, r: 12, r0: 60, d: 0.48 },
  { x: 132, y: 50, r: 30, r0: -50, d: 0.56 },
];

/**
 * Ouverture (1,2 s, une fois par session), en CSS (globals.css) : fond crème, un banh mi se dessine au trait rouge,
 * quelques feuilles de coriandre tombent, « MAILY » apparaît puis « RÔTISSERIE VIETNAMIENNE », fondu sur le hero.
 * Bouton « Passer » ; ignorée si l'utilisateur préfère réduire les animations.
 */
export function Intro({ skipLabel }: { skipLabel: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      document.documentElement.classList.add("intro-seen");
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;
  const p = { pathLength: 1, className: "intro-draw" };
  return (
    <div className="intro-curtain flex flex-col items-center justify-center">
      <svg viewBox="0 0 200 110" className="h-28 w-auto text-red md:h-32" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path {...p} d="M16 70C16 54 44 44 100 42S184 50 184 64 160 88 100 90 16 88 16 70Z" style={at(0, 0.42)} />
        <path {...p} d="M28 76C60 84 136 84 172 70" style={at(0.18, 0.26)} />
        <path {...p} d="M52 56 62 66M84 50 94 62M116 49 126 61M148 52 156 62" style={at(0.3, 0.2)} />
        {LEAVES.map((l) => (
          <g key={l.x} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(1.3)`}>
            <path d={LEAF} className="intro-leaf" fill="#4F8A3B" stroke="#36622A" strokeWidth={1.2} style={{ ...at(l.d), "--r0": `${l.r0}deg` } as CSSProperties} />
          </g>
        ))}
      </svg>
      <div className="intro-word mt-7" style={at(0.62)} aria-hidden="true">
        <Wordmark className="w-44 md:w-52" />
      </div>
      <p className="intro-sub mt-3 text-[0.7rem] font-semibold tracking-[0.24em] text-ink" style={at(0.76)} aria-hidden="true">
        RÔTISSERIE VIETNAMIENNE
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
          document.documentElement.classList.add("intro-seen");
          setGone(true);
        }}
        className="absolute end-4 bottom-4 min-h-11 rounded-full px-4 font-semibold text-muted hover:text-ink"
      >
        {skipLabel}
      </button>
    </div>
  );
}
