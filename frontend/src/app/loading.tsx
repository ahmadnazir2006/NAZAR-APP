export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#1a5f4a] border-t-transparent" />
        <p className="text-lg font-medium text-white/80">Loading Nazar...</p>
      </div>
    </div>
  )
}
