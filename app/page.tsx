'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Sidebar from '@/components/Sidebar'
import PostCard from '@/components/PostCard'
import BlogContent from '@/components/BlogContent'
import CommandPalette from '@/components/CommandPalette'
import { BlogPosts } from '@/lib/blog-data'
import { Menu, X, ArrowUp, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const categoryColors: Record<string, string> = {
  Design: '#D0BCFF',
  Tech: '#A0C9FF',
  Development: '#B8EBD0',
  UX: '#FFB4AB',
  default: '#D0BCFF',
}

const SCROLL_THRESHOLD = 400

const springTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as const

export default function BlogPage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const selectedPost = BlogPosts.find(p => p.id === selectedPostId)
  const accentColor = selectedPost
    ? (categoryColors[selectedPost.category] ?? categoryColors.default)
    : categoryColors.default

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handlePostClick = (id: string) => {
    setSelectedPostId(id)
    setIsMobileMenuOpen(false)
    scrollTop()
  }

  const handleBack = () => {
    setSelectedPostId(null)
    scrollTop()
  }

  return (
    <div
      className="min-h-screen bg-md-surface selection:bg-md-primary/30 transition-colors duration-1000 overflow-x-clip"
      style={{ '--md-sys-color-primary': accentColor } as React.CSSProperties}
    >
      <CommandPalette onSelect={handlePostClick} />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollTop}
            className="fixed bottom-10 right-10 z-[60] w-16 h-16 bg-md-primary text-md-on-primary rounded-full shadow-md-3 flex items-center justify-center border-4 border-md-surface-variant transition-colors"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <header className="lg:hidden sticky top-0 z-50 bg-md-surface/80 backdrop-blur-xl border-b border-md-outline/5 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedPostId ? (
            <button
              onClick={handleBack}
              className="w-12 h-12 rounded-2xl bg-md-primary/10 text-md-primary flex items-center justify-center transition-all hover:bg-md-primary hover:text-md-on-primary"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
          ) : (
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-md-primary/20 shadow-md-1">
              <Image 
                src="/pfp/cat.png" 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          <span className="font-black text-2xl tracking-tighter">
            conspiracy<span className="text-md-primary">.</span>blog
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className="p-3 rounded-2xl bg-md-surface-variant text-md-on-surface-variant hover:bg-md-primary hover:text-md-on-primary transition-all shadow-sm"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed inset-0 z-[60] p-6 flex flex-col pt-32 pointer-events-none"
            >
              <div 
                className="pointer-events-auto h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar onPostSelect={handlePostClick} activePostId={selectedPostId ?? undefined} context="mobile" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row p-6 lg:p-10 gap-20">
        <Sidebar
          onPostSelect={handlePostClick}
          activePostId={selectedPostId ?? undefined}
          context="desktop"
          className="hidden lg:block shrink-0 lg:-ml-16"
        />

        <main className="flex-1 w-full lg:max-w-5xl">
          <AnimatePresence mode="wait" initial={false}>
            {selectedPost ? (
              <motion.div
                key={`post-${selectedPost.id}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={springTransition}
              >
                <div className="mb-14">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    whileHover={{ scale: 1.05, x: -8 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    onClick={handleBack}
                    className="flex items-center gap-4 bg-md-primary text-md-on-primary pl-6 pr-10 py-4 rounded-full shadow-md-2 border-4 border-md-surface-variant group relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <ArrowLeft size={24} strokeWidth={3} />
                    </motion.div>
                    <span className="font-black tracking-[0.1em] text-[19px]">back home</span>
                  </motion.button>
                </div>
                <BlogContent post={selectedPost} onBack={handleBack} />
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-20"
              >
                <header className="flex flex-col gap-6 pt-4 lg:pt-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h1 className="text-6xl md:text-9xl font-black text-md-on-surface tracking-tighter leading-[0.85] mb-6">
                      conspiracy<span className="text-md-primary">.</span>blog
                    </h1>
                    <p className="text-2xl md:text-3xl text-md-on-surface-variant font-bold max-w-3xl leading-snug opacity-80 tracking-tight">
                      kitty kitty anc
                    </p>
                  </motion.div>
                </header>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32"
                >
                  {BlogPosts.map((post, idx) => (
                    <motion.div
                      key={post.id ?? idx}
                      className="h-full"
                      variants={{
                        hidden: { opacity: 0, y: 40, scale: 0.98 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={springTransition}
                    >
                      <PostCard post={post} onClick={() => handlePostClick(post.id)} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}