# CLAUDE.md — GSF Accounts Management · Board Preview Build

> This file is the single source of truth for Claude Code when building the GSF Accounts
> Management preview application. Read this entire document before writing a single line of
> code. Every decision — architecture, naming, styling, data — must reference this document.

---

## 1. Project Context

### What this is
A **board preview build** of the GSF Accounts Management web application. It will be
demonstrated to the Foundation's Board of Directors in a meeting in a few days. The goal is
to show the look, feel, and core workflows — not to ship production code.

### What "preview" means here
- Real UI, real interactions, real navigation between pages
- Supabase backend with seed data so dashboards show meaningful numbers
- Core write flows work end-to-end (log a subscription, log a donation)
- No auth complexity — a single hardcoded demo login is fine
- No PDF export, no email/SMS receipts, no audit log UI
- No mobile nav hamburger menu needed — desktop is the priority for the board meeting

### Hosting
- **Frontend**: Vercel (free Hobby tier)
- **Database**: Supabase (free tier)
- **Repo**: GitHub (connect to Vercel for auto-deploy)

### Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI components**: shadcn/ui (as base, heavily customised to match the design system below)
- **Database ORM**: Supabase JS client (`@supabase/supabase-js`)
- **Icons**: Material Symbols (via Google Fonts CDN — loaded in layout)
- **Fonts**: Plus Jakarta Sans (headlines) + Inter (body/label) — via Google Fonts CDN
- **Charts**: Recharts
- **Form handling**: React Hook Form + Zod validation
- **Date handling**: date-fns

---

## 2. Design System — Read This Before Any CSS

This is the most important section. Every colour, radius, font, and spacing decision flows
from here. Do not deviate.

### 2.1 Colour Tokens

These are the exact hex values. Use them as Tailwind arbitrary values or add them to
`tailwind.config.ts` as named tokens. **Never use any colour not in this list.**

```
Primary:              #004235   (deep forest green — brand colour)
Primary Container:    #005c4b   (darker green — gradients, active states)
On Primary:           #ffffff
On Primary Container: #88d2bc
Primary Fixed:        #a7f1da   (light mint — paid badges, success chips)
Primary Fixed Dim:    #8bd5bf   (mid mint — chart fills)
On Primary Fixed:     #002019
On Primary Fixed Var: #005142   (text on mint backgrounds)

Secondary:            #4c616c   (slate blue-grey)
Secondary Container:  #cfe6f2   (light blue — N/A badges)
Secondary Fixed:      #cfe6f2
On Secondary Cont:    #526772

Tertiary:             #4d3600   (dark amber — due/warning)
Tertiary Fixed:       #ffdea5   (light amber — due badges, warning fills)
Tertiary Fixed Dim:   #e9c176
On Tertiary Fixed:    #261900
On Tertiary Fixed Var:#5d4201   (text on amber backgrounds)
Tertiary Container:   #684c0b

Error:                #ba1a1a
Error Container:      #ffdad6
On Error Container:   #93000a

Surface:              #f8f9fa   (page background)
Surface Bright:       #f8f9fa
Surface Lowest:       #ffffff   (cards)
Surface Low:          #f3f4f5   (table header, subtle fills)
Surface Container:    #edeeef
Surface High:         #e7e8e9   (hover states)
Surface Highest:      #e1e3e4   (inputs, surface variant)
Surface Variant:      #e1e3e4
Surface Dim:          #d9dadb

On Surface:           #191c1d   (primary text)
On Surface Variant:   #3f4945   (secondary text, labels)
Outline:              #6f7975   (borders, icons)
Outline Variant:      #bec9c4   (subtle borders, dividers)
```

Add all of these to `tailwind.config.ts` under `theme.extend.colors` with kebab-case names
matching the token names above (e.g. `primary`, `primary-container`, `on-primary`,
`primary-fixed`, `on-primary-fixed-variant`, `surface-container-lowest`, etc.)

### 2.2 Border Radius

Override Tailwind's default radii entirely:

```
DEFAULT (rounded):    2px    (0.125rem)
rounded-lg:           4px    (0.25rem)
rounded-xl:           8px    (0.5rem)
rounded-full:         12px   (0.75rem)  ← badges and pills
```

> Note: "rounded-full" in this design system is NOT 9999px. It is 12px. This is intentional.
> The rounded-full class produces pill-shaped badges, not circles.

### 2.3 Typography

**Headline font**: Plus Jakarta Sans — weights 600, 700, 800
**Body font**: Inter — weights 400, 500, 600
**Label font**: Inter — weights 400, 500, 600 (same family, same usage as body but for UI labels)

Configure in `tailwind.config.ts`:
```js
fontFamily: {
  headline: ['"Plus Jakarta Sans"', 'sans-serif'],
  body: ['"Inter"', 'sans-serif'],
  label: ['"Inter"', 'sans-serif'],
}
```

Load both fonts in `app/layout.tsx` via Google Fonts with `display=swap`:
```
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap
```

Also load Material Symbols Outlined:
```
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap
```

Set body default: `font-family: Inter, sans-serif; background: #f8f9fa; color: #191c1d`

### 2.4 Material Symbols Usage

Use Material Symbols Outlined as an icon font. Usage pattern:
```html
<span className="material-symbols-outlined">dashboard</span>
<!-- filled variant: -->
<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
  dashboard
</span>
```

Add this global style to target filled icons via a class:
```css
.material-symbols-outlined.fill {
  font-variation-settings: 'FILL' 1;
}
```

### 2.5 Component Patterns

**Cards**: `bg-white rounded-xl border border-[#bec9c4]/20 shadow-sm`
Add a top accent bar for KPI cards: `<div class="absolute top-0 left-0 w-full h-1 bg-[colour]" />`

**Primary button**: gradient `from-[#004235] to-[#005c4b]`, text white, rounded-md
```
className="bg-linear-to-r from-primary to-primary-container text-on-primary font-label 
           font-semibold px-4 py-2.5 rounded-md hover:opacity-95 transition-opacity"
```

**Secondary button**: `bg-surface-container-high text-on-surface rounded-md hover:bg-surface-variant`

**Status badges** (use rounded-full which = 12px per design system):
- Paid / Active: `bg-primary-fixed text-on-primary-fixed-variant`
- Due / Warning: `bg-tertiary-fixed text-on-tertiary-fixed-variant`
- N/A / Inactive: `bg-secondary-container text-on-secondary-container`
- Cleared / Neutral: `bg-surface-variant text-on-surface-variant`
- BOD badge: `bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold`

**Table rows**: alternating `bg-white` and `bg-surface-container-low/40`, hover `bg-surface-container-high/50`

**Input fields**: `bg-surface-container-highest border-none rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary`

**Sidebar nav active state**: `bg-emerald-100/50 text-[#004235] rounded-xl font-semibold`
**Sidebar nav hover**: `hover:bg-emerald-50 hover:text-emerald-900 rounded-xl`

### 2.6 Layout Structure

The app uses a fixed left sidebar on desktop (272px wide) with a scrollable main content area.

```
┌─────────────────────────────────────────────┐
│  Sidebar (w-72, fixed, h-screen)            │
│  ┌──────────────────────────────────────┐   │
│  │ Logo + Foundation name               │   │
│  │ Nav links (Dashboard, Members,       │   │
│  │   Subscriptions, Ledger)             │   │
│  │ [Quick Action button]                │   │
│  │ Support / Sign Out                   │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│  Main (ml-72, flex-1, overflow-y-auto)      │
│  ┌──────────────────────────────────────┐   │
│  │ Page header (sticky top, title+desc) │   │
│  │ Page content (scrollable canvas)     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

Sidebar background: `bg-[#f8f9fa]` with `shadow-[32px_0_64px_-20px_rgba(0,0,0,0.04)]`

### 2.7 Sidebar Content

```
Logo area:
  - Circle avatar: w-10 h-10 bg-primary-container text-on-primary-container, initials "GS"
  - Title: "Project GSF" — font-headline font-extrabold text-[#004235]
  - Subtitle: "Financial Integrity" — text-xs text-on-surface-variant

Nav items (in order):
  - dashboard     → /dashboard
  - group         → /members
  - calendar_month → /subscriptions
  - receipt_long  → /ledger

Footer of sidebar:
  - Quick Action button (gradient primary, full width, rounded-md)
  - help → Support (link, no-op)
  - logout → Sign Out (link to /login or just demo)
```

---

## 3. Pages to Build

Build exactly these pages in this order. Stop after Phase 4 if time is tight.

### Page 1: `/login`
Simple centered card. No sidebar. Foundation logo at top.
Fields: Email, Password.
Demo credentials shown on screen: `treasurer@gsf.demo` / `demo123`
On submit: hardcode acceptance of those credentials → redirect to `/dashboard`.
No real auth — just a client-side check. State stored in localStorage as `gsf_demo_authed=true`.
All other pages check for this and redirect to `/login` if missing.

### Page 2: `/dashboard`
The main landing screen after login. Sidebar present.

**Quick Action row** (3 buttons, full width, grid-cols-3):
- "Log Subscription" (primary gradient)
- "Log Donation" (secondary/outlined)
- "Log Expense" (neutral)

Each opens a modal/drawer (see Section 5).

**KPI Bento grid**:
- Hero tile: Total Foundation Funds — `₹4,57,900` — with +4.2% chip
- General Account: `₹2,61,650` (57% of total)
- Zakat Account: `₹35,500` (Restricted)
- Medical Fund Pool: `₹1,20,000` (Emergency reserves)
- Outstanding Dues: `₹40,750` — red accent — "From 24 members"

**Charts row** (3 cards):
1. Donation Breakdown — donut chart (Hadiya 60%, Zakat 25%, Other 15%)
2. Expense Allocation — donut chart (Scholarship 45%, Medical 35%, Admin 20%)
3. Collection Rate — bar chart, last 4 months (Sep 60%, Oct 75%, Nov 85%, Dec 92%)

Use Recharts for all charts. Use the brand colour palette for fills.

**Recent Ledger Activity** table (last 5 transactions from Supabase):
Columns: Date | Description | Category | Amount | Status

### Page 3: `/members`
Sidebar present. Page header: "Members Directory"

**Search bar** + filter buttons (Status, BOD Only)

**Members list** — ledger-row style cards, not a plain table:
Grid: Member Code | Name (with BOD badge if applicable) | Contact | Join Date | Status badge

Pull from Supabase `members` table. Show all members paginated (10 per page).

Click a member row → navigate to `/members/[id]`

**Add Member button** — opens modal (see Section 5).

### Page 4: `/members/[id]`
Member profile detail page. No global sidebar nav — use a "back" header with arrow_back icon.

**Profile identity card** (left column):
- Avatar circle with initials
- Name, member code, active status badge
- Designation (BOD / Member)
- Email, phone, address

**Right columns**:
- KPI row: Total Contributed | Outstanding Dues | Assistance Received
- 12-month subscription history grid (P/D/N/A cells for each month)
- Recent donations table

### Page 5: `/subscriptions`
Sidebar present. Page header: "Subscription Tracker"

**Year selector** dropdown (2023-24, 2024-25)
**Mark all as paid** button

**Matrix table** (sticky first column):
Rows = members, Columns = Jun | Jul | Aug | Sep | Oct | Nov | Dec | Jan | Feb | Mar | Apr | May

Each cell: P (mint chip), D (amber chip), N/A (blue-grey chip), or empty dot for future months.

Click any P or D cell → small popover showing payment date, amount, reference.
Click an empty cell → opens Log Subscription modal pre-filled with that member + month.

Pull from Supabase. Show all active members.

Legend at bottom: Paid / Due / Not Applicable

### Page 6: `/ledger`
Sidebar present. Page header: "General Ledger"

**Filter panel**: Date range | Category | Member Code
**Current Balance KPI** card on right: `₹2,61,650` with trend

**Transactions table**:
Columns: Date | Category / Sub | Member Code | Description | Amount | Running Balance

Pull all from Supabase `ledger_entries` table, ordered by date desc, paginated 20/page.
Amounts: green for positive (`text-primary font-medium`), muted for negative (`text-on-error-container`).

Export buttons: "Export PDF" and "Export Excel" — show a toast "Feature coming in full version" on click.

---

## 4. Database Schema (Supabase)

Create these tables in Supabase. Use the SQL editor.

### 4.1 Table: `members`

```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,           -- "0001", "0002", etc.
  name text not null,
  email text,
  phone text,
  address text,
  join_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_bod boolean not null default false,
  bod_designation text,                -- "President", "Treasurer", etc.
  created_at timestamptz default now()
);
```

### 4.2 Table: `subscriptions`

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id),
  month integer not null check (month between 1 and 12),
  year integer not null,
  status text not null check (status in ('paid', 'due', 'na')),
  amount numeric(10,2) default 300.00,
  paid_date date,
  mode text check (mode in ('bank', 'upi', 'cash', null)),
  reference text,
  notes text,
  created_at timestamptz default now(),
  unique(member_id, month, year)
);
```

### 4.3 Table: `ledger_entries`

```sql
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  account text not null check (account in ('general', 'zakat')),
  category text not null,
  sub_category text,
  member_id uuid references members(id),
  member_code text,
  description text not null,
  amount numeric(10,2) not null,       -- positive = inflow, negative = outflow
  running_balance numeric(10,2),
  source_type text,                    -- 'subscription', 'donation', 'expense'
  created_at timestamptz default now()
);
```

### 4.4 Table: `donations`

```sql
create table donations (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  member_id uuid references members(id),
  donor_name text,
  type text not null check (type in ('hadiya', 'zakat', 'other')),
  category text not null check (category in ('general', 'medical', 'scholarship', 'emergency')),
  amount numeric(10,2) not null,
  mode text,
  reference text,
  notes text,
  created_at timestamptz default now()
);
```

### 4.5 Seed Data

Insert this seed data immediately after creating tables. This is what the board will see.

**Members** (10 members, 3 BOD):

```sql
insert into members (code, name, email, phone, join_date, status, is_bod, bod_designation) values
('0001', 'Ibrahim Al-Fayed',   'ibrahim@example.com',  '+91 98765 43210', '2021-06-06', 'active', true,  'President (Ameer)'),
('0002', 'Fatima Rahman',      'fatima@example.com',   '+91 98765 43211', '2021-06-06', 'active', true,  'Treasurer'),
('0003', 'Ahmed Siddiqui',     'ahmed@example.com',    '+91 87654 32109', '2021-06-06', 'active', true,  'Secretary'),
('0004', 'Zainab Malik',       'zainab@example.com',   '+91 76543 21098', '2021-07-01', 'active', false, null),
('0005', 'Omar Hussain',       'omar@example.com',     '+91 65432 10987', '2021-07-01', 'active', false, null),
('0006', 'Mariam Khan',        'mariam@example.com',   '+91 54321 09876', '2021-08-01', 'active', false, null),
('0007', 'Yusuf Patel',        'yusuf@example.com',    '+91 43210 98765', '2021-09-01', 'active', false, null),
('0008', 'Aisha Begum',        'aisha@example.com',    '+91 32109 87654', '2021-10-01', 'active', false, null),
('0009', 'Khalid Ansari',      null,                   '+91 21098 76543', '2022-01-01', 'active', false, null),
('0010', 'Ruqayyah Shaikh',    null,                   '+91 10987 65432', '2022-06-01', 'inactive', false, null);
```

**Subscriptions** (for FY 2024-25, Jun 2024 = month 6, year 2024 through May 2025):
Generate rows for all 9 active members (0001–0009) for months 6–12 of 2024.
Members 0001–0008: mostly 'paid', with member 0009 having 3 'due' months.
Member 0010 is inactive — use 'na' for all months.

```sql
-- FY 2024-25 subscriptions (sample — generate full set)
-- Members 0001-0008 paid Jun-Nov 2024
-- Insert as a bulk insert referencing the member IDs from the members table above.
-- Use a DO $$ block to look up member IDs by code.

do $$
declare
  m record;
  months int[] := array[6,7,8,9,10,11];
  yr int := 2024;
begin
  for m in select id, code, status from members where code in ('0001','0002','0003','0004','0005','0006','0007','0008') loop
    for i in 1..array_length(months,1) loop
      insert into subscriptions (member_id, month, year, status, amount, paid_date, mode)
      values (m.id, months[i], yr, 'paid', 300.00, make_date(yr, months[i], 10), 'upi')
      on conflict do nothing;
    end loop;
  end loop;
  -- Dec 2024 — member 0009 is due
  for m in select id, code from members where code = '0009' loop
    for i in 1..array_length(months,1) loop
      insert into subscriptions (member_id, month, year, status, amount)
      values (m.id, months[i], yr, 'paid', 300.00)
      on conflict do nothing;
    end loop;
    -- Oct, Nov, Dec 2024 are due for 0009
    insert into subscriptions (member_id, month, year, status, amount)
    values (m.id, 10, 2024, 'due', 300.00) on conflict do nothing;
    insert into subscriptions (member_id, month, year, status, amount)
    values (m.id, 11, 2024, 'due', 300.00) on conflict do nothing;
    insert into subscriptions (member_id, month, year, status, amount)
    values (m.id, 12, 2024, 'due', 300.00) on conflict do nothing;
  end loop;
  -- Inactive member 0010 — all NA
  for m in select id from members where code = '0010' loop
    for i in 1..array_length(months,1) loop
      insert into subscriptions (member_id, month, year, status, amount)
      values (m.id, months[i], yr, 'na', 0)
      on conflict do nothing;
    end loop;
  end loop;
end $$;
```

**Ledger entries** (20 realistic entries):

```sql
-- Insert 20 ledger entries covering the main transaction types
-- Use realistic dates across Jun–Dec 2024
-- Mix of subscriptions (+300 each), hadiya donations (+1200, +5000),
-- a zakat donation (+10000), medical disbursal (-15000),
-- and a scholarship payout (-8000 on zakat account)

insert into ledger_entries (date, account, category, sub_category, member_code, description, amount, running_balance) values
('2024-12-10', 'general',  'Subscription', 'Monthly',    '0001', 'Monthly subscription — Ibrahim Al-Fayed',   300.00,  261650.00),
('2024-12-10', 'general',  'Subscription', 'Monthly',    '0002', 'Monthly subscription — Fatima Rahman',      300.00,  261350.00),
('2024-12-10', 'general',  'Subscription', 'Monthly',    '0003', 'Monthly subscription — Ahmed Siddiqui',     300.00,  261050.00),
('2024-12-08', 'general',  'Hadiya',       'General',    '0001', 'Year-end Hadiya contribution',              5000.00,  260750.00),
('2024-12-05', 'general',  'Medical',      'Disbursal',  null,   'Medical aid — Case #MED-2024-07',         -15000.00, 255750.00),
('2024-11-20', 'zakat',    'Zakat',        'Inflow',     '0002', 'Annual Zakat — Fatima Rahman',            10000.00,  35500.00),
('2024-11-15', 'zakat',    'Scholarship',  'GFES Payout',null,   'Term 2 scholarship — Beneficiary YF',     -8000.00,  25500.00),
('2024-11-10', 'general',  'Subscription', 'Monthly',    '0004', 'Monthly subscription — Zainab Malik',       300.00,  270750.00),
('2024-11-10', 'general',  'Subscription', 'Monthly',    '0005', 'Monthly subscription — Omar Hussain',       300.00,  270450.00),
('2024-11-05', 'general',  'Hadiya',       'General',    '0003', 'Hadiya donation — Ahmed Siddiqui',         1200.00,  270150.00),
('2024-10-25', 'general',  'Subscription', 'Monthly',    '0006', 'Monthly subscription — Mariam Khan',        300.00,  268950.00),
('2024-10-25', 'general',  'Subscription', 'Monthly',    '0007', 'Monthly subscription — Yusuf Patel',        300.00,  268650.00),
('2024-10-20', 'zakat',    'Zakat',        'Inflow',     '0001', 'Zakat contribution — Ibrahim Al-Fayed',    5000.00,  33500.00),
('2024-10-15', 'general',  'Medical',      'Disbursal',  null,   'Medical aid — Case #MED-2024-06',          -8500.00, 268350.00),
('2024-10-10', 'general',  'Subscription', 'Monthly',    '0008', 'Monthly subscription — Aisha Begum',        300.00,  276850.00),
('2024-09-30', 'general',  'Hadiya',       'Emergency',  '0002', 'Emergency fundraiser contribution',         2000.00,  276550.00),
('2024-09-15', 'zakat',    'Scholarship',  'GFES Payout',null,   'Term 1 scholarship — Beneficiary RF',      -5500.00,  28500.00),
('2024-08-20', 'general',  'Subscription', 'Arrears',    '0009', 'Arrears payment — Khalid Ansari (3 months)',900.00,   274550.00),
('2024-07-10', 'general',  'Hadiya',       'General',    '0004', 'Hadiya donation — Zainab Malik',            3000.00,  273650.00),
('2024-06-15', 'general',  'Subscription', 'Monthly',    '0001', 'Opening month subscription — Ibrahim',      300.00,  270650.00);
```

### 4.6 Supabase RLS (Row Level Security)

For the preview, **disable RLS** on all tables to keep things simple:
```sql
alter table members disable row level security;
alter table subscriptions disable row level security;
alter table ledger_entries disable row level security;
alter table donations disable row level security;
```

Add the Supabase anon key + URL to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 5. Modal / Drawer Flows (Must Work End-to-End)

These three flows must actually write to Supabase and refresh the UI.

### 5.1 Log Subscription Modal

Trigger: "Log Subscription" quick action button OR clicking an empty/due cell in the tracker.

Fields:
- Member (searchable select from members table)
- Month (select: Jun–May)
- Year (select: 2024, 2025)
- Amount (number, default 300)
- Payment Date (date picker, default today)
- Mode (select: Bank Transfer / UPI / Cash)
- Reference (text, optional)
- Notes (textarea, optional)

On save:
1. Upsert into `subscriptions` table (on conflict of member_id+month+year, update)
2. Insert a `ledger_entries` row (account: 'general', category: 'Subscription', amount: positive)
3. Show success toast: "Subscription logged for [Member Name] — [Month Year]"
4. Close modal and refresh the relevant page data

Validation (Zod):
- Member required
- Month + Year required
- Amount > 0
- Mode required

### 5.2 Log Donation Modal

Trigger: "Log Donation" quick action button.

Fields:
- Donor (select existing member OR type-in name for external donor)
- Type (radio: Hadiya / Zakat / Other)
- Category (select: General / Medical / Scholarship / Emergency)
- Amount (number)
- Date (date picker)
- Mode (select: Bank / UPI / Cash)
- Reference (text, optional)
- Notes (textarea, optional)

Logic: If type = Zakat → account = 'zakat'. Otherwise account = 'general'.

Show an info callout when Zakat is selected:
> "Zakat contributions are posted to the restricted Zakat (GFES) account and can only be
> disbursed for eligible scholarship or zakat-eligible expenses."

On save:
1. Insert into `donations`
2. Insert into `ledger_entries` (correct account based on type)
3. Toast + refresh

### 5.3 Log Expense / Disbursal Modal

Trigger: "Log Expense" quick action button.

Fields:
- Account (select: General Account / Zakat Account)
- Category (select: Medical / Scholarship / Administrative / Amanath / Other)
- Description (text)
- Amount (number — stored as negative in ledger)
- Date (date picker)
- Reference (text, optional)
- Notes (textarea, optional)

On save:
1. Insert into `ledger_entries` (amount as negative value)
2. Toast + refresh

### 5.4 Add Member Modal

Trigger: "Add Member" button on Members page.

Fields:
- Full Name (text, required)
- Member Code (text, required, unique — suggest next sequential code)
- Email (email, optional)
- Phone (text, optional)
- Join Date (date, required, default today)
- Is BOD member? (checkbox)
- BOD Designation (text, shown only if BOD checked)

On save: Insert into `members`, refresh list, show toast.

---

## 6. Toast Notifications

Use a simple toast system. Recommendations:
- Install `sonner` (`npm install sonner`) — lightweight, works with Next.js App Router
- Add `<Toaster />` to `app/layout.tsx`

Toast patterns:
- Success: `toast.success("Subscription logged — Ahmed K., May 2025")`
- Error: `toast.error("Failed to save. Please try again.")`
- Info: `toast.info("Export feature coming in the full version")`

---

## 7. Supabase Client Setup

Create `lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

Use this client in all page components and server actions. For the preview, client-side
fetching is fine — no need for server components with Supabase SSR setup. Keep it simple.

---

## 8. File Structure

```
gsf-accounts-preview/
├── app/
│   ├── layout.tsx              ← fonts, global styles, Toaster
│   ├── globals.css             ← tailwind directives, material symbols CSS
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── members/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── subscriptions/
│   │   └── page.tsx
│   └── ledger/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   ├── ui/                     ← shadcn components (auto-generated)
│   ├── modals/
│   │   ├── LogSubscriptionModal.tsx
│   │   ├── LogDonationModal.tsx
│   │   ├── LogExpenseModal.tsx
│   │   └── AddMemberModal.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   ├── DonationBreakdownChart.tsx
│   │   ├── ExpenseAllocationChart.tsx
│   │   ├── CollectionRateChart.tsx
│   │   └── RecentActivityTable.tsx
│   ├── members/
│   │   ├── MemberRow.tsx
│   │   └── SubscriptionHistoryGrid.tsx
│   └── subscriptions/
│       └── MatrixCell.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts                ← cn(), formatCurrency(), formatDate()
├── types/
│   └── index.ts                ← Member, Subscription, LedgerEntry, Donation types
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 9. TypeScript Types

Define in `types/index.ts`:

```ts
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
```

---

## 10. Utility Functions

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format as Indian currency: ₹1,20,000
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date as "12 Dec 2024"
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMM yyyy')
}

// Get initials from full name: "Ibrahim Al-Fayed" → "IA"
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

// Map month number to short name
export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Financial year months in order (Jun → May)
export const FY_MONTHS = [6,7,8,9,10,11,12,1,2,3,4,5]
export const FY_MONTH_LABELS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May']

// Get status badge classes
export function getSubscriptionBadgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'paid': return 'bg-primary-fixed text-on-primary-fixed-variant'
    case 'due':  return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    case 'na':   return 'bg-secondary-container text-on-secondary-container'
  }
}
```

---

## 11. Key UI Details to Get Right

These are the details that will impress the board. Do not skip them.

### Currency formatting
Always use Indian formatting: `₹4,57,900` not `₹457,900`. Use `formatCurrency()` from utils.

### KPI card accent bar
Every KPI card has a 4px coloured bar at the very top (position absolute, w-full, h-1).
Colours: primary for total funds, secondary-fixed for general, tertiary-fixed for zakat,
primary-fixed-dim for medical, error-container for dues.

### Subscription matrix cell states
- Future months (no data yet): small grey dot `w-2 h-2 rounded-full bg-outline-variant/30`
- Current month: amber "D" chip with a ring: `ring-2 ring-tertiary-fixed ring-offset-2`
- Past paid: mint "P" chip
- Due: amber "D" chip
- N/A: blue-grey "N/A" pill (wider, not square)
- All cells are `cursor-pointer hover:opacity-80`

### Table hover rows
Every table row: `hover:bg-surface-container-high/50 transition-colors`
Clickable rows: `cursor-pointer`

### Amount colours in ledger
- Positive amounts: `text-primary font-medium` with `+` prefix
- Negative amounts: `text-on-error-container font-medium` with `−` prefix

### BOD badge
Appears inline next to name: small amber pill, text "BOD", `text-[10px] font-bold`

### Empty states
If a table has no data: show a centered icon (e.g. `inbox`) with "No records found" in
`text-on-surface-variant` — never show an empty table with just headers.

### Loading states
Use Tailwind `animate-pulse` skeleton placeholders while fetching from Supabase.
Don't use spinners — they look cheap. Use skeleton rectangles matching the layout.

### Sidebar active indicator
Active nav item slides right slightly: `translate-x-1` class. This is a subtle but important
detail that signals which page you're on.

---

## 12. Phase-by-Phase Build Plan

Complete each phase fully before starting the next. Commit after each phase.

---

### Phase 0 — Project Setup ✅ COMPLETE

**Goal**: Running Next.js app, deployed to Vercel, connected to Supabase.

Steps:
1. `npx create-next-app@latest gsf-accounts-preview --typescript --tailwind --app --src-dir=false --import-alias="@/*"`
2. Install dependencies:
   ```
   npm install @supabase/supabase-js sonner react-hook-form @hookform/resolvers zod 
               recharts date-fns clsx tailwind-merge
   ```
3. Install shadcn: `npx shadcn@latest init` — choose default style, neutral base colour
4. Install shadcn components needed:
   ```
   npx shadcn@latest add dialog select input label textarea checkbox
   ```
5. Configure `tailwind.config.ts` with all colour tokens from Section 2.1
6. Add Google Fonts + Material Symbols to `app/layout.tsx` `<head>`
7. Add `globals.css` with:
   - Tailwind directives
   - `.material-symbols-outlined.fill` CSS rule
   - `body { font-family: 'Inter', sans-serif; }`
8. Create `.env.local` with Supabase credentials
9. Create Supabase tables and run all seed SQL from Section 4
10. Create `lib/supabase.ts`, `lib/utils.ts`, `types/index.ts`
11. Push to GitHub, connect to Vercel, confirm deploy works
12. Visit production URL — confirm blank page with no errors

**Notes (actual)**: Scaffolded with Next.js 16 + Tailwind v4 (latest). Colour tokens configured
via `@theme inline` in `globals.css` (Tailwind v4 CSS approach, no tailwind.config.ts needed).
shadcn v4 components installed. All lib/types files created.
Steps 8–12 (Supabase + GitHub + Vercel) require manual action — see manual steps below.

**Commit message**: `feat: project setup, supabase schema, seed data`

---

### Phase 1 — Layout Shell + Login ✅ COMPLETE

**Goal**: Login page works, sidebar renders on all authenticated pages.

Steps:
1. Build `/login` page — centered card, Foundation logo, email+password fields
2. Hardcode auth check: if email=`treasurer@gsf.demo` AND password=`demo123`, set
   `localStorage.setItem('gsf_demo_authed', 'true')` → redirect to `/dashboard`
3. Build `components/layout/Sidebar.tsx`:
   - Fixed left sidebar, h-screen, w-72
   - Logo area with GS initials circle
   - Nav links with Material Symbols icons
   - Active state detection via `usePathname()`
   - Quick Action button (gradient, placeholder onClick)
4. Build `components/layout/PageHeader.tsx` — receives title and description props
5. Create a `DashboardLayout` wrapper component that includes Sidebar and auth check
6. Wrap all app pages (dashboard, members, subscriptions, ledger) with this layout
7. Test: login → dashboard, sidebar shows, nav links work, refresh stays logged in

**Commit message**: `feat: login page, sidebar layout, auth guard`

---

### Phase 2 — Dashboard ✅ COMPLETE

**Goal**: Dashboard loads with live Supabase data and working charts.

Steps:
1. Fetch members, ledger_entries, subscriptions counts from Supabase on page load
2. Build `KpiCard.tsx` component — accent bar, label, value, optional trend chip
3. Render 5 KPI cards in bento grid layout (see Section 3, Page 2)
4. Build `DonationBreakdownChart.tsx` — Recharts PieChart/RadialChart with donut shape
   - Data: Hadiya 60%, Zakat 25%, Other 15% (hardcode for preview — add legend)
   - Colours: primary, primary-fixed-dim, secondary-fixed
5. Build `ExpenseAllocationChart.tsx` — same donut style
   - Data: Scholarship 45%, Medical 35%, Admin 20%
   - Colours: secondary, tertiary-fixed, surface-variant
6. Build `CollectionRateChart.tsx` — Recharts BarChart
   - Data: Sep 60, Oct 75, Nov 85, Dec 92 (hardcode for preview)
   - Fill: primary-fixed-dim for older months, primary for latest
7. Build `RecentActivityTable.tsx` — fetch last 5 ledger_entries, render table
8. Add Quick Action buttons (Log Subscription / Log Donation / Log Expense)
   - These open modals — add basic modal shells (content can be empty for Phase 2)
   - The modals will be filled out in Phase 4

**Commit message**: `feat: dashboard with kpi cards, charts, recent activity`

---

### Phase 3 — Members Directory + Profile ✅ COMPLETE

**Goal**: Members list loads from Supabase, member profile page works.

Steps:
1. `/members` page:
   - Fetch all members from Supabase ordered by code
   - Build search: filter members client-side by name, code, email
   - Render each member as a ledger-row card (see Section 3, Page 3)
   - Click member row → navigate to `/members/[id]`
   - Add Member button → opens AddMemberModal shell
2. `/members/[id]` page:
   - Fetch member by id from Supabase
   - Fetch their subscriptions for current FY
   - Back button with arrow_back icon → `/members`
   - Profile identity card (left column)
   - KPI cards: calculate Total Contributed and Outstanding Dues from subscriptions
   - 12-month subscription history grid (SubscriptionHistoryGrid component)
   - Recent donations table (fetch from donations table, handle empty state)

**Commit message**: `feat: members directory and member profile page`

---

### Phase 4 — Subscription Tracker ✅ COMPLETE

**Goal**: Full P/D/N/A matrix renders, clicking a cell is meaningful.

Steps:
1. Fetch all active members from Supabase
2. Fetch all subscriptions for selected FY (default current year)
3. Build matrix: rows = members sorted by code, columns = FY_MONTHS
4. For each cell: look up subscription record for that member+month+year
5. Render correct MatrixCell component based on status
6. Future months: show grey dot
7. Current month: highlight with ring
8. Year selector dropdown (2023-24, 2024-25) — refetch on change
9. Click a 'due' or empty cell → open LogSubscriptionModal pre-filled with member+month
10. Click a 'paid' cell → show a small popover with paid date, amount, ref (use shadcn Popover)
11. "Mark all as paid" button → show confirmation toast "Feature coming in full version"
12. Legend at bottom of card

**Commit message**: `feat: subscription tracker matrix with interactive cells`

---

### Phase 5 — General Ledger ✅ COMPLETE

**Goal**: Ledger table loads, filters work.

Steps:
1. Fetch ledger_entries from Supabase ordered by date desc, limit 20
2. Render table with columns from Section 3, Page 6
3. Amount formatting: green `+₹X` for positive, red-ish `−₹X` for negative
4. Category filter: client-side filter on category field
5. Current balance KPI card in top right (sum all general account entries)
6. Export buttons → `toast.info("Export feature coming in the full version")`
7. Pagination: simple Prev/Next buttons, show "Showing X to Y of Z entries"

**Commit message**: `feat: general ledger table with filters and pagination`

---

### Phase 6 — Working Modal Forms ✅ COMPLETE

**Goal**: All three log modals write to Supabase and the UI refreshes.

Steps:
1. `LogSubscriptionModal.tsx`:
   - Member searchable select (fetch members list)
   - Month + Year selects
   - Amount (default 300), Date, Mode, Reference, Notes
   - On submit: upsert subscriptions + insert ledger_entries
   - On success: close modal, refresh page data, toast success
   - Zod schema + React Hook Form validation
2. `LogDonationModal.tsx`:
   - Donor select (members) or free-text donor name
   - Type radio (Hadiya / Zakat / Other) — Zakat shows info callout
   - Category, Amount, Date, Mode, Reference, Notes
   - On submit: insert donations + insert ledger_entries (correct account)
   - Success toast + refresh
3. `LogExpenseModal.tsx`:
   - Account select, Category select, Description, Amount, Date, Reference
   - On submit: insert ledger_entries (negative amount)
4. `AddMemberModal.tsx`:
   - Name, Code (suggest next available), Email, Phone, Join Date
   - BOD checkbox + Designation field
   - On submit: insert into members, refresh list

**Commit message**: `feat: working modal forms with supabase writes and validation`

---

### Phase 7 — Polish Pass ✅ COMPLETE

**Goal**: Everything looks exactly right for the board meeting.

Steps:
1. Verify every colour matches the design system tokens exactly
2. Verify all fonts are loading — headline pages use Plus Jakarta Sans, body uses Inter
3. Verify currency amounts use Indian formatting everywhere (₹4,57,900 not ₹457,900)
4. Verify amount colours in ledger (green positive, error-container negative)
5. Verify skeleton loading states on all data-fetching pages
6. Verify empty states on all tables
7. Verify toast notifications appear and dismiss correctly
8. Test full flow: Login → Dashboard → Log Subscription → See it in Ledger → Check Tracker updated
9. Test: Dashboard → Members → Click member → See their history
10. Fix any console errors or TypeScript errors
11. Check Vercel production build — fix any build errors
12. Final commit and push — confirm production URL works

**Commit message**: `polish: final ui fixes, loading states, production ready for board demo`

---

## 13. Demo Script (For the Board Meeting)

Prepare to walk through this sequence. Rehearse it at least once before the meeting.

**Step 1 — Login** (30 seconds)
Open the URL. Show the login screen. Enter `treasurer@gsf.demo` / `demo123`. Click sign in.

**Step 2 — Dashboard** (2 minutes)
Point out: "This is what the Treasurer sees every morning. Total funds at the top — ₹4,57,900.
General account here, Zakat account here — always separate, always visible at a glance.
The outstanding dues figure here — ₹40,750 from 24 members — replaces a manual count
from the Excel sheet. These charts update automatically as transactions are logged."

**Step 3 — Log a subscription live** (2 minutes)
Click "Log Subscription". Select a member (e.g. Khalid Ansari, code 0009 who has dues).
Select the current month. Set amount ₹300, mode UPI. Click Save.
"You just saw what the Treasurer does when a member pays. That payment is now recorded
in the ledger, the dashboard updates, and the subscription tracker updates."

**Step 4 — Subscription Tracker** (2 minutes)
Navigate to Subscriptions. "This is the digital version of your current Excel tracker.
Every member, every month, one view. Green means paid. Amber means due.
Click on a cell to see the details of that payment."
Show Khalid Ansari's row — the month just paid should now show green.

**Step 5 — Members Directory** (1 minute)
Navigate to Members. "Every Foundation member, searchable, with their status and BOD role."
Click on Ibrahim Al-Fayed. "Each member has a full profile — their contribution history,
outstanding dues, and the 12-month payment grid."

**Step 6 — General Ledger** (1 minute)
Navigate to Ledger. "This replaces the GSF General AC sheet. Every transaction
in chronological order, with the running balance. Filterable by category and date."

**Step 7 — Close** (30 seconds)
"Everything here maps directly to your current Excel workbook — Subscription Tracker,
General Account, GFES/Zakat Account, Members list. The difference is it's always
up to date, accessible from any phone or laptop, and the Ameer and the full Board
can log in at any time to see exactly where the Foundation's finances stand."

---

## 14. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel environment variables (add in Vercel dashboard under Project → Settings → Environment Variables)
# Add the same two variables above for Production, Preview, and Development environments
```

---

## 15. Package.json Dependencies Reference

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@supabase/supabase-js": "^2",
    "sonner": "^1",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "recharts": "^2",
    "date-fns": "^3",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "class-variance-authority": "^0.7",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-checkbox": "latest"
  }
}
```

---

## 16. Things to Avoid

- **Do not build mobile responsiveness** — board demo is on desktop, save time
- **Do not implement real auth** — hardcoded demo login is enough
- **Do not build PDF/Excel export** — toast the user instead
- **Do not build the Zakat ledger page separately** — ledger page filters are enough for now
- **Do not build the Medical Assistance Log** — not in scope for preview
- **Do not build the Reports page** — not in scope for preview
- **Do not add dark mode** — design is light mode only for preview
- **Do not use `any` TypeScript types** — use the types defined in Section 9
- **Do not inline styles** — always use Tailwind classes
- **Do not create custom CSS files** — only `globals.css` for the tailwind directives and
  the material symbols fill rule
- **Do not use placeholder/lorem ipsum text** — use realistic Foundation data everywhere

---

## 17. Realistic Sample Data Reference

Use these member names consistently everywhere (member list, ledger descriptions, modals):
```
0001 — Ibrahim Al-Fayed    (BOD — President/Ameer)
0002 — Fatima Rahman       (BOD — Treasurer)
0003 — Ahmed Siddiqui      (BOD — Secretary)
0004 — Zainab Malik
0005 — Omar Hussain
0006 — Mariam Khan
0007 — Yusuf Patel
0008 — Aisha Begum
0009 — Khalid Ansari       (has outstanding dues — good for demo)
0010 — Ruqayyah Shaikh     (inactive)
```

Transaction categories to use in ledger:
- Subscription / Monthly
- Hadiya / General
- Hadiya / Emergency
- Zakat / Inflow
- Medical / Disbursal
- Scholarship / GFES Payout
- Amanath / Saving Scheme

Foundation name: **GSF** (Global Stewardship Foundation — or whatever the actual name is;
use "GSF" in the app header and "Project GSF" as the brand name in the sidebar)

---

*End of CLAUDE.md*
*Version 1.0 — Board Preview Build — April 2026*
