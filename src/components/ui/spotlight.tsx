'use client'

import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({
  className = "",
  fill = "white"
}: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  // For touch devices, show a static spotlight
  useEffect(() => {
    const div = divRef.current
    if (!div) return

    const rect = div.getBoundingClientRect()
    if (window.matchMedia('(pointer: coarse)').matches) {
      setPosition({
        x: rect.width / 2,
        y: rect.height / 2,
      })
      setOpacity(0.8)
    }
  }, [])

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        className
      )}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity,
          transition: "opacity 400ms ease",
        }}
      >
        <div
          className="pointer-events-none absolute -inset-40 z-10 opacity-20"
          style={{
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill}, transparent 40%)`,
          }}
        />
      </div>
    </div>
  )
}
