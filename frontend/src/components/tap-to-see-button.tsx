"use client"

import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"

type Props = {
  lang: Language
  onHoldStart: () => void
  onHoldEnd: () => void
  isHolding: boolean
}

export function TapToSeeButton({ lang, onHoldStart, onHoldEnd, isHolding }: Props) {
  const t = translations[lang]
  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 p-8"
      role="region"
      aria-label={t.tapToSee}
    >
      <button
        type="button"
        onMouseDown={onHoldStart}
        onMouseUp={onHoldEnd}
        onMouseLeave={onHoldEnd}
        onTouchStart={onHoldStart}
        onTouchEnd={onHoldEnd}
        onTouchCancel={onHoldEnd}
        className={`flex h-48 w-48 md:h-56 md:w-56 flex-shrink-0 items-center justify-center rounded-full border-4 border-primary bg-primary/10 transition-all focus:outline-none focus:ring-4 focus:ring-ring active:scale-95 ${
          isHolding ? "scale-95 bg-primary/20" : "animate-glow-pulse hover:bg-primary/15"
        }`}
        aria-label={isHolding ? t.releaseToHide : t.holdToSee}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <p
        className="max-w-sm text-center text-2xl font-bold text-foreground md:text-3xl"
        dir={lang === "ur" ? "rtl" : "ltr"}
      >
        {t.holdToSee}
      </p>
    </div>
  )
}
