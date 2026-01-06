"use client"

import { useState } from "react"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { DrawingGallery } from "@/components/drawing-gallery"
import { Button } from "@/components/ui/button"
import { Paintbrush, Grid3x3 } from "lucide-react"

export default function HomePage() {
  const [view, setView] = useState<"canvas" | "gallery">("canvas")
  const [refreshGallery, setRefreshGallery] = useState(0)

  const handleSaveComplete = () => {
    setRefreshGallery((prev) => prev + 1)
    setView("gallery")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            DrawBoard
          </h1>
          <div className="flex gap-2">
            <Button
              variant={view === "canvas" ? "default" : "outline"}
              onClick={() => setView("canvas")}
              className="gap-2"
            >
              <Paintbrush className="w-4 h-4" />
              그리기
            </Button>
            <Button
              variant={view === "gallery" ? "default" : "outline"}
              onClick={() => setView("gallery")}
              className="gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              갤러리
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {view === "canvas" ? (
          <DrawingCanvas onSaveComplete={handleSaveComplete} />
        ) : (
          <DrawingGallery key={refreshGallery} />
        )}
      </main>
    </div>
  )
}
