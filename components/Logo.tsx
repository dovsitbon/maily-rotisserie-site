import L from "@/data/logo.json";

// Logo de Maily, redessiné d'après l'enseigne : coq rouge, « MAILY » et sa petite flamme.
// Tracés dans data/logo.json (aussi utilisés par npm run logo pour public/logo.svg et les favicons).

/** Le coq : crête en trois flammes, tête, bec jaune, barbillon, et le grand croissant du corps. */
export function Mark({ className = "h-10 w-auto", mono }: { className?: string; mono?: boolean }) {
  const red = mono ? "currentColor" : L.red;
  const m = L.mark;
  return (
    <svg viewBox={L.markViewBox} className={className} aria-hidden="true">
      <path d={m.comb} fill={red} />
      <path d={m.body} fill={red} />
      <path d={m.head} fill={red} />
      <path d={m.wattle} fill={red} />
      <path d={m.beak} fill={mono ? "currentColor" : L.rice} />
      {!mono && <path d={m.eye} fill={L.cream} />}
    </svg>
  );
}

/** « MAILY » en lettres rondes (tracé monoligne aux bouts arrondis), flamme sur le I. */
export function Wordmark({ className = "w-32", color = L.red, flame = L.rice }: { className?: string; color?: string; flame?: string }) {
  return (
    <svg viewBox={L.wordViewBox} className={className} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
        {L.word.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={L.flame} fill={flame} />
    </svg>
  );
}

/** Logo complet : le coq, « MAILY », et « RÔTISSERIE VIETNAMIENNE » en petit. */
export function Logo({ className = "", tone = "color", sub = true, size = "md" }: { className?: string; tone?: "color" | "cream"; sub?: boolean; size?: "md" | "lg" }) {
  const cream = tone === "cream";
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center ${lg ? "gap-4" : "gap-2.5"} ${className}`}>
      <Mark className={`${lg ? "h-24" : "h-11 md:h-12"} w-auto shrink-0`} mono={cream} />
      <span className={`flex flex-col ${lg ? "gap-2.5" : "gap-1.5"}`}>
        <Wordmark className={lg ? "w-48" : "w-[5.4rem] md:w-[6.2rem]"} color={cream ? L.cream : L.red} />
        {sub && <span className={`${lg ? "text-[0.8rem]" : "text-[0.5rem] md:text-[0.5625rem]"} leading-none font-semibold tracking-[0.2em] whitespace-nowrap ${cream ? "text-cream/85" : "text-ink"}`}>RÔTISSERIE VIETNAMIENNE</span>}
      </span>
    </span>
  );
}
