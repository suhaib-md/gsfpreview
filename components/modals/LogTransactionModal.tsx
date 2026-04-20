'use client'

import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { cn, FY_MONTHS, FY_MONTH_LABELS, MONTH_NAMES } from '@/lib/utils'
import type { Member } from '@/types'

export type TransactionType = 'subscription' | 'donation' | 'expense'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  initialType?: TransactionType
}

// ── Shared ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-label font-medium text-on-surface-variant">
      {children}
    </label>
  )
}

function SubmitRow({
  onClose,
  submitting,
  label,
  icon,
}: {
  onClose: () => void
  submitting: boolean
  label: string
  icon: string
}) {
  return (
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
            <span className="material-symbols-outlined text-[16px] leading-none">{icon}</span>
            {label}
          </>
        )}
      </button>
    </div>
  )
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i)

// ── Subscription form ────────────────────────────────────────────────────────

const subSchema = z.object({
  member_id: z.string().min(1, 'Member is required'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int(),
  amount: z.coerce.number().positive('Amount must be positive'),
  paid_date: z.string().min(1, 'Date is required'),
  mode: z.enum(['bank', 'upi', 'cash']),
  reference: z.string().optional(),
})
type SubData = z.infer<typeof subSchema>

function SubscriptionForm({
  members,
  open,
  onClose,
  onSaved,
}: {
  members: Member[]
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubData>({
    resolver: zodResolver(subSchema) as Resolver<SubData>,
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: currentYear,
      amount: 300,
      paid_date: today,
      mode: 'upi',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      member_id: '',
      month: new Date().getMonth() + 1,
      year: currentYear,
      amount: 300,
      paid_date: today,
      mode: 'upi',
      reference: '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(data: SubData) {
    setSubmitting(true)
    try {
      const member = members.find(m => m.id === data.member_id)

      const { error: subError } = await supabase.from('subscriptions').upsert(
        {
          member_id: data.member_id,
          month: data.month,
          year: data.year,
          status: 'paid',
          amount: data.amount,
          paid_date: data.paid_date,
          mode: data.mode,
          reference: data.reference || null,
        },
        { onConflict: 'member_id,month,year' }
      )
      if (subError) throw subError

      const { error: ledgerError } = await supabase.from('ledger_entries').insert({
        date: data.paid_date,
        account: 'general',
        category: 'Subscription',
        sub_category: 'Monthly',
        member_id: data.member_id,
        member_code: member?.code ?? null,
        description: `Monthly subscription — ${member?.name ?? 'Member'}`,
        amount: data.amount,
        source_type: 'subscription',
      })
      if (ledgerError) throw ledgerError

      toast.success(
        `Subscription logged — ${member?.name}, ${MONTH_NAMES[data.month - 1]} ${data.year}`
      )
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Member *</Label>
        <select {...register('member_id')} className={inputCls}>
          <option value="">Select member…</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} (#{m.code})
            </option>
          ))}
        </select>
        {errors.member_id && (
          <p className="text-xs text-error">{errors.member_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Month *</Label>
          <select {...register('month')} className={inputCls}>
            {FY_MONTHS.map((m, i) => (
              <option key={m} value={m}>
                {FY_MONTH_LABELS[i]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Year *</Label>
          <select {...register('year')} className={inputCls}>
            {YEARS.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Amount (₹) *</Label>
          <input type="number" {...register('amount')} className={inputCls} />
          {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Payment Date *</Label>
          <input type="date" {...register('paid_date')} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Payment Mode *</Label>
        <select {...register('mode')} className={inputCls}>
          <option value="upi">UPI</option>
          <option value="bank">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>
          Reference{' '}
          <span className="text-outline font-normal">(optional)</span>
        </Label>
        <input
          type="text"
          {...register('reference')}
          placeholder="Transaction ID, cheque no…"
          className={inputCls}
        />
      </div>

      <SubmitRow onClose={onClose} submitting={submitting} label="Log Subscription" icon="save" />
    </form>
  )
}

// ── Donation form ────────────────────────────────────────────────────────────

const donSchema = z.object({
  member_id: z.string().optional(),
  donor_name: z.string().optional(),
  type: z.enum(['hadiya', 'zakat', 'other']),
  category: z.enum(['general', 'medical', 'scholarship', 'emergency']),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  mode: z.enum(['bank', 'upi', 'cash']),
  reference: z.string().optional(),
})
type DonData = z.infer<typeof donSchema>

function DonationForm({
  members,
  open,
  onClose,
  onSaved,
}: {
  members: Member[]
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [isExternal, setIsExternal] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DonData>({
    resolver: zodResolver(donSchema) as Resolver<DonData>,
    defaultValues: { type: 'hadiya', category: 'general', date: today, mode: 'upi' },
  })

  const donationType = watch('type')

  useEffect(() => {
    if (!open) return
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

  async function onSubmit(data: DonData) {
    setSubmitting(true)
    try {
      const account = data.type === 'zakat' ? 'zakat' : 'general'
      const member = members.find(m => m.id === data.member_id)
      const donorName = isExternal ? (data.donor_name ?? null) : (member?.name ?? null)
      const typeLabel = data.type.charAt(0).toUpperCase() + data.type.slice(1)
      const catLabel = data.category.charAt(0).toUpperCase() + data.category.slice(1)

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
        sub_category: catLabel,
        member_id: isExternal ? null : (data.member_id || null),
        member_code: member?.code ?? null,
        description: `${typeLabel} — ${donorName ?? 'External donor'}`,
        amount: data.amount,
        source_type: 'donation',
      })
      if (ledgerError) throw ledgerError

      toast.success(
        `Donation logged — ₹${data.amount.toLocaleString('en-IN')} from ${donorName ?? 'External donor'}`
      )
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Donor</Label>
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
            className={inputCls}
          />
        ) : (
          <select {...register('member_id')} className={inputCls}>
            <option value="">Select member…</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} (#{m.code})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Donation Type *</Label>
        <div className="flex gap-2">
          {(['hadiya', 'zakat', 'other'] as const).map(t => (
            <label
              key={t}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs font-label font-medium capitalize ${
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

      {donationType === 'zakat' && (
        <div className="bg-tertiary-fixed/40 border border-tertiary-fixed rounded-lg px-4 py-3 flex gap-2.5">
          <span className="material-symbols-outlined text-[16px] text-on-tertiary-fixed-variant mt-0.5 shrink-0">
            info
          </span>
          <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
            Zakat contributions are posted to the restricted Zakat (GFES) account and can only
            be disbursed for eligible scholarship or zakat-eligible expenses.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <select {...register('category')} className={inputCls}>
            <option value="general">General</option>
            <option value="medical">Medical</option>
            <option value="scholarship">Scholarship</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount (₹) *</Label>
          <input type="number" {...register('amount')} placeholder="0" className={inputCls} />
          {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <input type="date" {...register('date')} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <Label>Mode *</Label>
          <select {...register('mode')} className={inputCls}>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Reference <span className="text-outline font-normal">(optional)</span>
        </Label>
        <input
          type="text"
          {...register('reference')}
          placeholder="Transaction ID…"
          className={inputCls}
        />
      </div>

      <SubmitRow
        onClose={onClose}
        submitting={submitting}
        label="Log Donation"
        icon="volunteer_activism"
      />
    </form>
  )
}

// ── Expense form ─────────────────────────────────────────────────────────────

const EXPENSE_CATS = ['Medical', 'Scholarship', 'Administrative', 'Amanath', 'Other'] as const

const expSchema = z.object({
  account: z.enum(['general', 'zakat']),
  category: z.enum(EXPENSE_CATS),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().optional(),
})
type ExpData = z.infer<typeof expSchema>

function ExpenseForm({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpData>({
    resolver: zodResolver(expSchema) as Resolver<ExpData>,
    defaultValues: { account: 'general', category: 'Medical', description: '', date: today },
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

  async function onSubmit(data: ExpData) {
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
      })
      if (error) throw error

      const accountLabel = data.account === 'general' ? 'General' : 'Zakat'
      toast.success(
        `Expense logged — ₹${data.amount.toLocaleString('en-IN')} from ${accountLabel} account`
      )
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Account *</Label>
          <select {...register('account')} className={inputCls}>
            <option value="general">General Account</option>
            <option value="zakat">Zakat Account</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <select {...register('category')} className={inputCls}>
            {EXPENSE_CATS.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description *</Label>
        <input
          type="text"
          {...register('description')}
          placeholder="e.g. Medical aid — Case #MED-2024-08"
          className={inputCls}
        />
        {errors.description && (
          <p className="text-xs text-error">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Amount (₹) *</Label>
          <input type="number" {...register('amount')} placeholder="0" className={inputCls} />
          {errors.amount && <p className="text-xs text-error">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <input type="date" {...register('date')} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Reference <span className="text-outline font-normal">(optional)</span>
        </Label>
        <input
          type="text"
          {...register('reference')}
          placeholder="Reference number, case ID…"
          className={inputCls}
        />
      </div>

      <SubmitRow onClose={onClose} submitting={submitting} label="Log Expense" icon="payments" />
    </form>
  )
}

// ── Main modal ───────────────────────────────────────────────────────────────

const TABS: { type: TransactionType; label: string; icon: string }[] = [
  { type: 'subscription', label: 'Subscription', icon: 'calendar_month' },
  { type: 'donation', label: 'Donation', icon: 'volunteer_activism' },
  { type: 'expense', label: 'Expense', icon: 'payments' },
]

export default function LogTransactionModal({
  open,
  onClose,
  onSaved,
  initialType = 'subscription',
}: Props) {
  const [activeType, setActiveType] = useState<TransactionType>(initialType)
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    if (!open) return
    setActiveType(initialType)
    supabase
      .from('members')
      .select('id, name, code')
      .eq('status', 'active')
      .order('code')
      .then(({ data }) => setMembers((data ?? []) as Member[]))
  }, [open, initialType])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline font-bold text-on-surface">
            Log Transaction
          </DialogTitle>
        </DialogHeader>

        {/* Type selector tabs */}
        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
          {TABS.map(tab => (
            <button
              key={tab.type}
              type="button"
              onClick={() => setActiveType(tab.type)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-label font-medium transition-colors',
                activeType === tab.type
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-[14px] leading-none">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeType === 'subscription' && (
          <SubscriptionForm
            members={members}
            open={open && activeType === 'subscription'}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
        {activeType === 'donation' && (
          <DonationForm
            members={members}
            open={open && activeType === 'donation'}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
        {activeType === 'expense' && (
          <ExpenseForm
            open={open && activeType === 'expense'}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
