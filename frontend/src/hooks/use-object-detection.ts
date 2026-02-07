"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import type { Language } from "@/lib/translations"

export type AppMode = "nav" | "read" | "money" | "hazard" | "scene";

// --- SMART CONFIGURATION PER MODE ---
// Hazard: Scans every 3s, ignores motion (safety first)
// Money: Scans every 4s, ignores motion (precision)
// Read: Scans every 7s, high quality for OCR
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

  // --- MOTION DETECTION ---
  const hasMotion = useCallback((video: HTMLVideoElement) => {
    const settings = MODE_SETTINGS[mode];
    // Hazard and Money modes don't care about motion—they always scan
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

  // --- API CALL ---
  const runAnalysis = async () => {

    if (!videoRef.current || !isActive || isAnalyzingRef.current) return
    
    // Check if we should skip based on motion
    if (!hasMotion(videoRef.current)) {
        console.log("Skipping scan: No motion.");
        return;
    }

    isAnalyzingRef.current = true
    setIsProcessing(true) 

    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
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

     const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Error handling if variable is missing
  if (!API_URL) {
    console.error("Missing NEXT_PUBLIC_API_URL in .env.local");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData,
    });
        const data = await response.json()
        
        if (data.analysis) {
          setAnalysis(data.analysis)
          setLastError(null)
        } else if (data.error) {
          if (data.error.includes("429") || data.error.includes("quota")) {
            setLastError("API Busy. Please wait...")
          } else {
            setLastError(data.error)
          }
        }
      } catch (err) {
        setLastError("Server not reachable.")
      } finally {
        isAnalyzingRef.current = false
        setIsProcessing(false)
      }
    }, "image/jpeg", MODE_SETTINGS[mode].quality)
  }

  // --- INTERVAL ENGINE ---
  useEffect(() => {
    if (isActive) {
      runAnalysis() // Run immediately on start

      const currentInterval = MODE_SETTINGS[mode].interval;
      intervalRef.current = setInterval(runAnalysis, currentInterval)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setAnalysis("")
      setIsProcessing(false)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, lang, mode]) 

  return { analysis, lastError, isProcessing }
}