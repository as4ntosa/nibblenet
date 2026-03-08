# NibbleNet

> **A network for sharing extra food.**

NibbleNet is a web-first social impact marketplace that reduces food waste and makes food more affordable by connecting approved local providers with nearby consumers who want surplus, discounted, or soon-to-expire food.

Restaurants, bakeries, grocery stores, cafes, markets, food trucks, and even **households** can list surplus items — after completing a safety-first provider verification process.

---

## Why NibbleNet

- **1/3 of all food produced globally is wasted** (FAO)
- **44 million Americans** face food insecurity (USDA)
- Existing platforms focus on businesses. NibbleNet is the first to include households with the same safety compliance framework.
- Every rescued meal saves an estimated **2.5 kg CO₂ equivalent**

---

## What Makes NibbleNet Different

| Feature | NibbleNet | Typical Competitors |
|---------|-----------|---------------------|
| Household providers with safety compliance | ✅ | ❌ |
| Allergy-aware discovery (feed filtering) | ✅ | ❌ |
| Pickup inspection rights (built into provider agreement) | ✅ | ❌ |
| Unified account — provider access as capability unlock | ✅ | ❌ |
| Rescue Bundles with allergen disclosure | ✅ | Partial |
| Impact counter (meals rescued, CO₂ offset) | ✅ | Rare |
| Dignity-first copy — never "charity food" | ✅ | Varies |

---

## Account Model

Every NibbleNet user creates **one account**. There is no separate provider or consumer account type at sign-up.

| Status | Access |
|--------|--------|
| `none` | Browse listings, search, reserve items, manage allergy profile |
| `pending` | Provider application submitted — awaiting review |
| `approved` | Full provider access — create and manage listings |
| `rejected` | Application denied — may reapply |

Provider access is a **capability earned on the same account**, not a separate login.

---

## Provider Verification Flow

Before posting any food, users complete a 4-step application attached to their existing account:

**Step 1 — Provider Type**
Choose from: Restaurant, Grocery Store, Bakery / Cafe, Household, or Other Food Business.

**Step 2 — Identity & Verification Details**
- Businesses: business name, address, optional license number
- Households: contact name and home address (kept private, never shown publicly)

**Step 3 — Safety & Integrity Policy**
Read and acknowledge prohibited items: illegal substances, tampered food, falsified expiry dates, unsafe or contaminated items, misleading listings. Violations result in immediate removal.

**Step 4 — Food Safety Acknowledgement**
Agree to food handling standards covering cooked foods, raw foods, packaged groceries, and perishables. Providers must acknowledge that **consumers can inspect and decline items at pickup** — and must accept such cancellations without dispute.

> In the prototype, applications can be instantly approved via a **"Simulate Approval"** button on the pending screen.

---

## Allergy & Sensitivity Filtering

Users set an allergy profile in account settings:
peanuts · tree nuts · dairy · eggs · shellfish · soy · gluten · sesame

**Behavior:**
- **Home feed:** Listings containing saved allergens are automatically hidden. An active filter banner shows how many are suppressed.
- **Search:** No allergen suppression — full results appear so users can make informed decisions.
- **Listing cards:** All allergens are shown as chips on every card and detail page.

---

## Consumer Pickup Inspection

NibbleNet gives consumers a formal right to inspect food at pickup:

- Consumers may inspect items before accepting
- If the item doesn't match the listing or appears unsafe, they may **cancel on-site at no charge**
- Providers agree to this during onboarding and cannot dispute such cancellations
- Reservation detail page shows **"Confirm Pickup"** and **"Item doesn't match"** buttons

---

## Rescue Bundles

Providers can list **Rescue Bundles** — mystery surplus boxes at steep discounts. Unlike generic mystery bags, NibbleNet requires **full allergen disclosure** on every bundle. Consumers know what they can't eat, even if they don't know exactly what's inside.

---

## Key Features

### For All Users (Consumers)
- Browse nearby listings sorted by distance
- Filter by category and cuisine tags
- Full-text search with price range filters
- Allergy & sensitivity profile — hides matching listings from home feed
- Reserve items with quantity picker, receive a confirmation code
- Inspect items at pickup — cancel on-site if item doesn't match
- Confirm pickup or report issues from reservation history
- View real-time impact metrics (meals rescued, CO₂ offset)

### For Approved Providers
- Create and manage listings with photos, pricing, allergen tags, and pickup windows
- Provider dashboard with stats: active listings, total reservations
- Rescue Bundle listing type for mystery surplus boxes
- Real-time listing status: available → sold out as reservations come in

---

## Tech Stack

- **Next.js 14+** (App Router, Turbopack)
- **React 18** with Context API + `useReducer`
- **Tailwind CSS 3.4** with custom green brand palette
- **Lucide React** icons
- **TypeScript**
- No backend — all data is mocked and persisted via `localStorage`
- Geolocation via browser `navigator.geolocation` API with Haversine distance calculation

**Production path:** Supabase (Auth + Postgres + PostGIS + Storage), Mapbox for map view, Stripe for payments, Expo + React Native for iOS.

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm run lint
npx playwright test   # E2E screenshots
```

---

## Demo Account

| Email | Password |
|-------|----------|
| demo@nibblen.com | demo123 |

The demo account starts as a standard consumer with no provider status.

**To experience the full provider flow:**
1. Go to **Profile**
2. Tap **Become a Provider**
3. Complete the 4-step application
4. On the pending screen, tap **Simulate Approval**
5. You will be redirected to the provider dashboard with full listing creation access

---

## Project Structure

```
src/
├── app/
│   ├── (consumer)/         # All-user routes (home, search, listing, reservations, profile)
│   ├── (provider)/         # Approved-provider-only routes (dashboard, listings, create)
│   ├── become-a-provider/  # Provider program intro page
│   ├── provider-apply/     # 4-step application form
│   ├── provider-pending/   # Pending approval screen
│   ├── login/
│   ├── onboarding/
│   └── page.tsx            # Landing / splash
├── components/
│   ├── layout/             # BottomNav (consumer), ProviderNav, IPhoneFrame
│   ├── listing/            # ListingCard (with allergen chips + rescue badge), FilterSheet
│   ├── reservation/        # ReservationCard (with confirm/cancel-at-pickup)
│   └── ui/                 # Button, Input, Modal, Badge
├── context/
│   ├── AuthContext.tsx     # User session, provider status, allergy profile
│   └── DataContext.tsx     # Listings, reservations, allergen filtering, pickup actions
├── hooks/
│   └── useGeolocation.ts   # Browser Geolocation API wrapper
├── lib/
│   ├── mock-data.ts        # 13 listings with allergen tags, rescue bundle, single demo user
│   └── utils.ts            # Helpers, ALLERGENS constant, haversineKm
└── types/
    └── index.ts            # User, Listing, Reservation, ProviderStatus, Allergen types
```

---

## Roadmap

- **Admin review panel** — real provider application review workflow
- **Stripe payment integration** — in-app payment at reservation
- **Real identity verification** — Stripe Identity or equivalent
- **Map view** — Mapbox + PostGIS, visualize nearby providers
- **Push notifications** — listing updates, reservation confirmations
- **Provider ratings** — consumer reviews after successful pickups
- **iOS / mobile app** — Expo + React Native with shared business logic
- **Community partner program** — food banks, universities, senior centers
- **Corporate sponsorship dashboard** — sponsor-a-meal program at scale
- **Sponsor-a-Meal** — users or businesses fund listings for community members

---

## Branding

**NibbleNet** = *A network for sharing extra food.*

The name reflects a connected community — a "net" of neighbors, businesses, and households sharing small amounts ("nibbles") of surplus food. Green-first brand palette emphasizes sustainability, freshness, and community trust. Copy never uses "charity," "donation," or "cheap" — it's always "surplus," "rescue," and "share."

---

## Screenshots

### Consumer
| Landing | Login | Home Feed | Search |
|---------|-------|-----------|--------|
| ![Landing](public/screenshots/01-landing.png) | ![Login](public/screenshots/02-login.png) | ![Home](public/screenshots/03-consumer-home.png) | ![Search](public/screenshots/04-search.png) |

| Listing Detail | Reservations | Profile |
|----------------|--------------|---------|
| ![Listing](public/screenshots/05-listing-detail.png) | ![Reservations](public/screenshots/06-reservations.png) | ![Profile](public/screenshots/07-consumer-profile.png) |

### Provider
| Dashboard | Listings | Create Listing |
|-----------|----------|----------------|
| ![Dashboard](public/screenshots/08-provider-dashboard.png) | ![Listings](public/screenshots/09-provider-listings.png) | ![Create](public/screenshots/10-create-listing.png) |
