# Day 1 — Installation: Tooling Checklist

> **Created:** 2026-04-30
> **Phase:** 1 — Foundations
> **Mode:** Quick reference checklist (env already set up — confirming, not installing)

---

## 🎯 What Are We Learning?

The minimum tools required on your machine + phone to run an Expo project, and the **one-line verification command** for each.

You already confirmed your dev environment is set up. This doc is a defensive checklist — run each command, confirm the expected output, and we move on. If anything fails, that becomes Bug #01 and we slow down.

---

## 🤔 Why Does This Matter?

90% of Day 1 failures for RN newcomers are **tooling failures**, not code failures:
- Wrong Node version → Metro won't start
- Phone + laptop on different Wi-Fi networks → QR scan succeeds but app never loads
- Old global `expo-cli` installed → conflicts with the modern bundled CLI

Catching these now means we don't waste mental cycles debugging environment issues mid-feature.

---

## 🧠 How It Works (The Concept)

Three layers of tooling:

```
1. Your dev machine          →  Node, Git, npm/npx (ships with Node)
2. The Expo CLI              →  bundled with `npx`, no global install
3. Your phone                →  Expo Go app from App Store / Play Store
4. The network connecting    →  same Wi-Fi LAN (or `--tunnel` fallback)
```

That's it. No SDK installs, no environment variable juggling. Expo Go is the runtime — it's already preloaded with everything the managed workflow can call.

---

## ✅ Verification Checklist

Run each command. Confirm the expected output. Tick the box.

### 1. Node 20+

```bash
node --version
```

**Expected:** `v20.x.x` or higher (Expo SDK 51+ requires Node 18+; we recommend 20 LTS).

- [ ] Node ≥ 20.x

### 2. Git

```bash
git --version
```

**Expected:** any modern version (`git version 2.x.x`).

- [ ] Git installed

### 3. npx works

```bash
npx --version
```

**Expected:** ships with Node, should print a version. We use `npx` to invoke `create-expo-app` and `expo` without globals.

- [ ] npx works

### 4. No legacy global Expo CLI

```bash
npm list -g --depth=0 | grep expo-cli || echo "clean"
```

**Expected:** prints `clean`. If you see `expo-cli@x.x.x`, uninstall it: `npm uninstall -g expo-cli` — it conflicts with the modern bundled CLI.

- [ ] No legacy `expo-cli` global

### 5. Expo Go on phone

You said this is installed. Just confirm:

- 📱 **iOS:** App Store → search "Expo Go" → install
- 🤖 **Android:** Google Play → search "Expo Go" → install

Open the app once. You'll see a "Recently used" list (probably empty). Leave it open for Day 1.

- [ ] Expo Go installed and opened on phone

### 6. Same Wi-Fi network

The most common Day-1 footgun. Your **dev laptop** and your **phone** must be on the **same** Wi-Fi network. Corporate Wi-Fi often has "client isolation" enabled, which blocks LAN traffic between devices — Metro can't reach the phone, QR scan loads forever.

If you suspect this, the fallback is `npx expo start --tunnel` — pipes traffic through Expo's servers via ngrok-style tunnel. Slower (~2× build) but works through any network including cellular.

- [ ] Phone + laptop on same Wi-Fi (or accept `--tunnel` fallback)

---

## 🔄 React / Next.js Parallel

| Concern | Next.js dev | Expo dev |
|---|---|---|
| Runtime | `node` | Expo Go on phone |
| Dev server | `next dev` (Webpack/Turbopack) | `npx expo start` (Metro) |
| Connection | `localhost:3000` in your browser | QR code → phone scans → Metro serves bundle over LAN |
| Restart trigger | edit any file → HMR | edit any file → Fast Refresh |

The mental shift: in web dev your "device" is a tab on the same machine. In RN dev your "device" is a separate physical phone. Hot reload still works — just over the network instead of localhost.

---

## 🛠️ Optional Tooling (Skip for Day 1)

These are **not** required to ship Buddies V1. Skip them until you actually need them:

- **🤖 Android Studio** — only for the Android emulator. Real phone via Expo Go is faster.
- **📱 Xcode** — macOS only, for iOS simulator. Same logic — physical phone is faster on Day 1.
- **EAS CLI** — `npm i -g eas-cli` — only for production cloud builds. Day 15 / V2 territory.
- **Watchman** — file watcher; macOS users on `brew install watchman`. Often improves Metro reliability but Expo runs fine without it.

---

## ⚠️ Gotchas & Beginner Mistakes

- **`zsh: command not found: expo`** after running `expo start` directly → you're trying to use the legacy global. Use `npx expo start` instead.
- **QR scan loads forever** → 95% of the time, it's the Wi-Fi issue. Drop to `npx expo start --tunnel`.
- **iOS Expo Go won't scan the QR from terminal** → 📱 iOS uses the camera app (not Expo Go's scanner) for QR codes. Open Camera, point at QR, tap the banner. (Android: scan from inside Expo Go.)
- **Apple Silicon Mac + old Node** → if Node was installed via Rosetta you may hit native module mismatches. Reinstall via `nvm` and use Node 20 LTS arm64 build.

---

## 🧪 Quick Quiz

1. Why don't we install `expo-cli` globally anymore?
2. What is the fallback if your phone and laptop can't talk over LAN?
3. What's the minimum Node version Expo SDK 51+ requires?
4. Do you need Xcode or Android Studio to start Day 1? Why or why not?

---

## 📌 Key Takeaways

- Verify Node 20+, Git, and Expo Go on phone — that's the entire Day 1 toolchain.
- `npx expo` is the modern way; never `npm install -g expo-cli`.
- Same Wi-Fi or `--tunnel`. There is no third option.
- Optional tools (emulators, EAS) are deferred until we actually need them.

---

## 🔗 References

- [Expo — Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment/)
- [Expo Go on the App Store](https://apps.apple.com/app/expo-go/id982107779)
- [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## ➡️ What's Next?

Once every box above is ticked, proceed to [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) to create the Expo project.
