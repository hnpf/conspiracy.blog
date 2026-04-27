'use client'

import React from 'react'
import { motion } from 'motion/react'
import { BlogPost } from '@/lib/blog-data'
import Magnetic from './Magnetic'

interface PostCardProps {
  post: BlogPost
  onClick: () => void
}

const hoverTransition = { type: 'spring', stiffness: 600, damping: 25 } as const

export default function PostCard({ post, onClick }: PostCardProps) {
  return (
    <Magnetic strength={0.08} className="h-full">
      <motion.div
        variants={{
          hover: { y: -12, scale: 1.02, transition: hoverTransition }
        }}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        onClick={onClick}
        className="cursor-pointer group h-full"
      >
        <div className="bg-md-surface-variant/50 hover:bg-md-surface-variant rounded-[40px] p-10 border border-md-outline/10 shadow-md-1 hover:shadow-md-4 h-full relative overflow-hidden flex flex-col transition-[background-color,box-shadow] duration-300">
          <div className="relative z-10 flex flex-col h-full gap-8">

            <div className="flex justify-between items-center">
              <span className="px-6 py-2 bg-md-primary/10 text-md-primary rounded-full text-[14px] font-extrabold tracking-[0.15em] border border-md-primary/15">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-md-on-surface-variant/70">
                <motion.div
                  variants={{
                    hover: { scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 2 } }
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-md-primary"
                />
                <span className="text-[12px] font-bold tracking-tight">{post.readTime}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-3xl font-black text-md-on-surface leading-tight group-hover:text-md-primary transition-colors duration-200 tracking-tight">
                {post.title}
              </h3>
              <p className="text-sm text-md-on-surface-variant/80 line-clamp-3 leading-relaxed font-semibold">
                {post.snippet}
              </p>
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center border-t border-md-outline/10">
              <span className="text-[11px] text-md-on-surface-variant/40 font-black tracking-[0.2em] uppercase">
                {post.date}
              </span>
              <div className="flex items-center gap-3 text-md-primary font-black text-xs">
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-3 group-hover:translate-y-1 group-hover:translate-x-0 font-bold tracking-widest text-[14px]">
                  go to post
                </span>
                <motion.div
                  variants={{
                    hover: { x: [0, 8, 0], transition: { repeat: Infinity, duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="text-2xl"
                >
                  →
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </Magnetic>
  )
}