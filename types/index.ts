export type MemberStatus = 'active' | 'inactive'
export type SubscriptionStatus = 'paid' | 'due' | 'na'
export type AccountType = 'general' | 'zakat'
export type DonationType = 'hadiya' | 'zakat' | 'other'
export type DonationCategory = 'general' | 'medical' | 'scholarship' | 'emergency'
export type PaymentMode = 'bank' | 'upi' | 'cash'

export interface Member {
  id: string
  code: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  join_date: string
  status: MemberStatus
  is_bod: boolean
  bod_designation: string | null
  created_at: string
}

export interface Subscription {
  id: string
  member_id: string
  month: number
  year: number
  status: SubscriptionStatus
  amount: number
  paid_date: string | null
  mode: PaymentMode | null
  reference: string | null
  notes: string | null
  created_at: string
}

export interface LedgerEntry {
  id: string
  date: string
  account: AccountType
  category: string
  sub_category: string | null
  member_id: string | null
  member_code: string | null
  description: string
  amount: number
  running_balance: number | null
  source_type: string | null
  created_at: string
}

export interface Donation {
  id: string
  date: string
  member_id: string | null
  donor_name: string | null
  type: DonationType
  category: DonationCategory
  amount: number
  mode: string | null
  reference: string | null
  notes: string | null
  created_at: string
}
