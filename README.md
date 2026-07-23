# Synapse OS (Work in Progress 🚧)

> A local-first, cognitive-driven Learning Operating System built to optimize deep work and manage 30-day mastery pathways.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-brown?style=for-the-badge)](#)

Synapse OS bridges the gap between active focus-tracking and long-term skill acquisition. It is an exploration into how we can use software to enforce **Interleaved Practice** and capitalize on the **Zeigarnik Effect** to prevent task abandonment.

**This project is currently in active development. I am building this in public and am open to collaboration!**

---

## 🧠 The Philosophy & Psychology

Synapse OS is not just a timer; it provides cognitive scaffolding for deep work.

- **The Flow Engine:** A distraction-free, overarching deep-work timer used to log general mastery hours.
- **Pathways (Hex Grids):** A visual course creator. Users can generate custom learning pathways (e.g., 30-day bootcamps) and track their progress through an interactive hexagonal grid.
- **Zeigarnik Friction:** If a user starts a daily node timer but does not mark the node as complete, it haunts the main dashboard as an "Open Loop." This utilizes cognitive tension to pull the user back into the flow state.

## 🏗️ Architecture & Engineering Decisions

### "Local-First" Data Strategy

To ensure lightning-fast UI updates and absolute data privacy, Synapse OS completely bypasses traditional server-side databases (like PostgreSQL or MongoDB).

- **Zustand Persist:** The entire global state (Settings, Timers, Plans, and Daily Nodes) is managed via Zustand and persisted directly to the client's local storage.
- **Zero-Latency:** By removing the network request lifecycle for CRUD operations, the application achieves instantaneous data interaction.
- **JSON Portability:** Users own their data. The app includes a robust import/export utility, allowing users to package their entire profile—or isolate and share a specific Learning Pathway—as a raw JSON file.

### Tech Stack

- **Framework:** Next.js (App Router)
- **State Management:** Zustand (with Persistence Middleware)
- **Styling:** Tailwind CSS (with custom dark mode / cyberpunk themes)
- **Icons:** Lucide-React
- **Deployment:** Designed to operate as a PWA (Progressive Web App) for offline-first capabilities.

## 🚀 Current Features

- [x] **Global Flow Timer:** Track deep work sessions.
- [x] **Pathway Generator:** Create N-day courses with isolated daily task nodes.
- [x] **Hexagonal Data Visualization:** Dynamic rendering of completed vs. active days. -[x] Job Application Tracker: Track your career progression with flexibility. Record detailed interview notes and company data, or use the quick-log dashboard to simply track your conversion numbers (Applied, Interviewing, Hired, etc.).
- [x] **Nested State Management:** Manage multiple timers (Global Flow + individual Pathway Node timers) simultaneously without state collision.
- [x] **Zeigarnik Open Loops:** Dashboard alerts for abandoned, mid-progress tasks.
- [x] **Data Import/Export:** Full JSON backups and single-pathway sharing.

## 🗺️ Roadmap (Upcoming Features)

- **Spaced Repetition Export:** Automatically extract notes from daily nodes and format them into CSV files for Anki/Quizlet imports.
- **PWA Integration:** Add offline service workers and a web manifest for native installation.
- **Interleaved Practice Scheduler:** A mode that randomly alternates daily tasks to force cognitive adaptation.
- **Mobile UI Overhaul:** Add comprehensive Android/iOS version.
  > _Note: While the application functions on mobile browsers, the UI is not yet fully responsive. A comprehensive mobile-friendly overhaul is planned for future iterations._

## 🤝 Open to Collaboration

I am actively building this project to refine my skills in modern React architecture, complex state management, and performance optimization as I prepare for upcoming software engineering roles.

If you are a developer or designer interested in learning OS concepts, local-first architecture, or UI/UX gamification, feel free to open an issue or submit a pull request!

### How to run locally:

1. Clone the repository:
   ```bash
   git clone [https://github.com/cgdev-ops/program_me]
   ```
