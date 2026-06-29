'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link2, Check } from 'lucide-react'

export default function CopyLinkCapsule() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable, silently ignore
    }
  }

  return (
    <motion.button
      onClick={handleCopy}
      initial={false}
      animate={{
        backgroundColor: copied ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface)',
        scale: copied ? [1, 1.2, 0.95, 1.05, 1] : 1,
      }}
      transition={{
        backgroundColor: { duration: 0.3 },
        scale: { duration: 1, times: [0, 0.2, 0.4, 0.7, 1] },
      }}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border border-md-outline/30 shadow-md-1 ${
        copied ? 'text-md-on-primary-container' : 'text-md-on-surface'
      }`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            <Check size={18} />
          </motion.div>
        ) : (
          <motion.div
            key="link"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link2 size={18} />
          </motion.div>
        )}
      </AnimatePresence>

      <span className="min-w-[80px]">
        {copied ? 'link copied!' : 'copy link'}
      </span>
    </motion.button>
  )
}