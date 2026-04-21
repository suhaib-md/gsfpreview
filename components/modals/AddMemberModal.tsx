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
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Member code is required'),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  join_date: z.string().min(1, 'Join date is required'),
  status: z.enum(['active', 'inactive']),
  is_bod: z.boolean(),
  bod_designation: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  member?: Member | null
}

export default function AddMemberModal({ open, onClose, onSaved, member }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!member
  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      join_date: today,
      status: 'active',
      is_bod: false,
      bod_designation: '',
    },
  })

  const isBod = watch('is_bod')

  useEffect(() => {
    if (!open) return
    if (member) {
      reset({
        name: member.name,
        code: member.code,
        email: member.email ?? '',
        phone: member.phone ?? '',
        address: member.address ?? '',
        join_date: member.join_date,
        status: member.status,
        is_bod: member.is_bod,
        bod_designation: member.bod_designation ?? '',
      })
    } else {
      supabase.from('members').select('code').order('code', { ascending: false }).limit(1)
        .then(({ data }) => {
          const nextCode = data && data.length > 0
            ? String(parseInt(data[0].code) + 1).padStart(4, '0')
            : '0001'
          reset({
            name: '',
            code: nextCode,
            email: '',
            phone: '',
            address: '',
            join_date: today,
            status: 'active',
            is_bod: false,
            bod_designation: '',
          })
          setValue('code', nextCode)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, member])

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    try {
      if (isEdit && member) {
        const { error } = await supabase.from('members').update({
          name: data.name,
          code: data.code,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          join_date: data.join_date,
          status: data.status,
          is_bod: data.is_bod,
          bod_designation: data.is_bod ? (data.bod_designation || null) : null,
        }).eq('id', member.id)

        if (error) {
          if (error.code === '23505') {
            toast.error('Member code already exists.')
            return
          }
          throw error
        }
        toast.success(`Member updated — ${data.name}`)
      } else {
        const { error } = await supabase.from('members').insert({
          name: data.name,
          code: data.code,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          join_date: data.join_date,
          status: 'active',
          is_bod: data.is_bod,
          bod_designation: data.is_bod ? (data.bod_designation || null) : null,
        })

        if (error) {
          if (error.code === '23505') {
            toast.error('Member code already exists. Please use a different code.')
            return
          }
          throw error
        }
        toast.success(`Member added — ${data.name} (#${data.code})`)
      }

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
            {isEdit ? 'Edit Member' : 'Add Member'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">Full Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Amina Hassan"
              className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && <p className="text-xs text-error">{errors.name.message}</p>}
          </div>

          {/* Code + Join Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Member Code *</label>
              <input
                type="text"
                {...register('code')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.code && <p className="text-xs text-error">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Join Date *</label>
              <input
                type="date"
                {...register('join_date')}
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.join_date && <p className="text-xs text-error">{errors.join_date.message}</p>}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">
                Email <span className="text-outline font-normal">(optional)</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="email@example.com"
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">
                Phone <span className="text-outline font-normal">(optional)</span>
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-label font-medium text-on-surface-variant">
              Address <span className="text-outline font-normal">(optional)</span>
            </label>
            <input
              type="text"
              {...register('address')}
              placeholder="e.g. 12 Main Street, Hyderabad"
              className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status — only shown when editing */}
          {isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant">Status</label>
              <div className="flex gap-2">
                {(['active', 'inactive'] as const).map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('status')} value={s} className="accent-primary" />
                    <span className="text-sm font-label text-on-surface capitalize">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* BOD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_bod')}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-sm font-label text-on-surface">Board of Directors member</span>
            </label>
            {isBod && (
              <input
                type="text"
                {...register('bod_designation')}
                placeholder="e.g. Vice President, Secretary…"
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-label text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
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
                  <span className="material-symbols-outlined text-[16px] leading-none">
                    {isEdit ? 'save' : 'person_add'}
                  </span>
                  {isEdit ? 'Save Changes' : 'Add Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
