import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Send, EyeOff, Trash2, Save, Sparkles } from 'lucide-react'
import { PostInputSchema } from '@aumaf/shared'

interface PostFormValues {
  title: string
  slug?: string
  excerpt?: string | null
  content: string
  coverImageUrl?: string | null
  categoryId?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'UNPUBLISHED'
  generatedByAi: boolean
  readingTimeMin?: number | null
  featured: boolean
  tags: string[]
}
import {
  useCategories,
  useCreatePost,
  useDeletePost,
  usePost,
  usePublishPost,
  useUnpublishPost,
  useUpdatePost,
} from '../api/use-posts'
import { PostStatusBadge } from '../components/PostStatusBadge'
import { SlugInput } from '../components/SlugInput'
import { MarkdownEditor } from '@/features/editor/MarkdownEditor'
import { MediaPickerDialog } from '@/features/editor/MediaPickerDialog'
import { AIPanel } from '@/features/ai/components/AIPanel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAutoSave } from '../hooks/use-auto-save'

export function PostEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()

  const post = usePost(id)
  const categories = useCategories()
  const create = useCreatePost()
  const update = useUpdatePost(id ?? '')
  const publish = usePublishPost()
  const unpublish = useUnpublishPost()
  const del = useDeletePost()

  const [mediaPickerForCover, setMediaPickerForCover] = useState(false)
  const [mediaPickerForBody, setMediaPickerForBody] = useState(false)
  const [pendingBodyImageResolver, setPendingBodyImageResolver] = useState<
    ((url: string | null) => void) | null
  >(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  const defaultValues = useMemo<PostFormValues>(
    () => ({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImageUrl: null,
      categoryId: null,
      metaTitle: '',
      metaDescription: '',
      status: 'DRAFT',
      generatedByAi: false,
      readingTimeMin: null,
      featured: false,
      tags: [],
    }),
    [],
  )

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostInputSchema) as unknown as Resolver<PostFormValues>,
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (post.data) {
      form.reset({
        title: post.data.title,
        slug: post.data.slug,
        excerpt: post.data.excerpt ?? '',
        content: post.data.content,
        coverImageUrl: post.data.coverImageUrl,
        categoryId: post.data.categoryId,
        metaTitle: post.data.metaTitle ?? '',
        metaDescription: post.data.metaDescription ?? '',
        status: post.data.status,
        generatedByAi: post.data.generatedByAi,
        readingTimeMin: post.data.readingTimeMin,
        featured: post.data.featured,
        tags: post.data.tags,
      })
      setSlugManual(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.data])

  const titleValue = form.watch('title')
  const slugValue = form.watch('slug')
  const coverValue = form.watch('coverImageUrl')
  const watchedAll = form.watch()

  const isPending = create.isPending || update.isPending || publish.isPending || unpublish.isPending || del.isPending
  const status = form.watch('status')

  // Auto-save: ativo apenas para posts existentes (edição), não em criação inicial
  const autoSave = useAutoSave({
    postId: id,
    values: form.formState.isDirty ? watchedAll : {},
    enabled: !isNew && form.formState.isDirty,
  })

  const saveLabel = useMemo(() => {
    if (create.isPending || update.isPending) return 'Salvando...'
    if (create.isSuccess || update.isSuccess) return 'Salvo'
    return 'Salvar'
  }, [create.isPending, create.isSuccess, update.isPending, update.isSuccess])

  const saveLabelTone =
    create.isError || update.isError
      ? 'text-danger-400'
      : create.isSuccess || update.isSuccess
      ? 'text-primary-400'
      : 'text-text-tertiary'

  const handleSave = form.handleSubmit(async (values) => {
    try {
      if (isNew) {
        const created = await create.mutateAsync(values)
        toast.success('Post criado')
        navigate(`/posts/${created.id}`, { replace: true })
      } else {
        await update.mutateAsync(values)
        toast.success('Alterações salvas')
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao salvar'
      toast.error(msg)
    }
  })

  const handlePublish = async () => {
    if (isNew) {
      // salvar primeiro
      await form.handleSubmit(async (values) => {
        try {
          const created = await create.mutateAsync({ ...values, status: 'PUBLISHED' })
          toast.success('Post publicado')
          navigate(`/posts/${created.id}`, { replace: true })
        } catch (err) {
          toast.error((err as Error).message)
        }
      })()
      return
    }
    try {
      // garantir mudanças salvas antes de publicar
      await form.handleSubmit(async (values) => {
        await update.mutateAsync(values)
      })()
      const updated = await publish.mutateAsync(id!)
      form.setValue('status', updated.status)
      toast.success('Post publicado')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const handleUnpublish = async () => {
    if (!id) return
    try {
      const updated = await unpublish.mutateAsync(id)
      form.setValue('status', updated.status)
      toast.success('Post despublicado')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Excluir este post? Esta ação não pode ser desfeita.')) return
    try {
      await del.mutateAsync(id)
      toast.success('Post excluído')
      navigate('/posts')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const requestBodyImage = (): Promise<string | null> => {
    return new Promise((resolve) => {
      setPendingBodyImageResolver(() => resolve)
      setMediaPickerForBody(true)
    })
  }

  if (id && post.isLoading) return <LoadingScreen label="Carregando post..." />
  if (id && post.isError) {
    return (
      <div className="surface-card p-6 text-sm text-danger-400">
        Erro ao carregar: {(post.error as Error).message}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild size="icon" variant="ghost" aria-label="Voltar">
            <Link to="/posts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-text-primary truncate">
                {isNew ? 'Novo post' : titleValue || 'Sem título'}
              </h1>
              <PostStatusBadge status={status} />
              {form.watch('generatedByAi') && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-primary-400"
                  title="Gerado por IA"
                >
                  <Sparkles className="size-3" />
                  IA
                </span>
              )}
            </div>
            <div className={cn('text-xs font-mono mt-0.5', saveLabelTone)}>
              {saveLabel}
            </div>
            {!isNew && (
              <div className="text-[10px] font-mono mt-1 flex items-center gap-1.5">
                {autoSave.state === 'saving' && (
                  <span className="text-on-surface-variant">Auto-salvando...</span>
                )}
                {autoSave.state === 'saved' && autoSave.lastSavedAt && (
                  <span className="text-primary-container/80">
                    Auto-salvo {autoSave.lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {autoSave.state === 'error' && (
                  <span className="text-error">Falha no auto-save (tentativa {autoSave.failureCount})</span>
                )}
                {autoSave.state === 'paused' && (
                  <button
                    type="button"
                    onClick={autoSave.retry}
                    className="text-error hover:underline"
                  >
                    Auto-save pausado — clique para tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAiPanelOpen((o) => !o)}
            className={aiPanelOpen ? 'text-primary-400' : ''}
          >
            <Sparkles className="size-4" />
            IA
          </Button>

          <div className="h-6 w-px bg-border mx-1" aria-hidden />

          {!isNew && status === 'PUBLISHED' && (
            <Button variant="secondary" size="sm" onClick={handleUnpublish} loading={unpublish.isPending}>
              <EyeOff className="size-4" /> Despublicar
            </Button>
          )}
          {!isNew && (
            <Button variant="ghost" size="sm" onClick={handleDelete} loading={del.isPending}>
              <Trash2 className="size-4 text-danger-400" />
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleSave} loading={create.isPending || update.isPending}>
            <Save className="size-4" /> Salvar rascunho
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={isPending}>
            <Send className="size-4" /> {status === 'PUBLISHED' ? 'Atualizar' : 'Publicar'}
          </Button>
        </div>
      </header>

      <div className={cn('grid gap-6 transition-all', aiPanelOpen ? 'lg:grid-cols-[1fr_360px]' : 'lg:grid-cols-[1fr_320px]')}>
        <div className="space-y-4 min-w-0">
          <Card>
            <Label htmlFor="post-title" className="text-xs uppercase tracking-wider font-mono text-text-tertiary">
              Título
            </Label>
            <Input
              id="post-title"
              {...form.register('title')}
              placeholder="Título do post"
              className="text-2xl h-auto py-2 mt-2 font-semibold border-0 px-0 bg-transparent focus-visible:ring-0"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-danger-400 mt-1">{form.formState.errors.title.message}</p>
            )}
          </Card>

          <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Conteúdo do post em Markdown..."
                  onRequestUploadImage={requestBodyImage}
                />
              )}
            />
        </div>

        <aside className="space-y-4">
          {aiPanelOpen && (
            <AIPanel
              onApply={(out) => {
                if (!form.getValues('title')) form.setValue('title', out.title, { shouldValidate: true })
                if (!form.getValues('excerpt')) form.setValue('excerpt', out.excerpt)
                if (!form.getValues('metaTitle')) form.setValue('metaTitle', out.metaTitle)
                if (!form.getValues('metaDescription')) form.setValue('metaDescription', out.metaDescription)
                if (out.suggestedCategorySlug && !form.getValues('categoryId')) {
                  const match = categories.data?.find((c) => c.slug === out.suggestedCategorySlug)
                  if (match) form.setValue('categoryId', match.id)
                }
                const current = form.getValues('content')
                const shouldReplace = !current.trim() || window.confirm('Substituir o conteúdo atual pelo gerado pela IA?')
                if (shouldReplace) {
                  form.setValue('content', out.content)
                  form.setValue('generatedByAi', true)
                }
                toast.success(`Rascunho gerado por ${out.provider} (${out.latencyMs}ms)`)
              }}
            />
          )}

          <Card className="space-y-4">
            <SlugInput
              title={titleValue ?? ''}
              value={slugValue ?? ''}
              onChange={(v) => form.setValue('slug', v, { shouldValidate: true })}
              manualEdit={slugManual}
              onManualEditChange={setSlugManual}
            />

            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Resumo</Label>
              <Textarea
                id="post-excerpt"
                {...form.register('excerpt')}
                placeholder="Resumo curto exibido na listagem..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Capa</Label>
              {coverValue ? (
                <div className="space-y-2">
                  <div className="rounded-md overflow-hidden border border-border">
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img src={coverValue} alt="Capa" className="w-full max-h-44 object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setMediaPickerForCover(true)}
                    >
                      Trocar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.setValue('coverImageUrl', null)}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setMediaPickerForCover(true)}
                  className="w-full"
                >
                  Escolher imagem de capa
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-category">Categoria</Label>
              <Select
                id="post-category"
                value={form.watch('categoryId') ?? ''}
                onChange={(e) => form.setValue('categoryId', e.target.value || null)}
              >
                <option value="">Sem categoria</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary">SEO</h3>
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta título</Label>
              <Input id="meta-title" {...form.register('metaTitle')} placeholder="Título para SEO" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta descrição</Label>
              <Textarea
                id="meta-description"
                {...form.register('metaDescription')}
                placeholder="Descrição que aparece nos resultados de busca"
                rows={3}
              />
            </div>
          </Card>
        </aside>
      </div>

      <MediaPickerDialog
        open={mediaPickerForCover}
        onOpenChange={setMediaPickerForCover}
        onSelect={(url) => form.setValue('coverImageUrl', url)}
      />
      <MediaPickerDialog
        open={mediaPickerForBody}
        onOpenChange={(open) => {
          setMediaPickerForBody(open)
          if (!open && pendingBodyImageResolver) {
            pendingBodyImageResolver(null)
            setPendingBodyImageResolver(null)
          }
        }}
        onSelect={(url) => {
          if (pendingBodyImageResolver) {
            pendingBodyImageResolver(url)
            setPendingBodyImageResolver(null)
          }
        }}
      />
    </div>
  )
}
