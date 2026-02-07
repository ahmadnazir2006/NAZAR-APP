"use client"

import type { RefObject } from "react"
import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  isActive: boolean
  error: string | null
  lang: Language
  apiError?: string | null
}

export function CameraPreview({ videoRef, isActive, error, lang, apiError }: Props) {
  const t = translations[lang]

  if (!isActive && !error) return null

  return (
    <div className="fixed inset-0 z-10 bg-background">
      {error ? (
        <div
          className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center"
          role="alert"
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
            aria-hidden
          >
            <path d="M12 9v2" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
          </svg>
          <p className="text-xl font-semibold text-foreground md:text-2xl" dir={lang === "ur" ? "rtl" : "ltr"}>
            {t.cameraError}
          </p>
          <p className="text-base text-muted-foreground" dir={lang === "ur" ? "rtl" : "ltr"}>
            {t.allowCamera}
          </p>
        </div>
      ) : (
        <>
        {apiError && !apiError.includes("Video not ready") && (
          <div className="absolute bottom-4 left-4 right-4 z-20 rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white">
            {apiError.toLowerCase().includes("fetch") || apiError.includes("Failed") || apiError.includes("Invalid") || apiError.includes("connect")
              ? "Cannot reach server. Run: python main.py (in project folder)"
              : apiError}
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover mirror"
          aria-hidden
        />
        </>
      )}
    </div>
  )
}
