# Day 1 — Project Setup: Why Expo

> **Created:** 2026-04-30
> **Phase:** 1 — Foundations

---

## 🎯 What Are We Learning?

What **Expo** is, what the **managed workflow** gives us, and why we're choosing it over the bare React Native CLI for Buddies.

In one sentence: **Expo is a framework and platform built on top of React Native that handles the painful native build/config plumbing for you, so you can write a real cross-platform mobile app in TypeScript and ship it to a real phone in 90 seconds.**

---

## 🤔 Why Does This Matter?

To build a React Native app, you have two starting points:

| Path | Command | What you get |
|---|---|---|
| **Bare React Native CLI** | `npx react-native init` | A raw `ios/` Xcode project + `android/` Gradle project. You manage native builds yourself. |
| **Expo (managed)** | `npx create-expo-app` | A pure JS/TS project. Expo runs the native build for you in the cloud (EAS) or via Expo Go. |

For a **solo developer learning RN from Day 1**, bare RN means fighting CocoaPods, Gradle, Xcode signing certificates, and the Android NDK *before* you write a single screen. Expo eliminates that — you literally don't open Xcode or Android Studio for V1.

The trade-off: you can't drop in arbitrary custom native modules without "ejecting" (now called **prebuild**). For Buddies V1, every module we need (camera, maps, notifications, file system, image picker) is supported out-of-the-box by Expo. So managed wins.

---

## 🧠 How It Works (The Concept)

### The bridge model — the most important mental shift

Web React renders to the **DOM**. React Native renders to **native UI primitives** — actual `UIView` on iOS and `android.view.View` on Android.

```
Your TypeScript code (JS thread)
        │
        │  serialized messages
        ▼
   ── BRIDGE ──   (or in newer RN: JSI direct calls)
        │
        ▼
   Native runtime (UIKit on iOS / Android Views)
```

There is no DOM, no `window`, no `document`. When you write `<View>`, RN translates that to a real native view. When you write `<Text>`, it becomes a real `UILabel` / `TextView`.

### What "managed" means

In Expo's managed workflow:
- You write **only** `App.tsx` and JS/TS code
- Expo **owns** the native projects (you don't see `ios/` or `android/` folders)
- A single binary called **Expo Go** (free app on the App Store / Play Store) is preloaded with all of Expo's supported native modules
- Your JS bundle is shipped to Expo Go over your local Wi-Fi via the Metro bundler
- For real production builds: **EAS Build** runs the native build in the cloud and gives you `.ipa` / `.aab` files

### Why this is a superpower for learning

- **No Xcode / Android Studio for Day 1.** Just `npx expo start` → scan QR → app on phone in 30 seconds.
- **Hot reload** is rock-solid. Edit `App.tsx`, hit save, see the change on your phone instantly.
- **Same JS code runs on both iOS and Android.** Platform differences (e.g. shadow APIs) we'll learn on Day 2.

---

## 🔄 React / Next.js Parallel

This is the **single most important parallel** for you to internalize today:

> **Next.js is to React what Expo is to React Native.**

Both are opinionated frameworks built on top of a more primitive library, providing routing, build pipelines, dev server, and "batteries included" defaults so you can stop yak-shaving and start building features.

| Concept | Next.js (Web) | Expo (Mobile) |
|---|---|---|
| Underlying library | React | React Native |
| Bare alternative | Plain CRA / Vite + React | `npx react-native init` |
| Build/dev server | Next.js dev server (Webpack/Turbopack) | Metro bundler |
| Routing | App Router / Pages Router | Expo Router (Day 3) |
| Deployment platform | Vercel | EAS (Expo Application Services) |
| Hot reload | Fast Refresh | Fast Refresh |
| Env vars convention | `NEXT_PUBLIC_*` exposed to client | `EXPO_PUBLIC_*` exposed to client |

Just like you'd never start a serious Next.js project with raw React + custom Webpack, you shouldn't start a serious RN project with bare RN CLI unless you have a specific reason.

---

## 💻 Tiny Isolated Example

This is the **smallest possible Expo + TypeScript app** — three files. Day 1's deliverable is essentially this:

```tsx
// App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello Buddies 🧳</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '600' },
});
```

Note three things that are different from web React:
1. `<View>`, not `<div>`
2. `<Text>` is **mandatory** — you cannot put raw text outside a `<Text>` (RN throws). More on this in [day1_rn_vs_react.md](./day1_rn_vs_react.md).
3. Styles use `StyleSheet.create({...})` — JS objects, not CSS strings. `flex: 1` ≠ `flex: 1` in CSS exactly (defaults differ — Day 2).

---

## 🚀 Applied to Buddies

Day 1's task doc applies this directly:
> See: [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md)

We'll create the Expo TS project under `apps/mobile/` (the repo is already set up as a monorepo) and render a "Hello Buddies" screen on a real phone via Expo Go.

---

## ⚠️ Gotchas & Beginner Mistakes

- **Don't `npm install -g expo-cli`.** That's the legacy CLI. The modern flow uses `npx expo` and `npx create-expo-app` — bundled, always up-to-date, no global pollution.
- **Phone + computer must be on the same Wi-Fi network** for Expo Go's LAN tunnel to work. If you're on corporate Wi-Fi with client isolation, fall back to `npx expo start --tunnel` (slower but works through any network).
- **Managed ≠ permanent jail.** If you ever need a custom native module in Buddies V2, you can run `npx expo prebuild` to eject into a bare project — your JS code stays the same.
- **🤖 Android emulator vs 📱 iOS simulator** are *optional* on Day 1. We're using a real phone via Expo Go, which is faster and more representative.

---

## 🧪 Quick Quiz

1. What is the difference between Expo's managed workflow and a bare React Native CLI project?
2. What plays the role of "Vercel" in the Expo ecosystem?
3. Why don't we need to open Xcode or Android Studio on Day 1?
4. If your `<Text>Hello</Text>` worked but `<View>Hello</View>` crashed, why?
5. What environment variable prefix exposes a value to the Expo client at build time? (Hint: parallel to `NEXT_PUBLIC_*`.)

---

## 📌 Key Takeaways

- **Expo is to React Native what Next.js is to React.** Opinionated framework, batteries included, you focus on features.
- The **bridge** translates your JS calls into native UI operations — there is no DOM.
- **Expo Go** + Metro bundler = your phone is a live dev environment over Wi-Fi.
- For Buddies V1, every module we need is in Expo's managed set. Zero reason to go bare.

---

## 🔗 References

- [Expo Documentation — Get started](https://docs.expo.dev/get-started/introduction/)
- [Expo vs React Native CLI (official comparison)](https://docs.expo.dev/workflow/expo-go/)
- [React Native — The bridge / new architecture (Hermes + JSI)](https://reactnative.dev/architecture/overview)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## ➡️ What's Next?

Continue to [day1_installation.md](./day1_installation.md) to verify your machine is ready, then [Task 01 — Project Scaffolding](../task/01_project_scaffolding.md) to actually create the project.
