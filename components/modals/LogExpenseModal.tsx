'use client'

import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Medical', 'Scholarship', 'Administrative', 'Amanath', 'Other'] as const

const schema = z.object({
  account: z.enum(['general', 'zakat']),
  category: z.enum(CATEGORIES),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export default function LogExpenseModal({ open, onClose, onSaved }: Props) {
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      account: 'general',
      category: 'Medical',
      description: '',
      date: today,
      reference: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      account: 'general',
      category: 'Medical',
      description: '',
      date: today,
      reference: '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const { error } = await supabase.from('ledger_entries').insert({
        date: data.date,
        account: data.account,
        category: data.category,
        sub_category: 'Disbursal',
        description: data.description,
        amount: -data.amount,
        source_type: 'expense',
        reference: data.reference || null,
      })

      if (error) throw error

      const accountLabel = data.account === 'general' ? 'General' : 'Zakat'
      toast.success(`Expense logged — ₹${data.amount.toLocaleString('en-IN')} from ${accountLabel} account`)
      onClose()
      onSaved?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Expense / Disbursal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Account + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Account *</label>
              <select
                {...register('account')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="general">General Account</option>
                <option value="zakat">Zakat Account</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">Description *</label>
            <input
              type="text"
              {...register('description')}
              placeholder="e.g. Medical aid — Case #MED-2024-08"
              className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Amount (₹) *</label>
              <input
                type="number"
                {...register('amount')}
                placeholder="0"
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Date *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.date && <p className="text-xs text-error">{errors.date.message}</p>}
            </div>
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">
              Reference <span className="text-outline font-normal">(optional)</span>
            </label>
            <input
              type="text"
              {...register('reference')}
              placeholder="Reference number, case ID…"
              className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-5 py-2.5 rounded-md hover:opacity-95 transition-opacity disabled:opacity-60 text-sm"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] leading-none">payments</span>
                  Log Expense
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
