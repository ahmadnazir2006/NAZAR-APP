"use client"

import { useState, useCallback, useEffect } from "react"
import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"
import { useCamera } from "@/hooks/use-camera"
import { useObjectDetection, AppMode } from "@/hooks/use-object-detection"
import { TapToSeeButton } from "@/components/tap-to-see-button"
import { CameraPreview } from "@/components/camera-preview"
import { SettingsModal } from "@/components/settings-modal"

export default function Page() {
  const [lang, setLang] = useState<Language>("en")
  const [mode, setMode] = useState<AppMode>("nav") 
  const [isHolding, setIsHolding] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const { videoRef, isActive, error, startCamera, stopCamera } = useCamera()
  
  const { lastError: apiError, analysis, isProcessing } = useObjectDetection(videoRef, isActive, lang, mode)
  
  const t = translations[lang]

  const speak = (text: string, forceLang?: string) => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    const ttsLangs: Record<string, string> = {
      en: "en-US", ur: "ur-PK", hi: "hi-IN", ar: "ar-SA"
    }
    utterance.lang = forceLang || ttsLangs[lang] || "en-US"
    window.speechSynthesis.speak(utterance)
  }

  // --- NEW: ACTUAL EXIT LOGIC ---
  const handleExit = () => {
    // 1. Stop the Camera
    stopCamera();
    
    // 2. Stop any speaking
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }

    // 3. Redirect to your landing page or a blank state
    // window.location.href = "/" will reload the app to its fresh state
    window.location.href = "/"; 
  }

  const cycleMode = () => {
    const modes: AppMode[] = ["nav", "read", "money", "hazard", "scene"]
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length]
    setMode(nextMode)

    const modeDesc = translations[lang][`${nextMode}Mode` as keyof typeof t] as string
    speak(modeDesc)

    if (window.navigator.vibrate) {
        window.navigator.vibrate(nextMode === "hazard" ? [100, 50, 100] : 50)
    }
  }

  useEffect(() => {
    if (analysis && isActive) {
      speak(analysis)
      if (analysis.toLowerCase().includes("danger") || analysis.includes("خطرہ")) {
        window.navigator.vibrate([500, 200, 500])
      }
    }
  }, [analysis, isActive])

  const handleHoldStart = useCallback(() => {
    setIsHolding(true)
    startCamera()
    speak(lang === "ur" ? "کیمرہ آن ہو رہا ہے" : "Camera activating")
  }, [startCamera, lang])

  const handleHoldEnd = useCallback(() => {
    setIsHolding(false)
    stopCamera()
  }, [stopCamera])

  return (
    <main className="fixed inset-0 overflow-hidden bg-background select-none">
      
      {/* Top Smart Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3">
        {/* UPDATED EXIT BUTTON */}
        <button 
          onClick={handleExit}
          className="w-14 h-14 rounded-full border-2 border-primary/40 bg-background/80 flex items-center justify-center text-primary active:scale-90 transition-transform"
          aria-label="Exit"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>

        <button 
          onClick={cycleMode}
          className="flex-1 h-14 rounded-2xl border-b-4 border-primary bg-primary text-primary-foreground font-black text-lg shadow-lg active:border-b-0 active:translate-y-1 transition-all uppercase"
        >
          {mode} MODE
        </button>

        <button 
          onClick={() => setSettingsOpen(true)} 
          className="w-14 h-14 rounded-full border-2 border-primary/40 bg-background/80 flex items-center justify-center text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>
        </button>
      </div>

      <CameraPreview videoRef={videoRef} isActive={isActive} error={error} lang={lang} apiError={apiError} />

      {/* Visual Feedback - Added z-index check */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none bg-background/20 backdrop-blur-[2px]">
          <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-2xl"></div>
          <div className="mt-6 bg-primary/90 text-white px-6 py-2 rounded-full font-bold animate-pulse">
            NAZAR IS THINKING...
          </div>
        </div>
      )}

      {!isActive && !error && (
        <TapToSeeButton lang={lang} onHoldStart={handleHoldStart} onHoldEnd={handleHoldEnd} isHolding={isHolding} />
      )}

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        lang={lang} 
        onLanguageChange={(newLang) => { 
          setLang(newLang);
          setSettingsOpen(false);
          speak(translations[newLang].language + " set", newLang === "ur" ? "ur-PK" : "en-US");
        }} 
      />
    </main>
  )
}
