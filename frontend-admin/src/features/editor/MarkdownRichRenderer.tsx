import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { cn } from '@/lib/utils'

interface Props {
  content: string
  className?: string
}

export function MarkdownRichRenderer({ content, className }: Props) {
  return (
    <div className={cn('markdown-renderer text-text-primary', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node: _n, ...p }) => (
            <h1 className="text-3xl font-semibold mt-8 mb-4 text-text-primary" {...p} />
          ),
          h2: ({ node: _n, ...p }) => (
            <h2 className="text-2xl font-semibold mt-8 mb-3 text-text-primary" {...p} />
          ),
          h3: ({ node: _n, ...p }) => (
            <h3 className="text-xl font-semibold mt-6 mb-2 text-text-primary" {...p} />
          ),
          p: ({ node: _n, ...p }) => (
            <p className="my-4 leading-relaxed text-text-secondary" {...p} />
          ),
          ul: ({ node: _n, ...p }) => (
            <ul className="list-disc pl-6 my-4 space-y-1 text-text-secondary" {...p} />
          ),
          ol: ({ node: _n, ...p }) => (
            <ol className="list-decimal pl-6 my-4 space-y-1 text-text-secondary" {...p} />
          ),
          li: ({ node: _n, ...p }) => <li className="leading-relaxed" {...p} />,
          blockquote: ({ node: _n, ...p }) => (
            <blockquote
              className="border-l-2 border-primary-500 pl-4 my-4 italic text-text-secondary"
              {...p}
            />
          ),
          code: ({ node: _n, className: cls, children, ...p }) => {
            const isInline = !cls
            if (isInline) {
              return (
                <code
                  className="rounded bg-surface-300 px-1.5 py-0.5 text-xs font-mono text-primary-300"
                  {...p}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={cn('text-xs font-mono', cls)} {...p}>
                {children}
              </code>
            )
          },
          pre: ({ node: _n, ...p }) => (
            <pre
              className="my-4 rounded-md overflow-x-auto border border-border bg-surface-100 p-4 text-xs"
              {...p}
            />
          ),
          a: ({ node: _n, href, children, ...p }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary-400 underline underline-offset-2 hover:text-primary-300"
              {...p}
            >
              {children}
              <span className="sr-only"> (abre em nova janela)</span>
            </a>
          ),
          img: ({ node: _n, alt, ...p }) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              alt={alt ?? ''}
              loading="lazy"
              className="my-4 rounded-md max-w-full border border-border"
              {...p}
            />
          ),
          table: ({ node: _n, ...p }) => (
            <div className="my-4 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm" {...p} />
            </div>
          ),
          thead: ({ node: _n, ...p }) => <thead className="bg-surface-100" {...p} />,
          th: ({ node: _n, ...p }) => (
            <th className="text-left px-3 py-2 font-medium text-text-primary border-b border-border" {...p} />
          ),
          td: ({ node: _n, ...p }) => (
            <td className="px-3 py-2 border-b border-border last:border-b-0 text-text-secondary" {...p} />
          ),
          input: ({ node: _n, ...p }) => (
            <input className="mr-2 accent-primary-500" {...p} readOnly disabled={false} />
          ),
          hr: ({ node: _n, ...p }) => <hr className="my-8 border-border" {...p} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
