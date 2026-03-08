# NibbleNet

> **A network for sharing extra food.**
> Built by **Fantastic Fantosa Corporations**

NibbleNet is a mobile-first, web-based social impact marketplace that reduces food waste while making food and groceries more affordable and accessible. It connects approved local food providers with nearby consumers looking for discounted surplus meals, baked goods, produce, groceries, and more.

---

## Team

| Name | Role |
|---|---|
| Alexis Santosa | Full-stack development, product design, architecture |
| Siyu Fan | Full-stack development, analytics & AI insights |

---

## Why NibbleNet

| Stat | Source |
|---|---|
| 80 million tons of food wasted per year in the US | USDA |
| $408 billion worth of food waste annually | ReFED |
| 40 million Americans food insecure | Feeding America |
| 8% of global greenhouse gas emissions from food waste | UNEP |
| Average restaurant wastes ~$10,000 of food per year | Waste360 |

Every NibbleNet transaction simultaneously reduces food waste, makes food more affordable, and decreases the carbon footprint of food decomposition.

---

## What Makes NibbleNet Different

| Feature | NibbleNet | Typical Surplus Apps |
|---|---|---|
| Real cloud database (Supabase) | ✓ Live | Usually none |
| Unified account (consumer + provider) | ✓ | Usually separate |
| Household provider support | ✓ | Rarely |
| 4-step provider safety approval | ✓ | Usually none |
| Allergen-aware auto-filtering | ✓ Built into account | Filter afterthought |
| Live distance-sorted feed | ✓ Haversine + geolocation | Rarely |
| Food condition + freshness data | ✓ | Rarely |
| Pickup confirm-or-cancel right | ✓ Consumer right | Usually none |
| Community Pantry / free listings | ✓ | Rarely |
| Provider analytics + AI insights | ✓ | Rarely |
| AI chatbot assistant | ✓ | Rarely |
| Google Maps pickup integration | ✓ | Rarely |

---

## Live Database

NibbleNet is connected to a **real Supabase backend** (PostgreSQL + Auth). Real user accounts and live food listings are stored in the cloud.

| Detail | Value |
|---|---|
| Provider | Supabase |
| Project | `nibblenet` — West US (North California) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth — email/password |
| Tables | `profiles`, `listings`, `reservations` |
| Dashboard | [supabase.com/dashboard/project/mankfjoscqgghddhhmnv](https://supabase.com/dashboard/project/mankfjoscqgghddhhmnv) |

### Data Mode

The app operates in two modes depending on environment configuration:

| Mode | Condition | Behavior |
|---|---|---|
| **Live mode** | `NEXT_PUBLIC_SUPABASE_URL` is set | Real sign-up/login, listings saved to DB, feed shows live data first |
| **Mock mode** | Env vars absent | All data from `src/lib/mock-data.ts`, no DB or network required |

In live mode the consumer feed shows **real listings first**, then a "Sample Listings · Demo" section with mock data so the feed never appears empty before providers post.

### Database Schema

See [`supabase-schema.sql`](./supabase-schema.sql) for the full schema:
- `profiles` — extends Supabase auth, stores provider status + approval state
- `listings` — all food listing fields, linked to `auth.users`
- `reservations` — consumer reservations with confirmation codes
- Row Level Security (RLS) on all tables
- Auto-create profile trigger on user sign-up
- Indexes on `status`, `provider_id`, `created_at`

---

## Account Model

NibbleNet uses a **single unified account system**. There are no separate "consumer" or "provider" account types.

- Every user signs up with one account
- All accounts can browse, search, and reserve listings by default
- Any account can begin the **Become a Provider** application
- Provider capabilities are unlocked after completing a 4-step safety and verification process
- The same account retains all consumer features after becoming a provider
- Approved providers can switch between **Consumer Mode** and **Provider Mode** via a mode switcher strip

### Provider Status

| Status | Description |
|---|---|
| `none` | Standard consumer access (default for all new accounts) |
| `pending` | Application submitted, under review |
| `approved` | Full provider capabilities unlocked; mode switching enabled |
| `rejected` | Application denied; can resubmit |

---

## Supported Provider Types

- **Restaurant / Food Service**
- **Grocery Store / Market**
- **Household / Home Cook** — unique to NibbleNet, with the same safety compliance framework as businesses

---

## Provider Onboarding Flow

Provider access is a gated capability — not a separate account type.

1. **Identity authentication** — legal name, date of birth, ID type
2. **Provider type selection** — restaurant, grocery, or household
3. **Integrity and safety agreement** — acknowledgment of prohibited items
4. **Food safety fine print** — food handling standards, allergen disclosure, consumer inspection right

---

## Trust & Safety

- **Provider gating** — listing creation locked until 4-step approval completes
- **Integrity agreement** — every provider explicitly acknowledges prohibited items
- **Food safety acknowledgment** — covers all food types and handling standards
- **Pickup inspection right** — consumers can inspect and cancel at pickup
- **Allergen tags** — required on all listings; auto-suppressed for sensitive users
- **Food condition + freshness** — providers specify condition, prep time, and handling notes
- **One-tap reporting** — any listing can be reported; creates a moderation record

---

## Allergen-Aware Filtering

Users save allergy and sensitivity preferences in their profile:

`Peanuts · Tree Nuts · Dairy · Eggs · Shellfish · Soy · Gluten · Sesame`

- The home feed **automatically suppresses** listings containing a saved allergen
- A banner shows how many listings were hidden, with a link to manage preferences
- Search lifts allergen suppression so discovery is never fully blocked

---

## Provider Analytics & AI Insights

Approved providers have access to a **Reports dashboard** (built by Siyu Fan):

- Revenue metrics (daily, weekly totals)
- Top-selling items and peak pickup hours
- Daily trend charts
- **AI-generated recommendations** via Featherless AI (Llama 3.1)
  - Identifies best-performing listing types
  - Suggests optimal pickup time windows
  - Highlights waste-reduction opportunities

---

## Demo Credentials

One shared demo account covers both consumer and provider experiences.

| Field | Value |
|---|---|
| Email | `demo@nibblen.com` |
| Password | `demo123` |

The demo account has `providerStatus: 'approved'` pre-configured. You can browse the consumer feed, manage reservations, switch to provider mode, post listings, and view the analytics dashboard — all from a single login.

> **Note:** The demo account always uses local mock data (not the live database), so it works without Supabase configured.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Auth + Database | Supabase (PostgreSQL + Auth) |
| State | React Context + useReducer |
| Persistence | Supabase (live) / localStorage (mock fallback) |
| Maps | Google Maps JavaScript API (`@react-google-maps/api`) |
| Geolocation | Browser API + Haversine distance formula |
| AI Chatbot | Featherless AI — Llama 3.1-8B-Instruct |
| AI Insights | Featherless AI — provider analytics recommendations |
| Images | Unsplash CDN |
| Testing | Playwright |

---

## Local Setup

```bash
git clone https://github.com/as4ntosa/nibblenet.git
cd nibblenet
npm install
```

### Option A — Mock mode (no database required)

```bash
npm run dev
```

Runs entirely on local mock/sample data. No environment setup needed. Use `demo@nibblen.com` / `demo123` to log in.

### Option B — Live mode (real accounts + live listings)

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Get your credentials from **supabase.com → Project Settings → API**.
To set up a new project, run [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase SQL editor.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Enables live auth + database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase public API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Enables map views (falls back gracefully) |

Open [http://localhost:3000](http://localhost:3000)

```bash
npm run build    # Production build
npm run lint     # ESLint
```

---

## Project Structure

```
src/
├── app/
│   ├── (consumer)/        # Home feed, search, listing detail, reservations, profile
│   ├── (provider)/        # Dashboard, listings CRUD, create listing, reports
│   ├── api/report/        # AI insights API route (Featherless)
│   ├── become-a-provider/ # Provider landing page
│   ├── provider-apply/    # 4-step provider onboarding form
│   ├── provider-pending/  # Pending approval status + demo approval
│   ├── login/             # Unified sign-in / sign-up (Supabase + mock)
│   └── onboarding/        # City + zip setup after sign-up
├── components/
│   ├── ui/                # Button, Input, Badge, Modal primitives
│   ├── layout/            # IPhoneFrame, BottomNav, ProviderNav, ModeSwitcher
│   ├── listing/           # ListingCard, AllergenChips
│   ├── map/               # ListingsMap, PickupMap (Google Maps)
│   ├── reservation/       # ReservationCard
│   └── ChatBot.tsx        # AI assistant (Featherless API)
├── context/
│   ├── AuthContext.tsx    # Supabase auth + localStorage fallback
│   └── DataContext.tsx    # Live listings (Supabase) + mock fallback, reservations
├── hooks/
│   └── useGeolocation.ts  # Browser geolocation with permission state
├── lib/
│   ├── supabase.ts        # Supabase client + DB↔type converters
│   ├── mock-data.ts       # Demo users, listings, reservations
│   ├── mock-orders.ts     # Mock order history for analytics
│   ├── analytics.ts       # Revenue, trends, peak hours engine
│   └── utils.ts           # Distances, formatters, constants
├── types/
│   └── index.ts           # Shared TypeScript types
└── supabase-schema.sql    # Full DB schema with RLS + triggers
```

---

## Roadmap

### ✅ Shipped (MVP)
- Real Supabase database — live sign-up, login, and listing storage
- Unified account with consumer/provider mode switching
- 4-step provider safety approval flow
- Consumer feed with allergen-aware auto-filtering
- Location-based listing discovery (Haversine + geolocation)
- Food condition + freshness data on every listing
- Live distance on listing detail with Google Maps pickup map
- Surprise Boxes and Rescue Bundles
- Reservation system with confirm-or-cancel pickup
- Impact counter (meals rescued, CO₂ saved)
- AI chatbot assistant (NibbleNet Assistant)
- Provider analytics dashboard with AI insights
- iOS-style preview frame on desktop

### 🔜 Next (Post-MVP)
- Real identity verification (Stripe Identity or Persona)
- Stripe Connect payment processing
- Provider reviews and ratings
- Community Pantry mode (free / donation listings)
- Sponsor-a-Meal philanthropic pledge layer
- Pro subscription tier ($19/mo)
- Image uploads (Cloudinary)

### 📱 Later (Mobile)
- React Native / Expo iOS app sharing business logic
- Push notifications (Expo Push + Web Push)
- Multi-language support
- Multi-city impact dashboard

---

## Impact Metrics

NibbleNet tracks and displays local impact on the home screen:

- **Meals rescued** — total confirmed pickups in the city this week
- **CO₂ saved** — meals × 2.5 kg average per meal equivalent
- **Active providers** — verified providers with live listings
- **Community pantry meals** — free/donation listings claimed

---

## License

MIT

---

*NibbleNet — A network for sharing extra food.*
*Fantastic Fantosa Corporations · 2026*
