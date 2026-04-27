'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Hash, CornerDownLeft, Sparkles } from 'lucide-react';
import { BlogPosts } from '@/lib/blog-data';

interface CommandPaletteProps {
  onSelect: (postId: string) => void;
}

export default function CommandPalette({ onSelect }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredPosts = BlogPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.category.toLowerCase().includes(query.toLowerCase())
  );

  const togglePalette = useCallback(() => setIsOpen(prev => !prev), []);

  const handleSelect = useCallback((postId: string) => {
    onSelect(postId);
    setIsOpen(false);
    setQuery('');
  }, [onSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % filteredPosts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filteredPosts.length) % filteredPosts.length);
    } else if (e.key === 'Enter' && filteredPosts[selectedIndex]) {
      handleSelect(filteredPosts[selectedIndex].id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-md-surface/40 backdrop-blur-xl z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
          >
            <div className="bg-md-surface border border-md-outline/20 rounded-[32px] shadow-md-5 overflow-hidden">
              {/* search row */}
              <div className="flex items-center px-6 py-5 border-b border-md-outline/15 gap-4">
                <Search size={24} className="text-md-primary" />
                <input
                  autoFocus
                  placeholder="search posts..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none outline-none text-xl font-bold text-md-on-surface w-full placeholder:text-md-on-surface-variant/40"
                />
                <kbd className="px-3 py-1 bg-md-surface-variant text-md-on-surface-variant rounded-lg text-[10px] font-medium tracking-tight">
                  esc
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-3 scrollbar-none">
                {filteredPosts.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {filteredPosts.map((post, idx) => (
                      <button
                        key={post.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleSelect(post.id)}
                        className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between ${
                          selectedIndex === idx
                            ? 'bg-md-primary-container text-md-on-primary-container shadow-md-1'
                            : 'hover:bg-md-surface-variant text-md-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${
                            selectedIndex === idx
                              ? 'bg-md-primary/20 text-md-on-primary-container'
                              : 'bg-md-secondary-container text-md-on-secondary-container'
                          }`}>
                            <Hash size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">{post.title}</span>
                            <span className={`text-[10px] font-bold lowercase tracking-tight opacity-70 ${
                              selectedIndex === idx ? 'text-md-on-primary-container' : 'text-md-secondary'
                            }`}>
                              {post.category}
                            </span>
                          </div>
                        </div>
                        {selectedIndex === idx && (
                          <motion.div layoutId="enter-icon" className="text-md-on-primary-container opacity-60">
                            <CornerDownLeft size={18} />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-md-on-surface-variant/40 gap-4">
                    <Sparkles size={48} strokeWidth={1} />
                    <p className="font-bold text-lg italic tracking-tight">nothing found!</p>
                  </div>
                )}
              </div>

              {/* chill footer */}
              <div className="px-6 py-4 bg-md-surface-variant/50 border-t border-md-outline/10 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 bg-md-surface text-md-on-surface-variant rounded text-[9px] font-medium border border-md-outline/20">
                      ↑↓
                    </kbd>
                    <span className="text-[14px]  text-md-on-surface-variant tracking-tight">
                      navigate
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 bg-md-surface text-md-on-surface-variant rounded text-[9px] font-medium border border-md-outline/20">
                      enter
                    </kbd>
                    <span className="text-[14px] text-md-on-surface-variant tracking-tight">
                      open
                    </span>
                  </div>
                </div>
                <span className="text-[14px] font-medium text-md-primary/60 tracking-tight">
                  cons.search
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}