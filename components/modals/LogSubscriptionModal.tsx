'use client'

import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { cn, FY_MONTHS, FY_MONTH_LABELS, MONTH_NAMES } from '@/lib/utils'
import type { Member, SubscriptionStatus } from '@/types'

const schema = z.object({
  member_id: z.string().min(1, 'Member is required'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int(),
  amount: z.coerce.number().optional(),
  paid_date: z.string().optional(),
  mode: z.enum(['bank', 'upi', 'cash']).optional(),
  reference: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  prefillMemberId?: string
  prefillMemberName?: string
  prefillMonth?: number
  prefillYear?: number
}

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string; icon: string; chipCls: string }[] = [
  { value: 'paid', label: 'Paid',          icon: 'check_circle', chipCls: 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant' },
  { value: 'due',  label: 'Due',           icon: 'schedule',      chipCls: 'border-tertiary-fixed bg-tertiary-fixed/40 text-on-tertiary-fixed-variant' },
  { value: 'na',   label: 'Not Applicable', icon: 'block',         chipCls: 'border-outline-variant bg-secondary-container text-on-secondary-container' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i)

export default function LogSubscriptionModal({
  open, onClose, onSaved,
  prefillMemberId, prefillMemberName, prefillMonth, prefillYear,
}: Props) {
  const [members, setMembers] = useState<Member[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<SubscriptionStatus>('paid')

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      member_id: prefillMemberId ?? '',
      month: prefillMonth ?? (new Date().getMonth() + 1),
      year: prefillYear ?? currentYear,
      amount: 300,
      paid_date: today,
      mode: 'upi',
    },
  })

  useEffect(() => {
    if (!open) return
    setStatus('paid')
    supabase.from('members').select('id, name, code').eq('status', 'active').order('code')
      .then(({ data }) => {
        setMembers((data ?? []) as Member[])
        reset({
          member_id: prefillMemberId ?? '',
          month: prefillMonth ?? (new Date().getMonth() + 1),
          year: prefillYear ?? currentYear,
          amount: 300,
          paid_date: today,
          mode: 'upi',
          reference: '',
        })
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefillMemberId, prefillMonth, prefillYear])

  async function onSubmit(data: FormData) {
    if (status === 'paid' && (!data.amount || !data.paid_date || !data.mode)) {
      toast.error('Please fill in amount, date and payment mode.')
      return
    }

    setSubmitting(true)
    try {
      const member = members.find(m => m.id === data.member_id)
      const amount = data.amount ?? 300

      const { error: subError } = await supabase.from('subscriptions').upsert({
        member_id: data.member_id,
        month: data.month,
        year: data.year,
        status,
        amount: status === 'na' ? 0 : amount,
        paid_date: status === 'paid' ? data.paid_date : null,
        mode: status === 'paid' ? data.mode : null,
        reference: status === 'paid' ? (data.reference || null) : null,
      }, { onConflict: 'member_id,month,year' })
      if (subError) throw subError

      if (status === 'paid') {
        const { error: ledgerError } = await supabase.from('ledger_entries').insert({
          date: data.paid_date,
          account: 'general',
          category: 'Subscription',
          sub_category: 'Monthly',
          member_id: data.member_id,
          member_code: member?.code ?? null,
          description: `Monthly subscription — ${member?.name ?? 'Member'}`,
          amount,
          source_type: 'subscription',
        })
        if (ledgerError) throw ledgerError
      }

      const monthLabel = `${MONTH_NAMES[data.month - 1]} ${data.year}`
      const memberLabel = member?.name ?? 'Member'
      if (status === 'paid')  toast.success(`Subscription logged — ${memberLabel}, ${monthLabel}`)
      if (status === 'due')   toast.success(`Marked as Due — ${memberLabel}, ${monthLabel}`)
      if (status === 'na')    toast.success(`Marked as N/A — ${memberLabel}, ${monthLabel}`)

      onClose()
      onSaved?.()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasPrefill = prefillMemberName && prefillMonth && prefillYear

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Subscription
          </DialogTitle>
        </DialogHeader>

        {hasPrefill && (
          <div className="bg-surface-container rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">calendar_month</span>
            <div>
              <p className="text-xs text-on-surface-variant font-label">Pre-filled</p>
              <p className="text-sm font-label font-semibold text-on-surface">
                {prefillMemberName} — {MONTH_NAMES[prefillMonth - 1]} {prefillYear}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Status selector */}
          <div className="space-y-1.5">
            <p className="text-xs font-label font-medium text-on-surface-variant">Status *</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-xs font-label font-medium',
                    status === opt.value
                      ? opt.chipCls
                      : 'border-outline-variant bg-surface-highest text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">Member *</label>
            <select
              {...register('member_id')}
              className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select member…</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} (#{m.code})</option>
              ))}
            </select>
            {errors.member_id && <p className="text-xs text-error">{errors.member_id.message}</p>}
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Month *</label>
              <select
                {...register('month')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {FY_MONTHS.map((m, i) => (
                  <option key={m} value={m}>{FY_MONTH_LABELS[i]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Year *</label>
              <select
                {...register('year')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Paid-only fields */}
          {status === 'paid' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-label font-medium text-on-surface-variant">Amount (₹) *</label>
                  <input
                    type="number"
                    {...register('amount')}
                    className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-label font-medium text-on-surface-variant">Payment Date *</label>
                  <input
                    type="date"
                    {...register('paid_date')}
                    className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-label font-medium text-on-surface-variant">Payment Mode *</label>
                <select
                  {...register('mode')}
                  className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-label font-medium text-on-surface-variant">
                  Reference <span className="text-outline font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  {...register('reference')}
                  placeholder="Transaction ID, cheque no…"
                  className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          {/* Due-only fields */}
          {status === 'due' && (
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">
                Amount (₹) <span className="text-outline font-normal">(optional — defaults to ₹300)</span>
              </label>
              <input
                type="number"
                {...register('amount')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* N/A info */}
          {status === 'na' && (
            <div className="bg-surface-container rounded-lg px-4 py-3 flex gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5 shrink-0">info</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This month will be marked as Not Applicable — no subscription is expected from this member for the selected period.
              </p>
            </div>
          )}

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
              className={cn(
                'flex items-center gap-2 font-label font-semibold px-5 py-2.5 rounded-md hover:opacity-95 transition-opacity disabled:opacity-60 text-sm',
                status === 'paid' ? 'bg-linear-to-r from-primary to-primary-container text-on-primary' :
                status === 'due'  ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' :
                                    'bg-secondary-container text-on-secondary-container'
              )}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {status === 'paid' ? 'save' : status === 'due' ? 'schedule' : 'block'}
                  </span>
                  {status === 'paid' ? 'Mark as Paid' : status === 'due' ? 'Mark as Due' : 'Mark as N/A'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
