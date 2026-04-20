import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import type { SubscriptionStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const FY_MONTHS = [6,7,8,9,10,11,12,1,2,3,4,5]
export const FY_MONTH_LABELS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']

export function getSubscriptionBadgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'paid': return 'bg-primary-fixed text-on-primary-fixed-variant'
    case 'due':  return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    case 'na':   return 'bg-secondary-container text-on-secondary-container'
  }
}
