const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function analyzeFrame(
  video: HTMLVideoElement,
  lang: string
): Promise<{ analysis?: string; error?: string }> {
  if (!video.videoWidth || !video.videoHeight) {
    return { error: "Video not ready" }
  }

  const canvas = document.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) return { error: "Could not get canvas context" }

  ctx.drawImage(video, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.8)
  )
  if (!blob) return { error: "Could not capture frame" }

  const formData = new FormData()
  formData.append("file", blob, "frame.jpg")
  formData.append("lang", lang)
  

  let res: Response
  try {
    res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: msg || "Failed to connect to server" }
  }

  let data: { analysis?: string; error?: string; detail?: string } = {}
  try {
    const text = await res.text()
    data = text ? JSON.parse(text) : {}
  } catch {
    return { error: "Invalid response from server" }
  }
  if (!res.ok) return { error: data.detail || "Request failed" }
  if (data.error) return { error: data.error }
  return { analysis: data.analysis }
}
