import type { LeadDetailDto } from '@template/shared'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useDeleteLead } from '../api/use-leads'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: LeadDetailDto
  onDeleted?: () => void
}

export function DeleteLeadDialog({ open, onOpenChange, lead, onDeleted }: Props) {
  const del = useDeleteLead()

  const onConfirm = async () => {
    await del.mutateAsync(lead.id)
    onDeleted?.()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Excluir lead</AlertDialogTitle>
        <AlertDialogDescription>
          O lead <strong className="text-on-surface">{lead.name}</strong> será removido da lista. Anotações e dados de
          tracking continuam preservados internamente, mas o registro deixa de aparecer no pipeline e nos exports.
        </AlertDialogDescription>
        <AlertDialogActions>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {del.isPending ? 'Excluindo…' : 'Excluir lead'}
          </AlertDialogAction>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialog>
  )
}
