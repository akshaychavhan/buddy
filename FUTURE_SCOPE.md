# 🔮 Buddies — Future Scope & V2 Features Playbook

> **Purpose:** This document captures features planned for V2 and beyond. They are NOT built in V1 but the architecture and data model should accommodate them. Each feature here is a complete brief — when you're ready to implement, you can hand the relevant section to Cursor + Claude as a self-contained task.

---

## 📖 How to Use This Document

When you're ready to implement a feature from this playbook:

1. **Read the entire feature section** below
2. **Create a task doc** in `/docs/task/` referencing this playbook section (e.g., `40_quick_add_expense_via_camera.md`)
3. **Update this doc's status** for that feature: 🔮 → 🚧 → ✅
4. **When done:** Move the feature description into the main project docs and remove from here

---

## 🏷️ Status Legend

- 🔮 **Planned** — designed, awaiting implementation
- 🚧 **In Progress** — actively being built
- ✅ **Implemented** — moved to main docs

---

## 📑 Feature Index

| # | Feature | Priority | Effort | Status |
|---|---|---|---|---|
| 1 | Quick-Add Expense via Camera (OCR) | 🔥 High | Medium | 🔮 Planned |
| 2 | Smart Packing Suggestions | 🔥 High | Low–Medium | 🔮 Planned |
| 3 | Receipts + Documents Vault per Trip | 🔥 High | Medium | 🔮 Planned |
| 4 | Buddy Network | 💎 Medium | Medium–High | 🔮 Planned |
| 5 | Trip Invitation with Roles (Full RBAC) | 💎 Medium | Medium | 🔮 Planned |

---

## ⭐ Recommended Implementation Order

Based on user value vs effort, here's the order I'd recommend tackling these:

1. **Smart Packing Suggestions** — easiest to ship, high delight, mostly rule-based logic
2. **Quick-Add Expense via Camera** — addresses biggest friction point (manual expense entry)
3. **Receipts + Documents Vault** — natural extension of existing photo upload infrastructure
4. **Trip Invitation with Roles** — builds on V1 invitations; just adds RBAC layer
5. **Buddy Network** — most complex; needs critical mass of users to feel valuable

---

# 🎯 Feature 1 — Quick-Add Expense via Camera (OCR)

> **Status:** 🔮 Planned
> **Priority:** 🔥 High
> **Effort:** Medium (~2–3 days)
> **Dependencies:** V1 Expenses feature must exist

## What

Tap a camera button on the trip dashboard, snap a receipt or restaurant bill, the app extracts the **total amount, date, and merchant name** automatically and pre-fills the expense form. User just confirms and saves.

## Why It Matters

**This is the biggest friction point in any expense tracker.** Travelers add expenses in a hurry — at the restaurant counter, in a moving auto, during checkout. Typing 4–6 fields manually is the reason 80% of expense apps get abandoned mid-trip. Snap-to-add eliminates all of that.

**User value:** Massive — turns a 30-second flow into a 3-second flow.
**Differentiation:** Most free trip planners don't have this. Splitwise Pro has it (paid tier).

## Tech Approach

Three options to evaluate when implementing:

### Option A — Cloud OCR via Google Cloud Vision API
- **Pros:** Best accuracy, handles handwriting, multi-language out of box
- **Cons:** Paid (~$1.50 per 1000 images, free tier 1000/month), needs server-side proxy to hide API key
- **Recommendation:** Best for production

### Option B — On-device OCR via `expo-text-recognition` or `react-native-text-recognition`
- **Pros:** Free, fast, privacy-friendly, works offline
- **Cons:** Lower accuracy especially on faded receipts; English-heavy
- **Recommendation:** Best for V2.0 launch, switch to cloud later if needed

### Option C — Anthropic Claude Vision API
- **Pros:** Excellent at structured extraction with prompts; handles messy receipts well
- **Cons:** Per-image cost; needs server proxy
- **Recommendation:** Worth experimenting with — could give better structured output (JSON of items)

**Recommended starting point:** Option B (on-device) for V2.0 → upgrade to Option A if accuracy issues surface.

## Data Model Changes

No schema changes required! The existing `Expense` model already has `receiptUrl`. We just populate it from the OCR'd image.

**Optional enhancement** — store extracted line items:
```prisma
// Optional V2.1 enhancement
model ExpenseLineItem {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  expenseId   String   @db.ObjectId
  expense     Expense  @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  description String
  amount      Float
  quantity    Int      @default(1)
}
```

## API Endpoints

- `POST /api/expenses/ocr-extract` — accepts image, returns `{ amount, date, merchant, currency, confidence }`
- Existing `POST /api/expenses` — already supports `receiptUrl`

## UI/UX Sketch

1. **FAB (floating action button)** on Expenses screen with camera icon
2. Tap → Camera opens (full-screen)
3. Auto-detect rectangle (like a document scanner) and capture
4. Loading overlay: "Reading your receipt…"
5. **Pre-filled expense form** appears in bottom sheet:
   - Amount: ₹1,247 *(with confidence indicator if low)*
   - Date: Today *(auto)*
   - Merchant: "Cafe Mocha" *(from OCR)*
   - Category: Food *(guessed from merchant — show suggestions)*
   - Receipt: thumbnail with "Retake" option
6. User reviews → taps Save
7. Receipt image stored in Cloudinary; URL saved on expense

## Tasks Breakdown

1. Backend: integrate OCR provider (start with on-device, server fallback)
2. Backend: `POST /api/expenses/ocr-extract` endpoint
3. Backend: merchant → category guessing (rule-based dictionary)
4. Mobile: Camera screen with document detection
5. Mobile: Loading + extraction state
6. Mobile: Pre-filled expense form variant
7. Mobile: Confidence indicators on uncertain fields
8. Mobile: Retake/cancel flows
9. Edge cases: blurry image, no receipt detected, multi-currency

## Open Questions

- Should we attempt to detect currency from receipt or always use trip's base currency?
- How to handle non-Latin scripts (Hindi/Devanagari receipts)?
- Should we OCR group-trip receipts and auto-suggest split based on items?

---

# 🎯 Feature 2 — Smart Packing Suggestions

> **Status:** 🔮 Planned
> **Priority:** 🔥 High
> **Effort:** Low–Medium (~1–2 days)
> **Dependencies:** V1 Packing checklist + Trip destination/dates

## What

When user creates a trip, suggest packing items automatically based on **destination's climate** and **trip dates**. User reviews suggestions and taps to add.

Example: "Going to Manali in December? We suggest: thermal innerwear, woolen socks, gloves, lip balm, moisturizer, ski jacket."

## Why It Matters

People forget things. A lot. The packing checklist helps but only if you remember what to add. Climate-aware suggestions remove that cognitive load entirely. Combined with destination-aware hints (mountain vs beach vs city) it feels like the app *knows* what you need.

**User value:** Very high — eliminates a nagging traveler anxiety.
**Differentiation:** Almost no Indian travel apps have this. PackPoint does it well but is paid.

## Tech Approach

Mostly **rule-based** (no AI needed) for V2.0:

1. **Get destination's climate** for trip dates:
   - Use **Open-Meteo API** (free, no key needed) historical weather for destination + month
   - Or simpler: hardcoded climate map per Indian state/city + month
2. **Map climate + duration → suggested items** via JSON config:
   ```json
   {
     "cold": ["thermal innerwear", "woolen socks", "gloves", "warm jacket", "lip balm", "moisturizer"],
     "rainy": ["umbrella", "raincoat", "waterproof shoes", "quick-dry towel"],
     "hot_humid": ["light cotton clothes", "sunscreen SPF 50", "sunglasses", "hat", "ORS"],
     "beach": ["swimwear", "flip-flops", "beach towel", "sunscreen", "after-sun lotion"],
     "trekking": ["hiking boots", "trekking pole", "first aid kit", "headlamp", "water bottle 2L"]
   }
   ```
3. **Detect destination type** by category match (beach/mountain/city/forest) — simple keyword matching on destination string + place categories already added to the trip

**V2.1 enhancement:** Use Claude API to generate richer, context-aware suggestions ("Going to Goa during monsoon? Pack a waterproof phone pouch — beach shacks are still open but it rains hard.")

## Data Model Changes

```prisma
// Add to PackingItem to mark suggested vs user-added
model PackingItem {
  // ... existing fields
  isSuggestion   Boolean  @default(false)   // ⭐ NEW
  suggestionFor  String?                    // "cold_climate" | "beach" | etc.
}
```

Optional — store user's accepted/rejected suggestions for future personalization:
```prisma
model SuggestionFeedback {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  suggestion  String
  context     String   // "cold_climate"
  action      String   // "accepted" | "rejected"
  createdAt   DateTime @default(now())
}
```

## API Endpoints

- `GET /api/trips/:id/packing-suggestions` — returns array of suggestions with reasoning
- Existing `POST /api/packing-items` — used to bulk-add accepted suggestions

## UI/UX Sketch

1. On Packing screen, if no items yet OR after user adds first item: show banner *"Get suggestions based on your trip ✨"*
2. Tap → bottom sheet opens with categorized suggestions:
   - **For cold weather (Manali, Dec):** thermal wear, gloves… *(toggle each)*
   - **For trekking activities:** hiking boots, headlamp… *(toggle each)*
   - **General travel essentials:** charger, ID copies… *(toggle each)*
3. "Add Selected (12 items)" button at bottom
4. Items added with subtle "✨ suggested" tag in the list (user can dismiss)

## Tasks Breakdown

1. Backend: climate detection service (Open-Meteo integration)
2. Backend: destination type classification (rule-based)
3. Backend: suggestion engine with JSON config
4. Backend: `GET /trips/:id/packing-suggestions` endpoint
5. Mobile: empty state + banner UI on packing screen
6. Mobile: suggestions bottom sheet with multi-select
7. Mobile: bulk-add flow + visual indicator on suggested items
8. Optional: feedback tracking for future personalization

## Open Questions

- Should we run suggestions automatically on trip creation, or only when user opts in?
- How to handle multi-destination trips (Goa → Hampi → Bangalore)?
- Should we re-suggest if dates change significantly?

---

# 🎯 Feature 3 — Receipts + Documents Vault per Trip

> **Status:** 🔮 Planned
> **Priority:** 🔥 High
> **Effort:** Medium (~2 days)
> **Dependencies:** V1 file upload infrastructure (Cloudinary already in place)

## What

A dedicated section in each trip for storing important travel documents:
- Flight tickets (PDFs)
- Hotel booking confirmations
- Visa scans
- Travel insurance documents
- Train tickets (IRCTC PDFs)
- Activity vouchers
- Passport scan (encrypted)

Categorized, searchable, and downloadable offline.

## Why It Matters

**Travelers desperately want this.** Currently they keep documents in Gmail, WhatsApp, screenshots, downloaded PDFs scattered everywhere. At the airport they're frantically searching. A trip-scoped vault solves this and works offline (combined with V1 offline mode = killer).

**User value:** Very high — solves a real travel pain point.
**Differentiation:** Few apps do this well. TripIt has it but is paid.

## Tech Approach

- **File upload:** reuse existing Cloudinary integration (extend to support PDFs, not just images)
- **PDF preview:** `react-native-pdf` or `expo-pdf` for in-app viewing
- **Offline access:** when "Make available offline" is toggled (V1 feature), pre-download all documents to `expo-file-system` document directory
- **Encryption (passport, ID docs):** AES-256 encrypt on device with user's passcode/biometric before upload
- **OCR-based search (V2.1):** extract text from PDFs/images so user can search "BLR-DEL flight" and find the ticket

## Data Model

```prisma
// ⭐ NEW — Document vault
model TripDocument {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId        String   @db.ObjectId
  trip          Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name          String                          // "Delhi-Goa flight ticket"
  category      String                          // flight | hotel | visa | insurance | id | activity | other
  fileUrl       String                          // Cloudinary URL
  fileType      String                          // pdf | image | other
  fileSizeBytes Int
  isEncrypted   Boolean  @default(false)
  notes         String?
  validUntil    DateTime?                       // expiry date for visas, insurance
  uploadedById  String   @db.ObjectId
  createdAt     DateTime @default(now())

  @@index([tripId, category])
}
```

Update `Trip` model:
```prisma
model Trip {
  // ... existing
  documents     TripDocument[]    // ⭐ NEW
}
```

## API Endpoints

- `POST /api/trips/:id/documents` — multipart upload (file + metadata)
- `GET /api/trips/:id/documents` — list, optionally filtered by category
- `GET /api/trips/:id/documents/:docId` — get single doc with signed URL
- `DELETE /api/trips/:id/documents/:docId`
- `PATCH /api/trips/:id/documents/:docId` — update name, category, notes

## UI/UX Sketch

1. New top tab on Trip dashboard: Overview | Itinerary | Places | **Documents** | Expenses | …
2. Documents screen:
   - Categorized sections: Tickets / Hotels / IDs / Insurance / Other
   - Each item shows: icon, name, category badge, file size, validity (if any)
   - Tap → in-app PDF/image viewer
   - Long-press → share, download, delete
3. **FAB** "Upload document"
4. Upload flow: pick file → enter name → select category → optional expiry → upload
5. **Expiry alerts:** if visa/insurance expires within 30 days, badge shows on dashboard
6. **Offline indicator:** docs available offline (when trip is downloaded) show download icon

## Tasks Breakdown

1. Backend: TripDocument model + migration
2. Backend: upload endpoint with multer / formidable + Cloudinary PDF support
3. Backend: list/get/update/delete endpoints
4. Backend: signed URL generation for private docs
5. Mobile: Documents screen with category sections
6. Mobile: Upload flow (file picker via `expo-document-picker`)
7. Mobile: PDF viewer integration
8. Mobile: Image viewer for non-PDF docs
9. Mobile: Encryption flow for sensitive docs (V2.1 — optional)
10. Mobile: Expiry tracking + dashboard badges
11. Mobile: Offline pre-download integration with V1 offline mode
12. Mobile: Search across docs (V2.1)

## Open Questions

- Should Cloudinary be the right host for sensitive docs (passports)? Consider AWS S3 with KMS encryption for V2.1.
- Allow group members to upload docs to shared trips, or only owner?
- Auto-categorization via filename patterns ("flight_BLR_GOA.pdf" → category: flight)?

---

# 🎯 Feature 4 — Buddy Network

> **Status:** 🔮 Planned
> **Priority:** 💎 Medium
> **Effort:** Medium–High (~3–4 days)
> **Dependencies:** Multiple existing trips with same group members

## What

Long-lived "travel buddy" relationships that persist beyond a single trip. When you've traveled with someone twice or more, they become a "buddy" in your network. The app surfaces:
- Trip history with each buddy
- Quick-invite buddies to new trips (1-tap, no typing email)
- Shared memories/stats ("You and Rohan have been on 4 trips together — 3 mountain destinations")
- Buddy-specific settlement summary across trips

## Why It Matters

**This is the feature that makes "Buddies" earn its name.** It transforms the app from "trip planner" to "travel social network for friends." Once users have a few buddies in their network, the friction to plan another trip drops to near zero. Big retention play.

**User value:** Compounds over time — first trip is meh, fourth trip is "I love this app."
**Differentiation:** Nothing in this space does it well. Could be Buddies' core moat.

## Tech Approach

- **Buddy relationship** = directed/bidirectional graph between users
- **Auto-promotion:** after a user has been a `TripMember` on the same person's trip 2+ times, auto-suggest making them a buddy (with consent prompt to both)
- **Buddy list** is per-user; mutual confirmation needed (like LinkedIn connections)
- **Privacy:** buddies see your shared trip history, not all your trips

## Data Model

```prisma
// ⭐ NEW — Long-lived buddy relationships
model Buddy {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  user        User     @relation("UserBuddies", fields: [userId], references: [id])
  buddyUserId String   @db.ObjectId
  buddyUser   User     @relation("BuddyOf", fields: [buddyUserId], references: [id])
  status      String   @default("pending")     // pending | confirmed | blocked
  initiatedBy String   @db.ObjectId            // userId who initiated
  confirmedAt DateTime?
  createdAt   DateTime @default(now())

  @@unique([userId, buddyUserId])
  @@index([userId])
}
```

Update `User` model:
```prisma
model User {
  // ... existing
  buddies          Buddy[]   @relation("UserBuddies")
  buddyOf          Buddy[]   @relation("BuddyOf")
}
```

## API Endpoints

- `GET /api/buddies` — list confirmed buddies
- `GET /api/buddies/suggestions` — auto-suggested based on trip history
- `POST /api/buddies` — initiate buddy request `{ buddyEmail | buddyUserId }`
- `PATCH /api/buddies/:id/confirm` — accept request
- `PATCH /api/buddies/:id/decline` — reject
- `DELETE /api/buddies/:id` — remove
- `GET /api/buddies/:id/shared-trips` — list trips taken together
- `GET /api/buddies/:id/stats` — totals: trips together, places visited, expenses split

## UI/UX Sketch

1. **New tab** in main bottom tab bar: Trips | Buddies | Music | Profile
2. **Buddies tab** layout:
   - Top section: "Your travel buddies" — horizontal scroll of avatars with names
   - Each buddy → tap → buddy detail screen with:
     - "You've been on 3 trips together" stat
     - List of shared trips (chronological)
     - "Plan a new trip with [Name]" button
     - "Settlement: ₹0 / they owe you ₹450"
3. **Suggestions section:** "You might want to add as buddies" — shows people you've shared 2+ trips with but aren't buddies yet
4. **Pending requests** badge on tab icon
5. **In Create Trip flow:** invite buddies with checkboxes (no email typing) → still creates `TripInvitation` but pre-fills email

## Tasks Breakdown

1. Backend: Buddy model + migration
2. Backend: buddy suggestion algorithm (count shared trips)
3. Backend: all buddy endpoints
4. Backend: stats aggregation queries
5. Backend: notification triggers when someone sends/accepts request
6. Mobile: Buddies tab + main list view
7. Mobile: Buddy detail screen with shared trips + stats
8. Mobile: Suggestions section + accept/decline flow
9. Mobile: Quick-invite buddies flow in Create Trip
10. Mobile: Buddy avatars throughout the app (member chips, splits, etc.)
11. Mobile: Settings — block/remove buddy

## Open Questions

- Should buddy status be public or only visible to that buddy? Privacy-first → only mutual.
- Should we auto-promote (with consent) after N shared trips, or always require manual request?
- How to surface buddies to a user who has zero trip history yet (cold start)?

---

# 🎯 Feature 5 — Trip Invitation with Roles (Full RBAC)

> **Status:** 🔮 Planned
> **Priority:** 💎 Medium
> **Effort:** Medium (~2 days)
> **Dependencies:** V1 Email Invitations (already supports roles in schema, just doesn't enforce them)

## What

Promote the V1 invitation system from "everyone is a member" to a full **role-based access control** system:

- **Owner** — created the trip, full control
- **Admin** — can edit any trip data, invite/remove members, but can't delete trip or transfer ownership
- **Member** — can edit places, add expenses, mark visited, but can't remove other members or change trip settings
- **Viewer** — read-only access (great for parents, partners who aren't going but want to see plans)

UI surfaces role badges, permissions enforced on backend, role changes audited.

## Why It Matters

**Group trips with mixed dynamics need this.** Imagine a 12-person Goa trip — you don't want every member able to delete others' expenses or remove buddies. Owner + 2 admins managing logistics, members contributing expenses, parents added as viewers to follow along — clean, structured, no chaos.

**User value:** Critical for groups >5 people; nice-to-have for smaller groups.
**Differentiation:** Most consumer trip apps treat groups as flat — Buddies wouldn't.

## Tech Approach

- Use **Better Auth's admin/RBAC plugin** (already a planned V2 path in V1)
- Backend permission middleware on every trip-scoped endpoint
- Role can be changed only by owner (or admins, configurable)
- Audit log: who changed whose role, when

## Data Model Changes

V1 schema already supports this (`TripMember.role` exists). We just enforce it.

Add audit log:
```prisma
// ⭐ NEW — Role change audit
model RoleChangeAudit {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  tripId        String   @db.ObjectId
  targetUserId  String   @db.ObjectId
  oldRole       String
  newRole       String
  changedById   String   @db.ObjectId
  reason        String?
  createdAt     DateTime @default(now())

  @@index([tripId])
}
```

## API Endpoints

- Existing trip endpoints — extend with permission checks
- `PATCH /api/trips/:id/members/:memberId/role` — change role
- `GET /api/trips/:id/role-audit` — audit log (owners + admins only)
- `POST /api/trips/:id/transfer-ownership` — transfer to another member

**Permission matrix:**

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View trip data | ✅ | ✅ | ✅ | ✅ |
| Add/edit places | ✅ | ✅ | ✅ | ❌ |
| Add expenses | ✅ | ✅ | ✅ | ❌ |
| Edit any expense | ✅ | ✅ | ❌ (only own) | ❌ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ | ❌ |
| Edit trip settings | ✅ | ✅ | ❌ | ❌ |
| Delete trip | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

## UI/UX Sketch

1. **Members section** of trip:
   - Each member shows role badge (👑 Owner / ⭐ Admin / 👤 Member / 👁 Viewer)
   - Tap member → action sheet (only if you have permission): Change Role / Remove
2. **Invitation flow** (extends V1):
   - Email input + role selector (default: Member)
   - Helper text below each role explaining what it can do
3. **Role-restricted actions** show subtle disabled state with tooltip: "Only admins can do this"
4. **Audit log** screen accessible from trip settings (owners + admins): timeline of role changes
5. **Transfer ownership** flow: in trip settings, big warning, requires confirmation

## Tasks Breakdown

1. Backend: install + configure Better Auth admin/RBAC plugin
2. Backend: permission middleware factory
3. Backend: apply middleware to all trip-scoped endpoints
4. Backend: role-change endpoints + audit logging
5. Backend: ownership transfer flow
6. Mobile: role badges on member chips throughout app
7. Mobile: extended invitation flow with role selector + helper text
8. Mobile: role change action sheet
9. Mobile: disabled states with tooltips for restricted actions
10. Mobile: audit log screen
11. Mobile: ownership transfer screen
12. Migration: backfill `role = "owner"` for trip creators in existing data

## Open Questions

- Should "Member" be able to edit only their own expenses, or any expense? (Common point of debate)
- Should "Viewer" see settlement amounts (sensitive financial info)? Configurable?
- What happens to a removed member's expenses? Delete? Reassign? Keep?
- Should there be a "Co-owner" role for trips planned by couples?

---

## 🧭 Architectural Notes for V1 → V2 Transition

When V1 ships, these things are already in place that make V2 features faster:

✅ **Email invitations** — extending to role selection is trivial
✅ **TripMember.role field** — exists from Day 1
✅ **TanStack Query offline persistence** — extending to documents/buddies is plug-and-play
✅ **Cloudinary integration** — extending to PDFs needs minor config
✅ **Better Auth schema** — admin/RBAC plugin is one config change away
✅ **Feature flags scaffolding** — every V2 feature can be enabled per user/cohort

---

## 📝 Status Tracking

> Update this section as features move through the lifecycle

| Date | Feature | Status Change | Notes |
|---|---|---|---|
| YYYY-MM-DD | (template) | 🔮 → 🚧 | Started implementation |
| YYYY-MM-DD | (template) | 🚧 → ✅ | Shipped in v1.x.x |

---

## 🤝 How to Add New Future Features to This Doc

When you have a new idea for V2+, add it here using this template:

```markdown
# 🎯 Feature N — <Name>

> **Status:** 🔮 Planned
> **Priority:** 🔥 High / 💎 Medium / 🌱 Low
> **Effort:** Low / Medium / High
> **Dependencies:** <list V1 features needed>

## What
## Why It Matters
## Tech Approach
## Data Model Changes
## API Endpoints
## UI/UX Sketch
## Tasks Breakdown
## Open Questions
```

---

**This document is a living playbook — keep it updated as priorities shift and learnings accumulate.**
