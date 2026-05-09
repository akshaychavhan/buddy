# Infra_09_Retarget_future_scope_for_web

## Goal
`FUTURE_SCOPE.md` describes 5 V2 features in detail (OCR receipts, smart packing, document vault, buddy network, RBAC). Today the tech approach for each assumes a mobile app — `expo-camera`, `expo-document-picker`, `react-native-pdf`, FAB UI patterns. We're surgically retargeting each section so the *features stay* but the implementation notes match a Next.js web app.

## Summary

**Files at a glance**

| Group     | Files                                              |
| --------- | -------------------------------------------------- |
| Plan doc  | `plans/Infra_09_Retarget_future_scope_for_web.md`  |
| V2 playbook | `FUTURE_SCOPE.md`                                |

**What you'll run / what you'll see**

| Command                                          | What it does                                          |
| ------------------------------------------------ | ----------------------------------------------------- |
| Open `FUTURE_SCOPE.md`                           | Same 5 V2 features, web-shaped tech approach + UI sketches. |
| `grep -niE 'expo\|react native\|FAB' FUTURE_SCOPE.md` | Empty. ✅                                            |

> Pure docs commit — no code touched.

## Commands
```bash
# Audit pass after the rewrite:
grep -niE 'expo|react native|expo-camera|expo-document-picker|FAB' FUTURE_SCOPE.md
```

## Files changed
- `plans/Infra_09_Retarget_future_scope_for_web.md` — **created**: this file.
- `FUTURE_SCOPE.md` — **edited**: surgical pass through each of the 5 features. Tech-approach sections retargeted (Cloud Vision still applies; on-device OCR → browser-side Tesseract.js or skip; `react-native-pdf` → `<embed>` or `react-pdf`; `expo-document-picker` → `<input type="file">`). UI sketches retargeted (FAB → header button or modal trigger; bottom sheet → modal dialog; native viewer → in-app PDF preview). Architectural notes section also updated (TanStack Query offline → service-worker-based caching). Status legend, feature index, recommended order — kept as-is.

## Verification
1. Open `FUTURE_SCOPE.md` — first feature (Quick-Add Expense via Camera) tech approach mentions cloud OCR + Tesseract.js, no `expo-camera`.
2. Run `grep -niwE 'expo|react native|nativewind|mmkv' FUTURE_SCOPE.md` → empty. ✅
3. Run `grep -niE 'FAB|bottom sheet|expo-document-picker' FUTURE_SCOPE.md` → empty. ✅
4. CI on this branch stays green (docs-only).

## Gotchas / decisions
- **Features kept, all 5.** The product vision doesn't change because we picked web. Receipt OCR, packing suggestions, document vault, buddy network, and RBAC are all just as valuable in a web app.
- **Some implementations get simpler on web.** File pickers (browser-native), PDF preview (`<embed>` or `react-pdf`), modal forms (Headless UI / Radix Dialog) are easier than their mobile equivalents — fewer custom libraries.
- **Some get harder.** Camera-based capture: `getUserMedia()` works but UX is rougher than `expo-camera`'s document detection. Web push: needs HTTPS + service worker; Safari iOS requires the user to install the PWA first.
- **The on-device OCR option is now Tesseract.js** instead of `expo-text-recognition`. Cloud OCR (Google Vision, Claude Vision) still applies unchanged — those are server-side regardless of frontend.
- **Architectural notes** at the bottom now describe **service-worker pre-cache** + the existing Cloudinary/Better Auth/feature-flag scaffolding as the V1 → V2 enablers (instead of TanStack Query persistence).
