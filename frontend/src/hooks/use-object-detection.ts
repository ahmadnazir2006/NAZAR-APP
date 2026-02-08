"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { Language } from "@/lib/translations"

export type AppMode = "nav" | "read" | "money" | "hazard" | "scene";

const MODE_SETTINGS = {
  nav:    { interval: 5000, motion: 0.05, quality: 0.6 },
  read:   { interval: 7000, motion: 0.02, quality: 0.8 }, 
  money:  { interval: 4000, motion: 0.00, quality: 0.7 }, 
  hazard: { interval: 3000, motion: 0.00, quality: 0.5 }, 
  scene:  { interval: 8000, motion: 0.08, quality: 0.6 }
};

export function useObjectDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean,
  lang: Language,
  mode: AppMode
) {
  const [analysis, setAnalysis] = useState<string>("")
  const [lastError, setLastError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false) 
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isAnalyzingRef = useRef(false)
  const prevImageDataRef = useRef<ImageData | null>(null)

  const hasMotion = useCallback((video: HTMLVideoElement) => {
    const settings = MODE_SETTINGS[mode];
    if (settings.motion === 0) return true; 

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return true

    canvas.width = 64; canvas.height = 64;
    ctx.drawImage(video, 0, 0, 64, 64)
    const currentData = ctx.getImageData(0, 0, 64, 64)

    if (!prevImageDataRef.current) {
      prevImageDataRef.current = currentData
      return true
    }

    let diffPixels = 0
    const prevData = prevImageDataRef.current.data
    const currData = currentData.data

    for (let i = 0; i < currData.length; i += 4) {
      const brightnessPrev = (prevData[i] + prevData[i+1] + prevData[i+2]) / 3
      const brightnessCurr = (currData[i] + currData[i+1] + currData[i+2]) / 3
      if (Math.abs(brightnessPrev - brightnessCurr) > 35) diffPixels++
    }

    prevImageDataRef.current = currentData
    return (diffPixels / (64 * 64)) > settings.motion
  }, [mode])

  const runAnalysis = async () => {
    // 1. Safety Checks
    if (!videoRef.current || !isActive || isAnalyzingRef.current) return
    
    if (!hasMotion(videoRef.current)) {
        console.log("Skipping scan: No motion.");
        return;
    }

    // 2. Variable Check (BEFORE setting processing states)
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      setLastError("Configuration Error: API URL missing.");
      return;
    }

    // Fix possible double-slash 404 error
    const cleanBaseUrl = API_URL.replace(/\/$/, "");

    // 3. Start Processing
    isAnalyzingRef.current = true
    setIsProcessing(true) 

    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    
    if (!ctx) {
      isAnalyzingRef.current = false;
      setIsProcessing(false);
      return;
    }

    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        isAnalyzingRef.current = false;
        setIsProcessing(false);
        return;
      }

      const formData = new FormData()
      formData.append("file", blob, "frame.jpg")
      formData.append("lang", lang)
      formData.append("mode", mode)

      try {
        const response = await fetch(`${cleanBaseUrl}/analyze`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
           throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json()
        
        if (data.analysis) {
          setAnalysis(data.analysis)
          setLastError(null)
        } else if (data.error) {
          setLastError(data.error)
        }
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setLastError(err.message || "Server not reachable.");
      } finally {
        // ALWAYS reset these, even if the request fails
        // This is what prevents the Exit button from freezing
        isAnalyzingRef.current = false
        setIsProcessing(false)
      }
    }, "image/jpeg", MODE_SETTINGS[mode].quality)
  }

  useEffect(() => {
    if (isActive) {
      runAnalysis() 
      const currentInterval = MODE_SETTINGS[mode].interval;
      intervalRef.current = setInterval(runAnalysis, currentInterval)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setAnalysis("")
      setIsProcessing(false)
      isAnalyzingRef.current = false
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, lang, mode]) 

  return { analysis, lastError, isProcessing }
}
