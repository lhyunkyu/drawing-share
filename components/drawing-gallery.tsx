"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Drawing {
  _id: string
  imageData: string
  createdAt: string
}

export function DrawingGallery() {
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDrawings = async () => {
    try {
      const response = await fetch("/api/drawings")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setDrawings(data)
    } catch (error) {
      toast({
        title: "불러오기 실패",
        description: "그림을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrawings()
  }, [])

  const deleteDrawing = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/drawings/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setDrawings(drawings.filter((d) => d._id !== id))
      toast({
        title: "삭제 완료!",
        description: "그림이 삭제되었습니다.",
      })
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "그림을 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (drawings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">아직 저장된 그림이 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-2">그리기 탭에서 그림을 그리고 저장해보세요!</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drawings.map((drawing) => (
        <Card key={drawing._id} className="overflow-hidden group">
          <div className="relative aspect-[4/3]">
            <img src={drawing.imageData || "/placeholder.svg"} alt="Drawing" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="destructive"
                onClick={() => deleteDrawing(drawing._id)}
                disabled={deletingId === drawing._id}
              >
                {deletingId === drawing._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">{new Date(drawing.createdAt).toLocaleString("ko-KR")}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
