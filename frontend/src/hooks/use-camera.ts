"use client"

import { useRef, useCallback, useState, useEffect } from "react"

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Assign stream to video when it mounts (video only renders when isActive is true)
  useEffect(() => {
    if (!isActive || !streamRef.current) return
    const video = videoRef.current
    if (!video) return
    video.srcObject = streamRef.current
    video.play().catch(console.warn)
  }, [isActive])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      streamRef.current = stream
      setIsActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera access denied")
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setError(null)
  }, [])

  return { videoRef, isActive, error, startCamera, stopCamera }
}
