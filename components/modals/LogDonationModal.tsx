'use client'

import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import type { Member } from '@/types'

const schema = z.object({
  member_id: z.string().optional(),
  donor_name: z.string().optional(),
  type: z.enum(['hadiya', 'zakat', 'other']),
  category: z.enum(['general', 'medical', 'scholarship', 'emergency']),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  mode: z.enum(['bank', 'upi', 'cash']),
  reference: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export default function LogDonationModal({ open, onClose, onSaved }: Props) {
  const [members, setMembers] = useState<Member[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isExternal, setIsExternal] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      type: 'hadiya',
      category: 'general',
      date: today,
      mode: 'upi',
      member_id: '',
      donor_name: '',
      reference: '',
    },
  })

  const donationType = watch('type')

  useEffect(() => {
    if (!open) return
    supabase.from('members').select('id, name, code').eq('status', 'active').order('code')
      .then(({ data }) => setMembers((data ?? []) as Member[]))
    reset({
      type: 'hadiya',
      category: 'general',
      date: today,
      mode: 'upi',
      member_id: '',
      donor_name: '',
      reference: '',
    })
    setIsExternal(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      const account = data.type === 'zakat' ? 'zakat' : 'general'
      const member = members.find(m => m.id === data.member_id)
      const donorName = isExternal ? (data.donor_name ?? null) : (member?.name ?? null)
      const categoryLabel = data.category.charAt(0).toUpperCase() + data.category.slice(1)
      const typeLabel = data.type.charAt(0).toUpperCase() + data.type.slice(1)

      const { error: donError } = await supabase.from('donations').insert({
        date: data.date,
        member_id: isExternal ? null : (data.member_id || null),
        donor_name: donorName,
        type: data.type,
        category: data.category,
        amount: data.amount,
        mode: data.mode,
        reference: data.reference || null,
      })

      if (donError) throw donError

      const { error: ledgerError } = await supabase.from('ledger_entries').insert({
        date: data.date,
        account,
        category: typeLabel,
        sub_category: categoryLabel,
        member_id: isExternal ? null : (data.member_id || null),
        member_code: member?.code ?? null,
        description: `${typeLabel} — ${donorName ?? 'External donor'}`,
        amount: data.amount,
        source_type: 'donation',
      })

      if (ledgerError) throw ledgerError

      toast.success(`Donation logged — ₹${data.amount.toLocaleString('en-IN')} from ${donorName ?? 'External donor'}`)
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
          <DialogTitle className="font-headline font-bold text-on-surface">Log Donation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Donor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-label font-medium text-on-surface-variant">Donor</label>
              <button
                type="button"
                onClick={() => setIsExternal(!isExternal)}
                className="text-xs font-label text-primary hover:underline"
              >
                {isExternal ? 'Select from members' : 'External donor?'}
              </button>
            </div>
            {isExternal ? (
              <input
                type="text"
                {...register('donor_name')}
                placeholder="Donor name…"
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ) : (
              <select
                {...register('member_id')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select member…</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (#{m.code})</option>
                ))}
              </select>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">Donation Type *</label>
            <div className="flex gap-2">
              {(['hadiya', 'zakat', 'other'] as const).map(t => (
                <label
                  key={t}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs font-label font-medium capitalize ${
                    donationType === t
                      ? 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant'
                      : 'border-outline-variant bg-surface-highest text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <input type="radio" value={t} {...register('type')} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Zakat info callout */}
          {donationType === 'zakat' && (
            <div className="bg-tertiary-fixed/40 border border-tertiary-fixed rounded-lg px-4 py-3 flex gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-on-tertiary-fixed-variant mt-0.5 shrink-0">info</span>
              <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
                Zakat contributions are posted to the restricted Zakat (GFES) account and can only be disbursed for eligible scholarship or zakat-eligible expenses.
              </p>
            </div>
          )}

          {/* Category + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="general">General</option>
                <option value="medical">Medical</option>
                <option value="scholarship">Scholarship</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
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
          </div>

          {/* Date + Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Date *</label>
              <input
                type="date"
                {...register('date')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.date && <p className="text-xs text-error">{errors.date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Mode *</label>
              <select
                {...register('mode')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
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
              placeholder="Transaction ID…"
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
                  <span className="material-symbols-outlined text-[16px] leading-none">save</span>
                  Log Donation
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
