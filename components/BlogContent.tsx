'use client'

import React from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import { BlogPost } from '@/lib/blog-data'
import CopyLinkCapsule from './CopyLinkCapsule'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Copy, Check } from 'lucide-react'

// syntax highlighting
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'

interface BlogContentProps {
  post: BlogPost
  onBack: () => void
}

interface CodeBlockProps {
  language: string
  code: string
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [mounted, setMounted] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const displayLanguage = React.useMemo(() => {
    const langMap: Record<string, string> = {
      cpp: 'C++',
      c: 'C',
      javascript: 'JavaScript',
      js: 'JavaScript',
      typescript: 'TypeScript',
      ts: 'TypeScript',
      bash: 'Bash',
      sh: 'Shell',
      json: 'JSON',
      html: 'HTML',
      css: 'CSS',
      rust: 'Rust',
      python: 'Python',
      py: 'Python',
    }
    return langMap[language.toLowerCase()] || language.toUpperCase()
  }, [language])

  const highlightedHtml = React.useMemo(() => {
    try {
      const prismLang = Prism.languages[language] || Prism.languages.plaintext
      return Prism.highlight(code, prismLang, language)
    } catch (e) {
      return code
    }
  }, [code, language])

  return (
    <div className="relative my-6 border border-md-outline/15 dark:border-white/5 rounded-2xl bg-md-surface-variant/20 dark:bg-black/30 overflow-hidden group shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-md-outline/15 dark:border-white/5 bg-md-surface-variant/40 dark:bg-black/50 font-sans text-xs font-bold text-md-on-surface-variant/70 tracking-wider">
        <span className="font-mono text-[11px] font-extrabold text-md-primary uppercase">
          {displayLanguage}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-md-outline/15 dark:border-white/5 bg-md-surface/50 dark:bg-neutral-900/50 hover:bg-md-primary hover:text-md-on-primary hover:border-md-primary text-md-on-surface-variant/80 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green-500 dark:text-green-400" />
              <span className="text-[11px] font-bold text-green-600 dark:text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[11px] font-bold">Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-5 overflow-x-auto text-[13.5px] leading-relaxed font-mono bg-transparent m-0 select-text scrollbar-thin">
        {mounted ? (
          <code
            className={`language-${language} font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <code className={`language-${language} font-mono`}>{code}</code>
        )}
      </pre>
    </div>
  )
}

const markdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-extrabold text-md-on-surface tracking-tight mt-12 mb-6 border-b border-md-outline/10 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-md-on-surface tracking-tight mt-10 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-bold text-md-on-surface tracking-tight mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[16.5px] leading-relaxed text-md-on-surface-variant/90 font-medium mb-6">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-md-on-surface-variant/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-md-on-surface-variant/90">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[16px] leading-relaxed font-medium">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-md-primary bg-md-surface-variant/20 dark:bg-black/15 pl-5 py-4 pr-4 my-6 rounded-r-xl italic text-md-on-surface-variant/90">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-md-primary hover:underline font-bold transition-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match && typeof children === 'string' && !children.includes('\n')
    const content = String(children).replace(/\n$/, '')

    if (isInline) {
      return (
        <code className="font-mono text-[14.5px] px-2 py-0.5 rounded-lg bg-md-surface-variant/40 text-md-on-surface border border-md-outline/10 font-bold tracking-tight">
          {content}
        </code>
      )
    }

    const language = match ? match[1] : 'plaintext'
    return <CodeBlock language={language} code={content} />
  }
}

function dedent(str: string): string {
  const lines = str.split('\n')
  let minIndent = Infinity
  for (const line of lines) {
    if (line.trim().length === 0) continue
    const match = line.match(/^[ \t]*/)
    if (match) {
      const indent = match[0].length
      if (indent < minIndent) {
        minIndent = indent
      }
    }
  }

  if (minIndent !== Infinity && minIndent > 0) {
    return lines
      .map(line => (line.trim().length === 0 ? '' : line.slice(minIndent)))
      .join('\n')
  }

  return str
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

      <div className="markdown-body max-w-none">
        <ReactMarkdown components={markdownComponents}>{dedent(post.content)}</ReactMarkdown>
      </div>

      <div className="mt-24 p-12 rounded-[48px] bg-md-surface-variant/30 border border-md-outline/10 dark:border-white/5 text-center flex flex-col items-center gap-8 shadow-inner">
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