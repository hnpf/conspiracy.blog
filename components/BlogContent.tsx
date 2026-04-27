'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { BlogPost } from '@/lib/blog-data'
import CopyLinkCapsule from './CopyLinkCapsule'
import Image from 'next/image'
import { motion } from 'motion/react'

interface BlogContentProps {
  post: BlogPost
  onBack: () => void
}

export default function BlogContent({ post, onBack }: BlogContentProps) {
  const [imgSrc, setImgSrc] = React.useState('/pfp/cat.png')

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto w-full pb-20 px-1"
    >
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-md-secondary-container text-md-on-secondary-container rounded-full text-[14px] font-bold tracking-widest">
              {post.category}
            </span>
            <span className="text-xs text-md-on-surface-variant font-bold opacity-60">
              {post.date} • {post.readTime}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-md-on-surface tracking-tight leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="flex items-center justify-between gap-4 py-4 border-y border-md-outline/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-md-primary/20">
              <Image
                src={imgSrc}
                alt="conspiracy"
                fill
                className="object-cover"
                onError={() => setImgSrc('/pfp/fallback.png')}
              />
            </div>
            <div>
              <p className="text-[16px] font-bold text-md-on-surface">conspiracy</p>
              <p className="text-[13px] text-md-on-surface-variant font-black">author</p>
            </div>
          </div>
        </div>
      </div>

      <div className="markdown-body prose dark:prose-invert max-w-none prose-headings:text-md-on-surface prose-p:text-md-on-surface-variant">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-24 p-12 rounded-[48px] bg-md-surface-variant/30 border border-white/5 text-center flex flex-col items-center gap-8 shadow-inner">
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-black text-md-on-surface tracking-tight">enjoyed this post?</h3>
          <p className="max-w-md opacity-70 text-base font-bold leading-relaxed tracking-tight">
            i write about ..
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <p className="text-[15px] font-black tracking-[0.1em] text-md-primary opacity-60">share the post!</p>
          <CopyLinkCapsule />
        </div>
      </div>
    </motion.article>
  )
}