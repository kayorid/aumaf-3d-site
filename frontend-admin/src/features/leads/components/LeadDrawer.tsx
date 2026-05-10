import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  Loader2,
  Calendar,
  Globe,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import type { LeadDetailDto, LeadNoteDto } from '@aumaf/shared'
import { useLeadDetail, useAddLeadNote, useUpdateLeadNote, useDeleteLeadNote } from '../api/use-leads'
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth.store'
import { DeleteLeadDialog } from './DeleteLeadDialog'

interface Props {
  leadId: string | null
  onClose: () => void
  onDeleted?: () => void
}

export function LeadDrawer({ leadId, onClose, onDeleted }: Props) {
  const { data, isLoading, isError, error } = useLeadDetail(leadId)
  const [showDelete, setShowDelete] = useState(false)

  return (
    <Drawer
      open={!!leadId}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DrawerContent>
        <DrawerHeader
          title={data?.name ?? 'Carregando…'}
          subtitle={
            data?.createdAt
              ? `Recebido em ${format(new Date(data.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
              : undefined
          }
          actions={
            <button
              onClick={() => setShowDelete(true)}
              disabled={!data}
              className="p-1.5 rounded-sm text-on-surface-variant hover:text-error hover:bg-error/5 focus-ring disabled:opacity-30"
              aria-label="Excluir lead"
              title="Excluir lead"
            >
              <Trash2 className="size-4" />
            </button>
          }
        />

        <DrawerBody>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 animate-pulse rounded-sm" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-sm text-error">{(error as Error)?.message ?? 'Erro ao carregar lead'}</div>
          )}

          {data && <LeadDrawerSections lead={data} />}
        </DrawerBody>

        {data && (
          <DeleteLeadDialog
            open={showDelete}
            onOpenChange={setShowDelete}
            lead={data}
            onDeleted={() => {
              setShowDelete(false)
              onClose()
              onDeleted?.()
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function LeadDrawerSections({ lead }: { lead: LeadDetailDto }) {
  return (
    <>
      <SectionIdentification lead={lead} />
      {lead.message && <SectionMessage message={lead.message} />}
      <SectionTracking lead={lead} />
      <SectionNotes lead={lead} />
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary-container mb-3 flex items-center gap-2">
      <span className="block w-1 h-3 bg-primary-container rounded-sm" />
      {children}
    </h3>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70">{label}</div>
      <div className="text-[13px] text-on-surface break-words">{children}</div>
    </div>
  )
}

function SectionIdentification({ lead }: { lead: LeadDetailDto }) {
  const phoneClean = lead.phone?.replace(/\D/g, '')
  return (
    <section>
      <SectionTitle>Identificação</SectionTitle>
      <div className="grid grid-cols-1 gap-4">
        <Field label="Email">
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 text-on-surface hover:text-primary-container transition-colors"
          >
            <Mail className="size-3.5" /> {lead.email}
          </a>
        </Field>
        {lead.phone && (
          <Field label="Telefone">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-1.5 hover:text-primary-container transition-colors"
              >
                <Phone className="size-3.5" /> {lead.phone}
              </a>
              {phoneClean && (
                <a
                  href={`https://wa.me/${phoneClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-primary-container hover:underline"
                >
                  <MessageCircle className="size-3" /> WhatsApp
                </a>
              )}
            </div>
          </Field>
        )}
        <Field label="Fonte">
          {lead.source ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-white/15 text-[10px] uppercase tracking-widest text-on-surface-variant">
              {lead.source}
            </span>
          ) : (
            <span className="text-on-surface-variant/40">—</span>
          )}
        </Field>
        {lead.botyoStatus && (
          <Field label="Status Botyio">
            <BotyoBadge status={lead.botyoStatus} />
          </Field>
        )}
      </div>
    </section>
  )
}

function BotyoBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: 'border-primary-container/40 text-primary-container',
    pending: 'border-amber-400/40 text-amber-300',
    failed: 'border-error/40 text-error',
  }
  const cls = map[status] ?? 'border-white/15 text-on-surface-variant'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-widest ${cls}`}>
      {status}
    </span>
  )
}

function SectionMessage({ message }: { message: string }) {
  return (
    <section>
      <SectionTitle>Mensagem</SectionTitle>
      <div className="bg-surface-base/60 border border-white/10 rounded-sm px-4 py-3 text-[13px] leading-relaxed text-on-surface whitespace-pre-wrap">
        {message}
      </div>
    </section>
  )
}

function SectionTracking({ lead }: { lead: LeadDetailDto }) {
  const [open, setOpen] = useState(false)
  const tracking: Array<[string, string | null | undefined]> = [
    ['UTM Source', lead.utmSource],
    ['UTM Medium', lead.utmMedium],
    ['UTM Campaign', lead.utmCampaign],
    ['UTM Term', lead.utmTerm],
    ['UTM Content', lead.utmContent],
    ['Referrer', lead.referrer],
    ['Landing Page', lead.landingPage],
  ]
  const hasAny = tracking.some(([, v]) => v)
  if (!hasAny) return null

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant hover:text-primary-container transition-colors mb-3"
      >
        <span className="flex items-center gap-2">
          <Globe className="size-3" /> Tracking
        </span>
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-3 bg-surface-base/40 border border-white/10 rounded-sm p-3">
          {tracking.map(([label, value]) =>
            value ? (
              <div key={label} className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">{label}</div>
                <div className="text-[12px] text-on-surface break-all font-mono">{value}</div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </section>
  )
}

function SectionNotes({ lead }: { lead: LeadDetailDto }) {
  const [body, setBody] = useState('')
  const add = useAddLeadNote(lead.id)

  const submit = async () => {
    if (!body.trim()) return
    await add.mutateAsync({ body: body.trim() })
    setBody('')
  }

  return (
    <section>
      <SectionTitle>Anotações</SectionTitle>
      <div className="space-y-3">
        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Adicionar anotação interna…"
            rows={3}
            disabled={add.isPending}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={!body.trim() || add.isPending}>
              {add.isPending && <Loader2 className="size-3 animate-spin" />}
              Adicionar nota
            </Button>
          </div>
        </div>

        {lead.notes.length === 0 && (
          <div className="text-[12px] text-on-surface-variant/60 py-2">Nenhuma anotação ainda.</div>
        )}

        {lead.notes.map((note) => (
          <NoteItem key={note.id} note={note} leadId={lead.id} />
        ))}
      </div>
    </section>
  )
}

function NoteItem({ note, leadId }: { note: LeadNoteDto; leadId: string }) {
  const me = useAuthStore((s) => s.user)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.body)
  const upd = useUpdateLeadNote(leadId)
  const del = useDeleteLeadNote(leadId)

  const canEdit = !!me && (me.id === note.authorId || me.role === 'ADMIN')

  const save = async () => {
    if (!draft.trim()) return
    await upd.mutateAsync({ noteId: note.id, input: { body: draft.trim() } })
    setEditing(false)
  }

  return (
    <div className="bg-surface-base/40 border border-white/10 rounded-sm px-3 py-2.5 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/70">
        <div className="flex items-center gap-2">
          <Calendar className="size-2.5" />
          {format(new Date(note.createdAt), 'dd/MM HH:mm', { locale: ptBR })}
          {note.authorName && <span className="text-on-surface-variant/60">· {note.authorName}</span>}
          {note.updatedAt !== note.createdAt && <span className="text-on-surface-variant/40">(editada)</span>}
        </div>
        {canEdit && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setDraft(note.body)
                setEditing(true)
              }}
              className="p-1 rounded-sm hover:bg-white/5 hover:text-on-surface focus-ring"
              aria-label="Editar"
            >
              <Pencil className="size-3" />
            </button>
            <button
              onClick={() => del.mutate(note.id)}
              disabled={del.isPending}
              className="p-1 rounded-sm hover:bg-error/10 hover:text-error focus-ring"
              aria-label="Excluir"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface px-2 py-1"
            >
              <X className="size-3 inline" /> Cancelar
            </button>
            <button
              onClick={save}
              disabled={!draft.trim() || upd.isPending}
              className="text-[10px] uppercase tracking-[0.2em] text-primary-container hover:underline px-2 py-1 disabled:opacity-50"
            >
              <Check className="size-3 inline" /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[13px] text-on-surface whitespace-pre-wrap leading-relaxed">{note.body}</div>
      )}
    </div>
  )
}
