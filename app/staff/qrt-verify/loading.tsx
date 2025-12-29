export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-spin"
            style={{ maskImage: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))" }}
          ></div>
        </div>
        <p className="text-foreground font-medium">Loading...</p>
      </div>
    </div>
  )
}
