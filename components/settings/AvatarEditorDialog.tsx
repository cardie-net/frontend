"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  Upload, Image as ImageIcon } from "lucide-react"

interface AvatarEditorDialogProps {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
  onSave: (blob: Blob) => Promise<void>
  isUploading: boolean
}

export function AvatarEditorDialog({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  isUploading,
}: AvatarEditorDialogProps) {
  const t = useTranslations("Settings.avatarEditor")
  const tCommon = useTranslations("Common")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Transform states
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Dragging states
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const CANVAS_SIZE = 320 // Viewport size in px

  // Reset transforms when a new image is loaded
  useEffect(() => {
    if (!imageSrc) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageSrc
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      setZoom(1)
      setRotation(0)
      setFlipX(false)
      setFlipY(false)
      setPan({ x: 0, y: 0 })
    }
  }, [imageSrc])

  // Helper to calculate pan bounds to prevent empty white space inside crop box
  const getClampedPan = useCallback(
    (
      currentPan: { x: number; y: number },
      currentZoom: number,
      currentRot: number
    ) => {
      const img = imageRef.current
      if (!img) return currentPan

      const nw = img.naturalWidth
      const nh = img.naturalHeight
      const baseScale = Math.max(CANVAS_SIZE / nw, CANVAS_SIZE / nh)
      const currentScale = baseScale * currentZoom

      const drawW = nw * currentScale
      const drawH = nh * currentScale

      const rad = (currentRot * Math.PI) / 180
      const boundW =
        Math.abs(drawW * Math.cos(rad)) + Math.abs(drawH * Math.sin(rad))
      const boundH =
        Math.abs(drawW * Math.sin(rad)) + Math.abs(drawH * Math.cos(rad))

      const maxPanX = Math.max(0, (boundW - CANVAS_SIZE) / 2)
      const maxPanY = Math.max(0, (boundH - CANVAS_SIZE) / 2)

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, currentPan.x)),
        y: Math.max(-maxPanY, Math.min(maxPanY, currentPan.y)),
      }
    },
    [CANVAS_SIZE]
  )

  // Draw the preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(dpr, dpr)

    const centerX = CANVAS_SIZE / 2
    const centerY = CANVAS_SIZE / 2
    ctx.translate(centerX, centerY)

    const clampedPan = getClampedPan(pan, zoom, rotation)
    ctx.translate(clampedPan.x, clampedPan.y)

    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const baseScale = Math.max(CANVAS_SIZE / nw, CANVAS_SIZE / nh)
    const currentScale = baseScale * zoom

    const drawW = nw * currentScale
    const drawH = nh * currentScale

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()
  }, [
    CANVAS_SIZE,
    flipX,
    flipY,
    getClampedPan,
    imageLoaded,
    pan,
    rotation,
    zoom,
  ])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStartRef.current = { x: clientX, y: clientY }
    panStartRef.current = { ...pan }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    const dx = clientX - dragStartRef.current.x
    const dy = clientY - dragStartRef.current.y

    const newPan = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    }

    setPan(getClampedPan(newPan, zoom, rotation))
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08
    setZoom((prev) => {
      const newZoom = Math.max(1, Math.min(3, prev + zoomDelta))
      setPan((p) => getClampedPan(p, newZoom, rotation))
      return newZoom
    })
  }

  // Transform Actions
  const handleRotateCw = () => {
    const newRot = (rotation + 90) % 360
    setRotation(newRot)
    setPan((p) => getClampedPan(p, zoom, newRot))
  }

  const handleRotateCcw = () => {
    const newRot = (rotation - 90 + 360) % 360
    setRotation(newRot)
    setPan((p) => getClampedPan(p, zoom, newRot))
  }

  const handleFlipHorizontal = () => {
    setFlipX((f) => !f)
  }

  const handleFlipVertical = () => {
    setFlipY((f) => !f)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setFlipX(false)
    setFlipY(false)
    setPan({ x: 0, y: 0 })
  }

  // Save / Export canvas blob
  const handleSave = () => {
    const img = imageRef.current
    if (!img) return

    const EXPORT_SIZE = 512
    const exportCanvas = document.createElement("canvas")
    exportCanvas.width = EXPORT_SIZE
    exportCanvas.height = EXPORT_SIZE

    const ctx = exportCanvas.getContext("2d")
    if (!ctx) return

    ctx.save()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const ratio = EXPORT_SIZE / CANVAS_SIZE
    const centerX = EXPORT_SIZE / 2
    const centerY = EXPORT_SIZE / 2
    ctx.translate(centerX, centerY)

    const clampedPan = getClampedPan(pan, zoom, rotation)
    ctx.translate(clampedPan.x * ratio, clampedPan.y * ratio)

    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const baseScale = Math.max(CANVAS_SIZE / nw, CANVAS_SIZE / nh)
    const currentScale = baseScale * zoom

    const drawW = nw * currentScale * ratio
    const drawH = nh * currentScale * ratio

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
    ctx.restore()

    exportCanvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob)
        }
      },
      "image/jpeg",
      0.92
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isUploading && onClose()}
    >
      <DialogContent className="w-[calc(100vw-1.5rem)] gap-4 p-4 sm:w-full sm:max-w-md sm:gap-6 sm:p-6">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
          <div className="p-2 rounded-2xl bg-primary/10 text-primary">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">{t("title")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {t("description")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* Crop Viewport */}
          <div
            className="relative h-[250px] w-[250px] max-w-full cursor-grab overflow-hidden rounded-2xl border border-border bg-zinc-950/90 shadow-inner select-none active:cursor-grabbing sm:h-[320px] sm:w-[320px]"
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
              }
            }}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              className="h-full w-full object-contain"
              style={{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}
            />

            {/* Crop Overlay Mask */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full rounded-[calc(var(--radius)*2.2)] border-2 border-primary/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="w-full space-y-3 pt-2">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 px-2">
              <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.02}
                value={zoom}
                onChange={(e) => {
                  const newZoom = parseFloat(e.target.value)
                  setZoom(newZoom)
                  setPan((p) => getClampedPan(p, newZoom, rotation))
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRotateCcw}
                title={t("rotateLeft")}
                disabled={isUploading}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRotateCw}
                title={t("rotateRight")}
                disabled={isUploading}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleFlipHorizontal}
                title={t("flipHorizontal")}
                className={flipX ? "bg-muted text-primary" : ""}
                disabled={isUploading}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleFlipVertical}
                title={t("flipVertical")}
                className={flipY ? "bg-muted text-primary" : ""}
                disabled={isUploading}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleReset}
                title={t("resetTransform")}
                disabled={isUploading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !imageLoaded}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 animate-bounce" />
                {tCommon("uploading")}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {t("saveAndApply")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
