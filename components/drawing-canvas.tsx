"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Save, Trash2, Pencil, Eraser } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DrawingCanvasProps {
  onSaveComplete?: () => void
}

export function DrawingCanvas({ onSaveComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"pen" | "eraser">("pen")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === "eraser" ? "white" : color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)

    try {
      const imageData = canvas.toDataURL("image/png")

      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast({
        title: "저장 완료!",
        description: "그림이 성공적으로 저장되었습니다.",
      })

      clearCanvas()
      onSaveComplete?.()
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "그림을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#FFC0CB",
    "#A52A2A",
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 p-6">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border border-border rounded-lg cursor-crosshair w-full shadow-lg"
          style={{ maxWidth: "800px", maxHeight: "600px" }}
        />
      </Card>

      <Card className="lg:w-64 p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">도구</h3>
          <div className="flex gap-2">
            <Button
              variant={tool === "pen" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("pen")}
              className="flex-1"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("eraser")}
              className="flex-1"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
            브러시 크기: {brushSize}px
          </h3>
          <Slider value={[brushSize]} onValueChange={(value) => setBrushSize(value[0])} min={1} max={50} step={1} />
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">색상</h3>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                  color === c ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-2 border-t">
          <Button onClick={saveDrawing} disabled={isSaving} className="w-full gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
          <Button onClick={clearCanvas} variant="outline" className="w-full gap-2 bg-transparent">
            <Trash2 className="w-4 h-4" />
            초기화
          </Button>
        </div>
      </Card>
    </div>
  )
}
