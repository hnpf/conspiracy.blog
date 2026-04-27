'use client'

import React, { useRef, ReactNode } from 'react'
import { motion, useSpring, useMotionValue } from 'motion/react'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

const springConfig = { stiffness: 60, damping: 20, mass: 0.5 }

export default function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    x.set((e.clientX - (left + width / 2)) * strength)
    y.set((e.clientY - (top + height / 2)) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}