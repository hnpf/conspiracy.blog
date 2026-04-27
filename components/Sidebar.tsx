'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Github, MessageCircle, ExternalLink, ScrollText } from 'lucide-react';
import { BlogPosts } from '@/lib/blog-data';
import Image from 'next/image';
import Magnetic from './Magnetic';

interface SidebarProps {
  onPostSelect?: (postId: string) => void;
  activePostId?: string;
  context?: string;
  className?: string;
}

export default function Sidebar({
  onPostSelect,
  activePostId,
  context = 'desktop',
  className = '',
}: SidebarProps) {
  const featured = BlogPosts.filter(p => p.highlighted);
  const [pfp, setPfp] = React.useState('/pfp/cat.png');

  return (
    <aside className={`w-full lg:w-96 lg:h-[calc(100vh-4.5rem)] sticky top-6 self-start ${className}`}>
      <div className="h-full flex flex-col bg-md-surface-variant/40 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden shadow-md-2 p-8 gap-10">

        <Magnetic strength={0.15}>
          <div className="bg-white/5 p-6 rounded-t-[30px] rounded-b-[20px] flex items-center gap-4 border border-white/5 shadow-inner group shrink-0 cursor-pointer">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-md-primary/30 p-1 shadow-md flex-shrink-0 transition-transform duration-500 group-hover:scale-105">
              <Image
                src={pfp}
                alt="conspiracy"
                fill
                className="object-cover rounded-full"
                onError={() => setPfp('')}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-xl font-black text-md-on-surface tracking-tight leading-none truncate">cons</h2>
              <p className="text-[13px] text-md-on-surface-variant font-bold tracking-widest opacity-60">@kittyconspiracy</p>
            </div>
          </div>
        </Magnetic>

        <div className="flex-1 flex flex-col gap-8 min-h-0">
          <div className="flex items-center gap-3 px-2 text-md-primary shrink-0">
            <ScrollText size={24} strokeWidth={2.5} />
            <span className="text-2xl font-black tracking-[0.1em] text-md-primary">featured</span>
          </div>

          <nav className="flex-1 grid grid-cols-2 lg:flex lg:flex-col gap-5 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-md-primary/20 hover:scrollbar-thumb-md-primary/40 transition-colors">
            {featured.map(post => (
              <motion.button
                key={`${context}-h-item-${post.id}`}
                onClick={() => onPostSelect?.(post.id)}
                whileHover={{
                  x: context === 'desktop' ? 8 : 0,
                  y: context === 'mobile' ? -4 : 0,
                  backgroundColor: activePostId === post.id ? undefined : 'rgba(255,255,255,0.12)',
                  transition: { type: 'spring', stiffness: 600, damping: 25 },
                }}
                whileTap={{ scale: 0.97 }}
                className={`w-full text-center p-6 first:rounded-[30px] first:rounded-b-[20px] rounded-[20px] last:rounded-b-[30px] group relative  shrink-0 transition-[border-color,box-shadow] duration-200 opacity-80 ${
                  activePostId === post.id
                    ? 'border-transparent text-md-on-primary shadow-md-2'
                    : 'bg-white/5 border-white/5 text-md-on-surface hover:border-white/20'
                }`}
              >
                {activePostId === post.id && (
                  <motion.div
                    layoutId={`${context}-active-pill`}
                    className="absolute inset-0 bg-md-primary rounded-[28px]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col gap-2">
                  <div className={`text-xs font-black uppercase tracking-[0.15em] ${activePostId === post.id ? 'text-md-on-primary/70' : 'text-md-primary'}`}>
                    {post.date}
                  </div>
                  <h3 className="text-base font-bold leading-snug line-clamp-2 tracking-tight">
                    {post.title}
                  </h3>
                </div>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <a
            href="https://conspiracy.rip"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-md-primary text-md-on-primary py-5 rounded-[25px] flex items-center justify-center gap-2 font-bold shadow-md-2 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            <ExternalLink size={20} />
            <span>conspiracy.rip</span>
          </a>

          <div className="flex gap-3">
            <a
              href="https://conspiracy.rip/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-md-secondary-container text-md-on-secondary-container py-5 rounded-[20px] flex items-center justify-center gap-2 font-bold hover:bg-md-secondary-container/80 transition-colors"
            >
              <MessageCircle size={20} />
              <span>discord</span>
            </a>
            <a
              href="https://github.com/conspiracyrip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-md-secondary-container text-md-on-secondary-container py-5 rounded-[20px] flex items-center justify-center gap-2 font-bold hover:bg-md-secondary-container/80 transition-colors"
            >
              <Github size={20} />
              <span>guthib</span>
            </a>
          </div>
        </div>

      </div>
    </aside>
  );
}