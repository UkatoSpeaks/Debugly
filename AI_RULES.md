# DEBUGLY PROJECT AI RULES

This repository is an AI-first SaaS called "Debugly", an AI debugging assistant for developers.

All AI agents modifying this codebase must follow these rules.

---

## TECH STACK (DO NOT CHANGE)

Frontend:
- Next.js (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

Backend:
- Firebase Authentication
- Firestore Database
- Firebase Functions (when needed)

AI Integration:
- Groq / OpenRouter APIs

Do NOT introduce new frameworks or UI libraries.

---

## PROJECT STRUCTURE

Use the following structure:

/app            → Next.js routes
/components     → reusable UI components
/components/ui  → shadcn components only
/lib            → utilities and helpers
/lib/firebase   → firebase configuration
/lib/ai         → AI logic and prompts
/types          → shared TypeScript types

Do not create random folders.

---

## UI DESIGN RULES

Design must follow developer-tool aesthetic:

- Dark mode first
- Minimal and technical appearance
- No bright gradients
- No marketing-style layouts
- Prefer dense, functional UI

Use shadcn/ui components whenever possible.

---

## ANIMATION RULES

Use:
- Framer Motion ONLY

Do NOT use:
- GSAP
- heavy scroll animations

Animations must be subtle and functional.

---

## CODING RULES

- Use functional React components.
- Use TypeScript strictly.
- Avoid inline styles.
- Prefer reusable components.
- Keep components small and modular.

---

## FIREBASE RULES

- All Firebase logic must live inside `/lib/firebase`.
- Never expose API keys in client logic unnecessarily.
- Database reads must be structured and typed.

---

## AI CODE GENERATION RULES

When generating UI:
- Use shadcn components first.
- Maintain consistent spacing.
- Follow existing component patterns.

When modifying code:
- Do not rewrite entire files unless required.
- Preserve existing architecture.

---

## GOAL

Maintain a clean, scalable, developer-grade SaaS architecture while enabling fast AI-assisted development.
