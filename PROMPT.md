# 🧳 Buddies — Trip Planner Mobile App | Master Build & Learning Prompt

> **Tagline:** Plan trips. Travel together. Remember everything.
> **Use this prompt with:** Cursor IDE (with Claude as the model)
> **Mode:** Teach-first learning + self-documenting project
> **Audience:** A 4+ year React/Next.js developer learning React Native from Day 1

---

## 0. Who I Am & How I Want to Work

I'm a **Full Stack Developer with 4+ years of experience** in React, Next.js, Node.js, MongoDB, and Prisma. **Zero prior React Native experience.** I want to build a real, production-quality cross-platform mobile app called **Buddies** — a trip planner built for groups of friends — while learning React Native properly from the ground up.

### My Learning Style — Read This Carefully

For **EVERY** concept, feature, library, or decision, you must explain in this exact order:

1. **WHAT** it is — definition in plain English
2. **WHY** we need it — what problem it solves, why this approach over alternatives
3. **HOW** we implement it — step-by-step with code

Never skip any of the three. Even for things that seem obvious. I'm a beginner in React Native — assume nothing is obvious to me in this ecosystem.

### Always Compare to React / Next.js

Whenever there's a parallel to web React or Next.js, call it out explicitly:
> *"In React you'd write `<div onClick={…}>`. In React Native you write `<Pressable onPress={…}>` because mobile doesn't have click events — only touch events."*

This is the fastest way for me to learn — by anchoring new concepts to what I already know.

---

## 1. 📚 THE DOCUMENTATION SYSTEM (Critical — Read & Follow Always)

**Every session, every concept, every bug, every task gets documented.** Non-negotiable.

### Folder Structure (Create This First in Day 1)

```
buddies/
├── app/                      # Expo Router screens
├── components/
├── ...
├── FUTURE_SCOPE.md           # V2 features playbook (separate doc)
└── docs/
    ├── README.md             # Master index — auto-update as new docs are added
    ├── learning/             # Concept lessons, one per topic
    │   ├── day1_setup.md
    │   ├── day1_installation.md
    │   └── ...
    ├── bug/                  # Every bug encountered, sequentially numbered
    │   ├── 01_metro_bundler_fails.md
    │   └── ...
    └── task/                 # Every feature/task, sequentially numbered
        ├── 01_project_scaffolding.md
        └── ...
```

### Naming Conventions (Strict)

- **Learning docs:** `dayN_<snake_case_topic>.md` — multiple per day allowed
- **Bug docs:** `NN_<snake_case_short_description>.md` — sequential, zero-padded
- **Task docs:** `NN_<snake_case_feature_name>.md` — sequential, zero-padded

### When to Create Each Doc Type

| Trigger | Doc Type | Action |
|---|---|---|
| Starting a new concept/lesson | Learning | Create BEFORE writing code, fill in WHAT/WHY/HOW upfront |
| Encountering any error/bug (even small) | Bug | Create immediately when bug appears; update with solution after fixing |
| Starting a new feature/task | Task | Create at task kickoff; update progressively as work continues |

### Master Index (`docs/README.md`)

Auto-maintain. Whenever you create a new doc, also add a line to `docs/README.md`.

```markdown
# Buddies — Documentation Index

## 📘 Learning Journal
- [Day 1 — Project Setup](./learning/day1_setup.md)
- ...

## 🐛 Bug Journal
- [Bug 01 — Metro bundler fails to start](./bug/01_metro_bundler_fails.md)
- ...

## 📋 Task Journal
- [Task 01 — Project Scaffolding](./task/01_project_scaffolding.md)
- ...

## 🔮 Future Scope
- See [FUTURE_SCOPE.md](../FUTURE_SCOPE.md) for V2 features playbook
```

---

## 2. 📄 Doc Templates — Use These Exactly

### 2.1 Learning Doc Template (`/docs/learning/dayN_topic.md`)

```markdown
# Day N — <Topic Name>

> **Created:** YYYY-MM-DD
> **Phase:** <Phase number/name>

---

## 🎯 What Are We Learning?
## 🤔 Why Does This Matter?
## 🧠 How It Works (The Concept)
## 🔄 React / Next.js Parallel

| React (Web) | React Native |
|---|---|
| `<div>` | `<View>` |
| `onClick` | `onPress` |

## 💻 Tiny Isolated Example
```tsx
// Smallest possible runnable code
```

## 🚀 Applied to Buddies
> See: [Task NN — <feature>](../task/NN_feature.md)

## ⚠️ Gotchas & Beginner Mistakes
## 🧪 Quick Quiz
## 📌 Key Takeaways
## 🔗 References
## ➡️ What's Next?
```

### 2.2 Bug Doc Template (`/docs/bug/NN_description.md`)

```markdown
# Bug NN — <Short Description>

> **Date:** YYYY-MM-DD
> **Severity:** 🔴 Critical / 🟡 Major / 🟢 Minor
> **Status:** 🔄 Open / ✅ Resolved
> **Time to fix:** <e.g., 30 mins>

---

## 🐛 What Happened?
### Error Message / Stack Trace
## 🎯 What I Was Trying to Do
> See: [Task NN — <feature>](../task/NN_feature.md)
## 🔍 Steps to Reproduce
## 🧪 What I Tried (That Didn't Work)
## 💡 Root Cause
## ✅ Solution
## 🤔 Why This Happened (Deep Dive)
> Related concept: [Day N — <topic>](../learning/dayN_topic.md)
## 🛡️ How to Avoid Next Time
## 🔗 References
```

### 2.3 Task Doc Template (`/docs/task/NN_feature_name.md`)

```markdown
# Task NN — <Feature Name>

> **Started:** YYYY-MM-DD
> **Completed:** YYYY-MM-DD
> **Status:** 📝 Planning / 🔄 In Progress / ✅ Done / ⏸️ Blocked
> **Phase:** <Phase number/name>

---

## 🎯 Goal
## 📖 User Story
## ✅ Acceptance Criteria
- [ ] Works on iOS and Android
- [ ] TypeScript-strict, no `any`
- [ ] Theme-aware (light + dark)
- [ ] Localized (no hardcoded English)

## 🛠️ Tech Decisions
### Decision 1: <choice>
- **Why:** <reasoning>
- **Alternatives considered:** <other options>
- **Trade-offs:** <what we gave up>

## 📋 Implementation Plan
## 🧠 Concepts Used (Links to Learning Docs)
## 📁 Files Created / Modified
## 💻 Code Highlights
## 🧪 How I Tested It
## 🐛 Bugs Encountered During This Task
## 📸 Screenshots
## ➡️ What's Next? (Follow-ups)
```

---

## 3. The App I'm Building — Buddies

A cross-platform mobile trip planner built around the idea that **the best trips happen with friends**. Group trips, shared expenses, and shared memories are first-class citizens.

### Core Features (V1)

1. **Trip Management with Smart Categorization** ⭐
   - Trips automatically categorized as **Past / Active / Upcoming / Drafts**
   - Home screen tabs/segmented control to filter
   - Hero card showing countdown to next upcoming trip ("Goa in 12 days 🏝️")
   - "Active now" badge with subtle animation for trips happening today
   - Drafts: save trip without dates required, promote to full trip later

2. **Invite Buddies via Email** ⭐ NEW
   - Trip owner invites buddies by email address
   - Recipient gets an email with a deep link to join the trip
   - If recipient has Buddies installed → opens app and shows accept/decline screen
   - If not → email links to a landing page that prompts them to install
   - Pending invitations visible in trip's members section
   - Re-send invitation, revoke pending invitation

3. **Places to visit** with Google Maps deep-link

4. **Place Insights from Web** ⭐
   - Each place auto-fetches a summary from Wikipedia (history, significance, photos)
   - Tied to user's preferred language
   - "Learn About This Place" section on place detail screen

5. **Photos** per place (gallery + camera)

6. **Activities** at each place — title, price, priority, status

7. **Expenditure tracking** per place and per trip

8. **Target budget** vs spent dashboard

9. **Packing checklist** with templates

10. **Staying plans** (hotels/airbnb/etc.)

11. **Food plans** (restaurants, must-try dishes)

12. **Group trips + bill splitting** (the heart of "Buddies")

13. **Itinerary Day View — Timeline** ⭐ NEW
    - For each trip, show a vertical timeline grouped by day
    - Each day card displays: stays for that night, planned places (sorted by time), activities, meals, expenses summary
    - Smooth scrollable view with sticky day headers
    - Tap any item to jump to its detail screen
    - "Today" highlight when viewing during the trip
    - This is the showcase screen — the one users will screenshot and share

14. **Offline Mode** ⭐ NEW
    - Per-trip toggle: "Make available offline"
    - When enabled: pre-cache trip data, all photos, place insights, member info
    - Network status indicator in app header (subtle)
    - All read operations work offline; mutations queue and sync on reconnect
    - "Last synced X mins ago" stamp on trip dashboard
    - Storage usage per trip ("Goa trip — 128 MB cached")
    - Settings option to clear offline data per trip

15. **Reminders** with local notifications

16. **Language + theme** (i18n + light/dark)

17. **Travel music** (curated + local files)

### Future Features

See [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md) for the V2 playbook covering:
- Quick-add expense via camera (OCR)
- Smart packing suggestions based on destination + dates
- Receipts + documents vault per trip
- Buddy network (long-lived travel buddy connections)
- Trip invitation with roles (full RBAC)
- AI travel assistant chat
- Language translator
- Picture pose suggestions

---

## 4. Tech Stack (Locked)

### Mobile App
- **React Native via Expo** (managed workflow, latest SDK)
- **TypeScript strict mode**
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind for RN)
- **Zustand** for client state
- **TanStack Query** for server state, with `@tanstack/react-query-persist-client` for offline cache
- **React Hook Form + Zod** for forms
- **MMKV** for local storage
- **i18next + react-i18next** for languages
- **NetInfo** (`@react-native-community/netinfo`) for network status detection
- Expo modules: `expo-image-picker`, `expo-camera`, `expo-location`, `react-native-maps`, `expo-notifications`, `expo-av`, `expo-haptics`, `expo-image-manipulator`, `expo-secure-store`, `expo-file-system`

### Backend
- **Next.js 14+ App Router** with API routes
- **Prisma + MongoDB**
- **Better Auth** for authentication
- **Cloudinary** for image uploads
- **Resend** ⭐ NEW — email delivery for buddy invitations (free tier: 3000 emails/month)
- **React Email** ⭐ NEW — JSX-based email templates
- **Zod** validation on every endpoint

### 🔐 Why Better Auth (Not Clerk)?

| Aspect | Better Auth | Clerk |
|---|---|---|
| Cost | **Free, open source, self-hosted** | Free tier limited |
| Stack fit | **Native Prisma + MongoDB integration** | External service |
| Mobile SDK | **`@better-auth/expo`** with SecureStore | `@clerk/clerk-expo` |
| Authorization | **Built-in admin/RBAC plugins** for V2 | Tied to plan |
| Lock-in | Zero — all data in your DB | All users on Clerk's servers |

### 📧 Why Resend + React Email (for invitations)?

- **Resend:** Modern email API, simple SDK, generous free tier (3000/month), great deliverability
- **React Email:** Write email templates as JSX components — exactly what you already know
- **Alternatives considered:** SendGrid (more setup, older API), AWS SES (cheap but config-heavy)

---

## 5. The Learning Roadmap (15 Days → 6 Phases)

> Each "Day" is a self-contained lesson + build session. Pace is flexible.

---

### 🟢 PHASE 1 — Foundations (Days 1–3)

#### **Day 1 — Setup & Mental Model Shift**

Learning docs:
- `day1_setup.md` — Why Expo, what it gives us vs bare React Native CLI
- `day1_installation.md` — Node, Expo CLI, Android Studio, Xcode, Expo Go on phone
- `day1_rn_vs_react.md` — The mental model shift: bridge, native modules, primitives
- `day1_first_screen.md` — Hello Buddies screen with styled button

**Task doc:** `01_project_scaffolding.md`

**Build:** Expo project with TypeScript, render styled "Hello Buddies" screen, run on physical phone via Expo Go.

---

#### **Day 2 — Styling, Layout, NativeWind**

Learning docs:
- `day2_styling_basics.md` — `StyleSheet.create()`, inline styles, performance
- `day2_flexbox_in_rn.md` — Flexbox-only layout, defaults differ from web
- `day2_nativewind.md` — Tailwind for RN setup
- `day2_safe_areas.md` — Notches, Dynamic Island, status bars
- `day2_shadows_platform.md` — iOS vs Android shadow APIs

**Task doc:** `02_theme_system.md`

**Build:** NativeWind setup, design tokens, reusable `<Card>` and `<Button>`, Trip Card UI.

---

#### **Day 3 — Navigation with Expo Router**

Learning docs:
- `day3_navigation_overview.md` — Stack vs Tab vs Modal patterns
- `day3_expo_router_basics.md` — File-based routing, parallels to Next.js App Router
- `day3_route_params.md` — `useRouter()`, `useLocalSearchParams()`
- `day3_deep_linking.md` — How `buddies://trip/123` works (also needed for invitations later)

**Task doc:** `03_app_navigation_shell.md`

**Build:** Full app shell — `(auth)`, `(tabs)`, `trip/[id]/...` structure.

---

### 🟡 PHASE 2 — Core App Plumbing (Days 4–6)

#### **Day 4 — Forms, Lists, Local State + Trip Categorization** ⭐

Learning docs:
- `day4_textinput_keyboard.md` — `<TextInput>` quirks, `KeyboardAvoidingView`
- `day4_react_hook_form_rn.md` — RHF + Zod in RN
- `day4_flatlist_vs_scrollview.md` — Why FlatList for any list >10 items
- `day4_pull_to_refresh.md` — `<RefreshControl>` patterns
- `day4_bottom_sheets.md` — `@gorhom/bottom-sheet` for modal forms
- `day4_zustand_in_rn.md` — Same as web, with persistence
- `day4_trip_status_logic.md` — Computed status (past/active/upcoming/draft) from dates

**Task docs:**
- `04_create_trip_flow.md` — Bottom sheet form for new trip ("Save as Draft" option)
- `05_trip_list_with_categories.md` — Home screen with segmented tabs, countdown hero card

---

#### **Day 5 — Theme System + i18n**

Learning docs:
- `day5_dark_mode.md` — `useColorScheme()`, NativeWind dark mode config
- `day5_theme_tokens.md` — Why semantic colors, never raw hex
- `day5_i18n_setup.md` — i18next in RN, locale JSON files
- `day5_mmkv_persistence.md` — Faster than AsyncStorage
- `day5_settings_screen.md` — Theme toggle, language picker UX

**Task docs:** `06_theme_and_i18n_foundation.md`, `07_settings_screen.md`

---

#### **Day 6 — Backend Setup (Next.js + Prisma + MongoDB)**

Learning docs:
- `day6_nextjs_api_for_mobile.md` — How RN talks to Next.js API
- `day6_expo_env_vars.md` — `EXPO_PUBLIC_` prefix, dev vs prod configs
- `day6_prisma_mongodb_for_buddies.md` — Schema walkthrough

**Task docs:** `08_backend_setup.md`, `09_trips_crud_api.md`

---

### 🟠 PHASE 3 — Auth + Wired Up (Day 7)

#### **Day 7 — Better Auth + TanStack Query**

Learning docs:
- `day7_better_auth_overview.md` — What it is, why over Clerk, architecture
- `day7_better_auth_server_setup.md` — Install on Next.js, `auth.ts` config, Prisma adapter, schema generation via CLI
- `day7_better_auth_expo_client.md` — `@better-auth/expo`, SecureStore, scheme config
- `day7_email_password_flow.md` — Sign-up, sign-in, sign-out flows
- `day7_protecting_routes.md` — Auth-gated `(tabs)` group, redirect to `/sign-in`
- `day7_authenticated_requests.md` — Cookies/tokens flow from RN to Next.js
- `day7_tanstack_query_rn.md` — TanStack Query setup with offline persistence (foundation for full offline mode in Day 14)
- `day7_optimistic_updates.md` — What and when

**Task docs:**
- `10_better_auth_server.md`
- `11_better_auth_expo_client.md`
- `12_protected_routes.md`
- `13_trips_crud_wired.md`

**🎉 Milestone: signed-in user creating real trips persisting to MongoDB.**

---

### 🔵 PHASE 4 — Mobile-Native Features (Days 8–10)

#### **Day 8 — Camera, Photos, Image Uploads**

Learning docs:
- `day8_permissions_in_rn.md` — Info.plist, Android manifest, runtime requests
- `day8_image_picker_vs_camera.md` — Gallery vs live capture
- `day8_image_compression.md` — Why phones produce 10MB photos
- `day8_uploading_to_cloudinary.md` — FormData, signed uploads
- `day8_image_caching.md` — `expo-image` for performance

**Task docs:** `14_places_crud.md`, `15_place_photos.md`

---

#### **Day 9 — Maps & Place Insights from Web** ⭐

Learning docs:
- `day9_react_native_maps_setup.md` — iOS/Android API keys, fallbacks
- `day9_places_autocomplete.md` — Search → lat/lng auto-fill
- `day9_markers_and_bounds.md` — Showing all trip places on one map
- `day9_deep_linking_to_google_maps.md` — Platform-specific URL schemes
- `day9_wikipedia_rest_api.md` — Wikipedia REST API, geosearch + summary, language variants
- `day9_caching_strategy.md` — Why we cache insights server-side

**Task docs:**
- `16_place_creation_with_maps.md`
- `17_trip_map_view.md`
- `18_place_insights_backend.md`
- `19_place_insights_ui.md`

**Place Insights flow:**
1. **Geosearch:** `GET https://{lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lng}&gsradius=10000&gslimit=5`
2. **Summary fetch:** `GET https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`
3. **Fallback:** title-based search if geosearch returns nothing
4. Cache in `PlaceInsight` model (per place + language combo)
5. Refresh on user-tapped button or after 30 days

---

#### **Day 10 — Local Notifications + Reminders**

Learning docs:
- `day10_notifications_overview.md` — Local vs push, why we skip push in V1
- `day10_notification_permissions.md` — iOS strict permissions flow
- `day10_scheduling_notifications.md` — Exact, recurring, time zones
- `day10_notification_handlers.md` — Foreground vs background vs tapped

**Task doc:** `20_reminders_feature.md`

---

### 🟣 PHASE 5 — Feature Buildout (Days 11–14)

#### **Day 11 — Money Features + Email Invitations** ⭐

Learning docs:
- `day11_currency_handling.md` — Multi-currency, conversion, caching rates
- `day11_charts_in_rn.md` — `victory-native` for budget visualizations
- `day11_bill_splitting_algorithm.md` — Minimum-transactions settlement
- `day11_resend_setup.md` ⭐ NEW — Resend account, API key, domain verification
- `day11_react_email_templates.md` ⭐ NEW — Building JSX email templates
- `day11_invitation_flow.md` ⭐ NEW — Token generation, deep link handling, accept/decline UX

**Task docs:**
- `21_expenses_crud.md`
- `22_budget_dashboard.md`
- `23_group_members.md`
- `24_bill_splitting.md`
- `25_settlement_view.md`
- `26_email_invitations_backend.md` ⭐ NEW
- `27_email_invitations_ui.md` ⭐ NEW

**Email Invitation flow:**
1. Trip owner taps "Invite buddy" in members section
2. Enters email + selects role (default: member)
3. Backend creates `TripInvitation` (token, email, tripId, role, expiresAt = +7 days)
4. Backend sends email via Resend with deep link: `buddies://invite/<token>` (web fallback URL too)
5. Recipient taps link
   - App installed + signed in → accept/decline screen
   - App installed + not signed in → sign in first, then accept/decline
   - App not installed → web landing page with install CTAs
6. On accept → user added as `TripMember`, invitation status updated
7. Owner sees pending/accepted/declined badges in members list
8. Owner can re-send (if pending) or revoke (if pending)

---

#### **Day 12 — Logistics Features + Music**

Learning docs:
- `day12_audio_playback.md` — `expo-av`, lock-screen controls
- `day12_haptics.md` — `expo-haptics` UX touches

**Task docs:** `28_activities.md`, `29_stays.md`, `30_meals.md`, `31_packing_checklist.md`, `32_music_player.md`

> These features all share similar CRUD patterns by now — move quickly. They feed the timeline view in Day 13.

---

#### **Day 13 — Itinerary Timeline View** ⭐ NEW (the showcase screen)

Learning docs:
- `day13_complex_layouts.md` — Vertical timelines in RN, sticky headers, custom layouts
- `day13_data_aggregation.md` — Combining places, stays, meals, activities, expenses by day
- `day13_section_list.md` — `<SectionList>` for grouped data with sticky headers
- `day13_animations_basics.md` — Reanimated 3 fundamentals for smooth interactions

**Task docs:**
- `33_itinerary_timeline_data_layer.md` — Aggregation service that builds day-by-day structure
- `34_itinerary_timeline_ui.md` — The timeline screen itself
- `35_itinerary_today_highlight.md` — "Today" auto-scroll + visual emphasis when viewing during the trip

**Timeline Screen Spec:**
- New screen at `app/trip/[id]/itinerary.tsx`
- Top tab on trip dashboard: Overview | **Itinerary** | Places | Expenses | …
- Vertical scrollable timeline with sticky day headers (Day 1, Day 2, …)
- Each day card shows in this order:
  - Stay (where you're sleeping that night)
  - Morning meals → Places visited that morning → Activities
  - Afternoon meals → Places → Activities
  - Evening meals → Places → Activities
  - Day expense summary (₹ spent today)
- Tap any item → navigate to its detail screen
- Empty day → "No plans yet — add something!"
- "Today" auto-scrolls into view when trip is active
- Subtle vertical line connecting items, with colored dots per category (place=blue, meal=orange, activity=purple, stay=green)

---

#### **Day 14 — Offline Mode** ⭐ NEW

Learning docs:
- `day14_offline_overview.md` — What "offline-first" actually means, our scope for V1
- `day14_netinfo.md` — Detecting network state with `@react-native-community/netinfo`
- `day14_query_persistence.md` — `@tanstack/react-query-persist-client` deep dive
- `day14_image_precaching.md` — `expo-image` prefetch + `expo-file-system` for explicit downloads
- `day14_mutation_queueing.md` — Queuing writes offline and replaying on reconnect
- `day14_offline_ux.md` — Visual patterns: stale data badges, sync timestamps, network banner

**Task docs:**
- `36_offline_infrastructure.md` — TanStack Query persistence + NetInfo + mutation queue
- `37_per_trip_offline_toggle.md` — "Make available offline" toggle UI + backend orchestration
- `38_offline_storage_management.md` — Per-trip storage usage display + clear cache action

**Offline Mode Spec:**
- **Three layers of offline support:**
  1. **Always-on baseline** — TanStack Query persists all queries to MMKV; recently viewed data works offline by default
  2. **Per-trip explicit download** — User toggles "Make available offline" on a trip
     - Pre-fetches: trip data, all places, all photos (via `expo-image` prefetch), place insights, members, expenses, packing items, stays, meals, reminders
     - Shows download progress
     - Marks trip with offline icon in trip list
     - Re-syncs daily when online
  3. **Mutation queue** — Writes (add expense, mark place visited, etc.) queue when offline, replay when reconnected
- **Network status indicator** — subtle banner at top of screen when offline
- **Last synced timestamp** — small label on trip dashboard
- **Storage usage** — in Settings, show per-trip cache size with "Clear" button
- **V1 scope limit:** map tile offline caching is NOT included (deferred to V2 — needs Mapbox or different map library)

---

### ⚫ PHASE 6 — Future-Proofing (Day 15)

**Task doc:** `39_v2_scaffolding.md`

Scaffold (don't build) all V2 features per [`FUTURE_SCOPE.md`](./FUTURE_SCOPE.md):
- Feature flags via `featureFlags.ts` config
- Stub screens for each future feature
- Schema sketches (commented out in Prisma) ready for migration
- Reference to FUTURE_SCOPE.md from `docs/README.md`

---

## 6. Prisma Schema (paste into Day 6, extend in Days 11 & 14)

> The User/Session/Account/Verification models follow Better Auth's required schema. Generate via `npx @better-auth/cli generate`.

```prisma
// === Better Auth Required Models ===

model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  preferredLanguage String  @default("en")
  preferredTheme    String  @default("system")

  trips             Trip[]
  sessions          Session[]
  accounts          Account[]
  invitationsSent   TripInvitation[] @relation("InvitedBy")
}

model Session {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  userId                String    @db.ObjectId
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// === Buddies App Models ===

model Trip {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  ownerId       String   @db.ObjectId
  owner         User     @relation(fields: [ownerId], references: [id])
  title         String
  description   String?
  coverImageUrl String?
  startDate     DateTime?
  endDate       DateTime?
  destination   String
  targetBudget  Float    @default(0)
  baseCurrency  String   @default("INR")
  isGroupTrip   Boolean  @default(false)
  isDraft       Boolean  @default(false)

  // ⭐ NEW — Offline mode
  isAvailableOffline Boolean   @default(false)
  lastSyncedAt       DateTime?

  members       TripMember[]
  invitations   TripInvitation[]      // ⭐ NEW
  places        Place[]
  stays         Stay[]
  meals         Meal[]
  expenses      Expense[]
  packingItems  PackingItem[]
  reminders     Reminder[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model TripMember {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  tripId    String  @db.ObjectId
  trip      Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  userId    String? @db.ObjectId
  guestName String?
  email     String?
  role      String  @default("member")
  joinedAt  DateTime @default(now())
}

// ⭐ NEW — Email invitations
model TripInvitation {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId      String   @db.ObjectId
  trip        Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  email       String
  token       String   @unique
  role        String   @default("member")
  invitedById String   @db.ObjectId
  invitedBy   User     @relation("InvitedBy", fields: [invitedById], references: [id])
  status      String   @default("pending")    // pending | accepted | declined | expired | revoked
  expiresAt   DateTime
  acceptedAt  DateTime?
  declinedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([email])
  @@index([token])
}

model Place {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId           String   @db.ObjectId
  trip             Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name             String
  description      String?
  address          String
  latitude         Float
  longitude        Float
  plannedVisitDate DateTime?
  plannedTimeSlot  String?              // morning | afternoon | evening | night — used by timeline
  priority         String   @default("medium")
  category         String
  notes            String?
  isVisited        Boolean  @default(false)
  photos           Photo[]
  activities       Activity[]
  expenses         Expense[]
  insights         PlaceInsight[]
  createdAt        DateTime @default(now())
}

model PlaceInsight {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  placeId    String   @db.ObjectId
  place      Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  language   String
  source     String   @default("wikipedia")
  title      String?
  summary    String
  imageUrl   String?
  sourceUrl  String?
  fetchedAt  DateTime @default(now())

  @@unique([placeId, language, source])
}

model Photo {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  url       String
  caption   String?
  isCover   Boolean  @default(false)
  placeId   String?  @db.ObjectId
  place     Place?   @relation(fields: [placeId], references: [id], onDelete: Cascade)
  takenAt   DateTime?
  createdAt DateTime @default(now())
}

model Activity {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  placeId     String   @db.ObjectId
  place       Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  title       String
  description String?
  price       Float    @default(0)
  currency    String   @default("INR")
  priority    String   @default("nice-to-have")
  durationMin Int?
  bookingUrl  String?
  status      String   @default("planned")
  scheduledAt DateTime?            // for timeline placement
}

model Expense {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId       String   @db.ObjectId
  trip         Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  placeId      String?  @db.ObjectId
  place        Place?   @relation(fields: [placeId], references: [id])
  amount       Float
  currency     String
  amountInBase Float
  category     String
  paidById     String?  @db.ObjectId
  splits       ExpenseSplit[]
  note         String?
  receiptUrl   String?
  date         DateTime
  createdAt    DateTime @default(now())
}

model ExpenseSplit {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  expenseId String  @db.ObjectId
  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  memberId  String  @db.ObjectId
  share     Float
}

model Stay {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId     String   @db.ObjectId
  trip       Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name       String
  type       String
  address    String
  latitude   Float?
  longitude  Float?
  checkIn    DateTime
  checkOut   DateTime
  cost       Float    @default(0)
  bookingRef String?
  bookingUrl String?
  contact    String?
  notes      String?
}

model Meal {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId        String   @db.ObjectId
  trip          Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  placeId       String?  @db.ObjectId
  name          String
  cuisine       String?
  mealType      String   // breakfast | lunch | dinner | snack — used by timeline
  date          DateTime
  estimatedCost Float    @default(0)
  mustTryDishes String[]
  dietaryNotes  String?
  isVisited     Boolean  @default(false)
  rating        Int?
  review        String?
}

model PackingItem {
  id         String  @id @default(auto()) @map("_id") @db.ObjectId
  tripId     String  @db.ObjectId
  trip       Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name       String
  category   String
  quantity   Int     @default(1)
  isPacked   Boolean @default(false)
  assignedTo String? @db.ObjectId
}

model Reminder {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId         String   @db.ObjectId
  trip           Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  dateTime       DateTime
  recurring      String   @default("none")
  priority       String   @default("medium")
  isDone         Boolean  @default(false)
  notificationId String?
}
```

---

## 7. Pacing Rules — How Cursor + Claude Should Behave

These rules apply to **every single response**:

1. **One day at a time.** Never dump multiple days in a single response.
2. **Inside a day, follow this order:**
   - Create the relevant **learning doc(s)** first with WHAT/WHY/HOW filled in
   - Pause: "Read the learning doc. Any questions before we start coding?"
   - Wait for me to confirm
   - Create the **task doc** with plan + acceptance criteria
   - Pause: "Plan look good? Approve to proceed."
   - Implement code, updating the task doc as you go
   - At the end, fill in the task doc's "How I Tested It" and "Code Highlights" sections
   - Update `docs/README.md` master index
   - End-of-day: mini-quiz + preview of next day
3. **When I hit an error:**
   - Create a **bug doc immediately** with What Happened + Trying To Do filled
   - Walk me through debugging steps — don't just hand me the fix
   - Once resolved, fill in Root Cause + Solution + How to Avoid
   - Update master index
4. **WHAT/WHY/HOW for everything.** No skipping.
5. **Always compare to React/Next.js** when there's a parallel.
6. **Call out gotchas explicitly**, especially iOS vs Android differences.
7. **Mini-quiz at end of every day** — 3–5 questions.

---

## 8. Definition of Done (every feature)

- [ ] Works on both iOS and Android
- [ ] TypeScript-strict, no `any`
- [ ] Zod-validated forms with friendly errors
- [ ] Loading + error + empty states handled
- [ ] Theme-aware (light + dark)
- [ ] Localized (no hardcoded English)
- [ ] Accessibility labels on interactive elements
- [ ] Tested manually on a real device
- [ ] **Task doc completed and linked from master index**
- [ ] **Any bugs encountered have bug docs**
- [ ] **All concepts used have learning docs**

---

## 9. Day 1 Kickoff — Your First Job

When I say **"Day 1, go"**, do these in order:

### Step 1 — Initialize
- Confirm the tech stack
- Ask any clarifying questions you have
- Wait for my green light

### Step 2 — Scaffold the docs folder FIRST
- Create `/docs` folder structure
- Create `docs/README.md` master index (with link to FUTURE_SCOPE.md)
- Note that `FUTURE_SCOPE.md` already exists at the project root
- Create the first learning doc: `docs/learning/day1_setup.md`
- Create the second learning doc: `docs/learning/day1_installation.md`
- Pause: let me read the docs and ask questions

### Step 3 — Then the project
- Create the task doc: `docs/task/01_project_scaffolding.md`
- Walk me through `npx create-expo-app buddies` step-by-step explaining every flag
- Set up TypeScript strict
- Run on my phone via Expo Go to confirm everything works
- Update master index

### Step 4 — End of Day 1
- Create `docs/learning/day1_rn_vs_react.md` summarizing what I learned
- Mini-quiz
- Preview Day 2

---

## 10. Ground Rules I Want You to Honor

- ✅ Never assume I know something specific to React Native — explain it
- ✅ Always create docs before/during work, never after as an afterthought
- ✅ When you make a tech choice, document the **alternatives you considered** and why you rejected them
- ✅ When I make a mistake or seem confused, slow down and re-explain
- ✅ When something is iOS-specific or Android-specific, label it clearly with platform icons (📱 iOS / 🤖 Android)
- ❌ Never write code without a task doc backing it
- ❌ Never let me proceed past a concept I haven't confirmed I understand
- ❌ Never solve a bug silently — always create the bug doc

---

**Ready when I am. Wait for me to say "Day 1, go."**
