# Invictus

I built this app because I wanted one place to track everything I'm working on — physical training, combat sports, and daily cognitive discipline — without juggling spreadsheets or generic fitness apps that don't fit how I actually train. It's personal. The name is Latin for "unconquered."

---

## What it does

- **Structured workout sessions** for two separate training tracks: a 4-day bodyweight body program and a 4-day boxing/Muay Thai shadow training program. Each day has its own exercise sequence, phase structure (warmup, main, abs, cooldown), and rest timers.
- **Four exercise rendering modes**: reps (including bilateral side-by-side flow), timed countdowns, circuit training (45s work / 15s rest cycling through 5 exercises × 3 rounds), and boxing rounds (configurable work/rest timer).
- **Exercise demos** for all body exercises play as looped MP4 videos in-session.
- **Schedule tracking**: the app remembers which training day you're on for both programs and advances automatically at the end of each session.
- **Daily cognitive journal** with five structured sections covering attention drift, impulse tracking, environmental observation, thinking quality, and a daily alignment check.
- **Anchored reading log** — a compression form for recording what you read with a word count cap to force brevity.
- **Daily to-do list** with priority flagging, inline editing, and completion tracking.
- **Export / import** all data as JSON for backup or device transfer.
- **Today screen** that surfaces the current workout card for both tracks, yesterday's correction note from the journal, and a task preview — everything in one place at the start of the day.

---

## Tech stack

- React Native 0.85 + Expo SDK 56
- TypeScript (strict mode)
- Expo Router (file-based routing)
- expo-sqlite (all persistence — no backend, no network calls)
- Zustand (installed, partially wired)
- react-native-paper (MD3 components)
- expo-video (local MP4 exercise demos)
- expo-haptics (vibration feedback on set completion)
- expo-sharing + expo-file-system + expo-clipboard (export/import)
- react-native-reanimated + react-native-gesture-handler
- EAS for production builds

---

## How it works

Everything is local. There's a single SQLite database (`invictus.db`) with 12 tables. The schema is created on first launch via `initDatabase`, which also runs a set of ad-hoc `ALTER TABLE` migrations (wrapped in try/catch) and seeds the exercise library and training day definitions if they're not already there. No versioning system — just add the migration, catch the error if the column already exists.

The app is organized around Expo Router's file-based routing. The five tab screens live in `src/app/(tabs)/`. The workout session screen lives outside the tab group at `src/app/workout/session.tsx` and is presented as a full-screen modal so it completely covers the tab bar during a session — that's intentional, the tab bar gets in the way during a workout.

Each screen reads from and writes to SQLite directly using async functions from the `src/db/` layer. Zustand stores exist for each domain but aren't actually wired to any screen; the screens manage their own state with `useState` and call the db functions directly. That's not a great pattern architecturally but it kept moving fast. I might consolidate those paths later.

Session state during a workout is local React state. Each set completion writes a row to the `sets` table immediately, so partial sessions are always recoverable. When the session ends (or exits early), the session row gets an `ended_at` timestamp and the schedule state advances.

The journal auto-saves on a 500ms debounce. Changes fire a `useEffect` that upserts the day's entry — inserts if it doesn't exist, updates if it does.

---

## Setup

**Prerequisites:** Node.js (LTS), pnpm, Expo Go on your phone or a simulator.

```bash
cd app
pnpm install
pnpm start
```

Scan the QR code with Expo Go, or run `pnpm android` / `pnpm ios` to open a simulator directly.

No `.env` file needed. There are no API keys and no remote services — everything is local SQLite.

For production builds you need the EAS CLI and access to the Expo account tied to `com.ayomidepeteroke.invictus`.

---

## Known limitations and what I'd change

**Dead code.** There's a `useWorkoutSession` hook built around `useReducer` that was meant to abstract session logic, but the session screen ended up implementing everything with `useState` directly. Same with the Zustand stores — they're defined and typed but nothing actually consumes them. That accumulation will need a cleanup pass.

**Routines tab is a stub.** You can create, rename, and delete named routines, but you can't add exercises to them or start a session from one. The `routines` and `routine_exercises` tables exist in the schema. This was always intended to be a full custom workout builder; I just haven't gotten there.

**Combat exercises have no video.** The `EXERCISE_MEDIA` map only covers body exercises. For combat sessions the `VideoPlaceholder` component is skipped entirely with an `!isCombatSession` guard, so it's not broken — it's just not there yet.

**No migration versioning.** The current approach of catching `ALTER TABLE` errors works fine at this scale, but it gives no visibility into what state any given install is in. If I were making this available to more than a few people I'd swap this for a proper migration runner with a version table.

**The schema migration has a one-off bug-fix patch** that resets a schedule pointer for devices that got the old seed before a training day renumber. That kind of specific surgery in the migration file is a sign the approach needs more structure.

**No error boundaries.** If the database fails to initialize the app just keeps rendering and breaks silently. Should add a top-level catch with a meaningful fallback.

**No tests anywhere.** Not ideal, especially around the session timing logic and the UPSERT paths in the journal. That's the first thing I'd add if this were going to production.
