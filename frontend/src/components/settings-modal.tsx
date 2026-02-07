"use client"

import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"

type Props = {
  isOpen: boolean
  onClose: () => void
  lang: Language
  onLanguageChange: (newLang: Language) => void
}

export function SettingsModal({ isOpen, onClose, lang, onLanguageChange }: Props) {
  if (!isOpen) return null

  const t = translations[lang]

  // Define your languages here
  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "ur", label: "اردو" },
    { code: "hi", label: "हिंदी" },
    { code: "ar", label: "العربية" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border-2 border-primary bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">{t.settings}</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-primary/10 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t.language}</p>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onLanguageChange(l.code)}
                className={`rounded-2xl border-2 px-4 py-4 text-lg font-bold transition-all ${
                  lang === l.code
                    ? "border-primary bg-primary text-primary-foreground scale-105 shadow-lg"
                    : "border-primary/20 bg-background text-foreground hover:border-primary"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}