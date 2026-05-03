import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
  Heading2, Heading3, List, ListOrdered, ListChecks,
  Code, Quote, Link2, Image as ImageIcon, Minus, Code2, LayoutTemplate, ChevronDown,
} from 'lucide-react'
import { Textarea } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { markdownToHtml, htmlToMarkdown, preprocessHtmlForTiptap } from './markdown-editor/converters'
import { HtmlBlock } from './blocks/HtmlBlockExtension'
import { BLOCK_TEMPLATES, type BlockTemplate } from './blocks/block-templates'

export type EditorMode = 'visual' | 'code'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  charLimit?: number
  minHeight?: string
  className?: string
  onRequestUploadImage?: () => Promise<string | null>
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo do post...',
  charLimit = 50_000,
  minHeight = '24rem',
  className,
  onRequestUploadImage,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const isUpdatingRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'tiptap-code-block' } } }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        validate: (href) => /^https?:\/\//i.test(href),
      }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-md max-w-full' } }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false, HTMLAttributes: { class: 'tiptap-table' } }),
      TableRow,
      TableHeader,
      TableCell,
      HtmlBlock,
    ],
    content: preprocessHtmlForTiptap(markdownToHtml(value)),
    editorProps: {
      attributes: {
        class:
          'focus:outline-none',
        style: `min-height: ${minHeight};`,
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingRef.current) return
      onChange(htmlToMarkdown(ed.getHTML()))
    },
  })

  const syncEditorContent = useCallback(
    (md: string) => {
      if (!editor) return
      isUpdatingRef.current = true
      editor.commands.setContent(preprocessHtmlForTiptap(markdownToHtml(md)), { emitUpdate: false })
      isUpdatingRef.current = false
    },
    [editor],
  )

  useEffect(() => {
    if (mode === 'visual' && editor) {
      const current = htmlToMarkdown(editor.getHTML())
      if (current.trim() !== value.trim()) {
        syncEditorContent(value)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value, editor])

  const charCount = value.length
  const overLimit = charCount > charLimit

  return (
    <div className={cn('surface-card p-0 overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-1">
          <ModeButton active={mode === 'visual'} onClick={() => setMode('visual')}>
            Visual
          </ModeButton>
          <ModeButton active={mode === 'code'} onClick={() => setMode('code')}>
            <Code2 className="size-3" /> Markdown
          </ModeButton>
        </div>
        <div
          className={cn(
            'text-[11px] font-mono tabular-nums px-2',
            overLimit ? 'text-warn-400' : 'text-text-tertiary',
          )}
          aria-live="polite"
        >
          {charCount.toLocaleString('pt-BR')} / {charLimit.toLocaleString('pt-BR')}
        </div>
      </div>

      {mode === 'visual' ? (
        <>
          <Toolbar editor={editor} onRequestUploadImage={onRequestUploadImage} />
          <div className="prose-aumaf-editor">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-transparent rounded-none font-mono text-xs leading-relaxed"
          style={{ minHeight }}
          spellCheck
        />
      )}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-surface-200 text-text-primary'
          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-200/60',
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({
  editor,
  onRequestUploadImage,
}: {
  editor: Editor | null
  onRequestUploadImage?: () => Promise<string | null>
}) {
  if (!editor) return null
  const [blockMenuOpen, setBlockMenuOpen] = useState(false)

  const handleLink = () => {
    const previous = editor.getAttributes('link').href ?? ''
    const url = window.prompt('URL do link (inclua https://)', previous)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!/^https?:\/\//i.test(url)) {
      window.alert('URL inválida — use http:// ou https://')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImage = async () => {
    if (onRequestUploadImage) {
      const url = await onRequestUploadImage()
      if (url) editor.chain().focus().setImage({ src: url }).run()
    } else {
      const url = window.prompt('URL da imagem')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatação"
      className="flex items-center gap-0.5 flex-wrap border-b border-border px-2 py-1.5 bg-surface-50"
    >
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        label="Título 2"
      >
        <Heading2 className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        label="Título 3"
      >
        <Heading3 className="size-4" />
      </ToolBtn>
      <Divider />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        label="Negrito (Ctrl+B)"
      >
        <Bold className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        label="Itálico (Ctrl+I)"
      >
        <Italic className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        label="Sublinhado (Ctrl+U)"
      >
        <UnderlineIcon className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        label="Tachado"
      >
        <Strikethrough className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        label="Destacar"
      >
        <Highlighter className="size-4" />
      </ToolBtn>
      <Divider />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        label="Lista"
      >
        <List className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        label="Lista numerada"
      >
        <ListOrdered className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        label="Lista de tarefas"
      >
        <ListChecks className="size-4" />
      </ToolBtn>
      <Divider />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        label="Código inline"
      >
        <Code className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        label="Bloco de código"
      >
        <Code2 className="size-4" />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        label="Citação"
      >
        <Quote className="size-4" />
      </ToolBtn>
      <Divider />
      <ToolBtn onClick={handleLink} active={editor.isActive('link')} label="Link (Ctrl+K)">
        <Link2 className="size-4" />
      </ToolBtn>
      <ToolBtn onClick={handleImage} label="Imagem">
        <ImageIcon className="size-4" />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Linha">
        <Minus className="size-4" />
      </ToolBtn>
      <Divider />
      {/* Menu de inserção de blocos ricos do design system */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setBlockMenuOpen((v) => !v)}
          title="Inserir bloco"
          aria-label="Inserir bloco"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-surface-200 transition-colors"
        >
          <LayoutTemplate className="size-3.5" />
          Bloco
          <ChevronDown className="size-3" />
        </button>
        {blockMenuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-low border border-white/15 rounded-sm shadow-lg min-w-[200px] py-1">
            {BLOCK_TEMPLATES.map((tpl: BlockTemplate) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  editor.chain().focus().insertContent({ type: 'htmlBlock', attrs: { html: tpl.html } }).run()
                  setBlockMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-[12px] text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <span className="text-primary-container">{tpl.icon}</span>
                {tpl.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolBtn({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void
  active?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center size-8 rounded-md transition-colors focus-ring',
        active
          ? 'bg-primary-500/15 text-primary-400'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-200',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1" aria-hidden />
}
