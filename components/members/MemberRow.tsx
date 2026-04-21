'use client'

import { useRouter } from 'next/navigation'
import { cn, formatDate, getInitials } from '@/lib/utils'
import type { Member } from '@/types'

interface Props {
  member: Member
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
}

export default function MemberRow({ member, onEdit, onDelete }: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/members/${member.id}`)}
      className="bg-white rounded-xl border border-outline-variant/20 shadow-sm px-4 py-3.5 md:px-5 md:py-4 cursor-pointer hover:bg-surface-high/50 transition-colors group"
    >
      {/* Mobile layout */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="text-on-primary-container text-[10px] font-bold">
            {getInitials(member.name)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-label font-semibold text-on-surface text-sm">{member.name}</span>
            {member.is_bod && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
                BOD
              </span>
            )}
          </div>
          <span className="text-[10px] text-outline font-mono">#{member.code}</span>
        </div>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-label font-medium shrink-0',
            member.status === 'active'
              ? 'bg-primary-fixed text-on-primary-fixed-variant'
              : 'bg-secondary-container text-on-secondary-container'
          )}
        >
          {member.status === 'active' ? 'Active' : 'Inactive'}
        </span>
        {/* Mobile action buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30 transition-colors"
            title="Edit member"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">edit</span>
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
            title="Delete member"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid grid-cols-[72px_1fr_200px_130px_90px_72px] items-center gap-4">
        {/* Code */}
        <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded text-center">
          #{member.code}
        </span>

        {/* Avatar + Name + BOD */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="text-on-primary-container text-[10px] font-bold">
              {getInitials(member.name)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-label font-semibold text-on-surface text-sm">
                {member.name}
              </span>
              {member.is_bod && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
                  BOD
                </span>
              )}
            </div>
            {member.bod_designation && (
              <p className="text-xs text-on-surface-variant truncate">{member.bod_designation}</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="min-w-0 space-y-0.5">
          {member.phone && (
            <p className="text-xs text-on-surface-variant truncate">{member.phone}</p>
          )}
          {member.email && (
            <p className="text-xs text-on-surface-variant truncate">{member.email}</p>
          )}
          {!member.phone && !member.email && (
            <p className="text-xs text-outline italic">No contact</p>
          )}
        </div>

        {/* Join date */}
        <p className="text-xs text-on-surface-variant">{formatDate(member.join_date)}</p>

        {/* Status */}
        <div className="flex justify-end">
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full font-label font-medium',
              member.status === 'active'
                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                : 'bg-secondary-container text-on-secondary-container'
            )}
          >
            {member.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center justify-end gap-1"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30 opacity-0 group-hover:opacity-100 transition-all"
            title="Edit member"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">edit</span>
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete member"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
