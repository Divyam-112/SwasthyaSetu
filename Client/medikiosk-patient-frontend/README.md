# MediKiosk — Patient Frontend

Patient-facing frontend for MediKiosk (SIH 2026). This package covers the
patient workflow only — no backend, no AI. Every backend-shaped call goes
through `src/services/`, which currently returns mock data and is the
single place that will be rewired to a FastAPI backend later.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (default http://localhost:5173).

## What's set up so far

- Full folder architecture (see below)
- Design tokens (`src/theme/tokens.ts`) driving Tailwind + CSS variables
- Base component library (`src/components/ui`): Button, Card, Checkbox,
  Input, Badge, Modal, Tabs
- Layout shell (`src/components/layout`): KioskShell, StepProgressBar,
  AccessibleFooter (text size, high contrast, read-aloud)
- Routing for all 10 patient workflow steps, each currently rendering a
  "Coming next" placeholder except the Welcome page, which is fully built
- Zustand session store, service-layer stubs, and shared TypeScript types
  for patient, interview, document, report, doctor, and record data

## What's next

Build out each page in this order: ABHA Login → Consent → theme/component
polish check → AI Health Interview → Upload Documents → Generated Report →
Verification → Doctor Search & Booking → Prescription → Records Dashboard.

## Folder structure

```
src/
├── app/            route definitions + guards
├── pages/          one folder per workflow step
├── components/
│   ├── ui/         generic, reusable primitives
│   ├── layout/     shell, step bar, accessibility footer
│   ├── medical/    domain-specific reusable components (DoctorCard, etc.) — added as pages are built
│   └── feedback/   toasts, empty/placeholder states
├── services/       mock-to-real API bridge (api/) + fixtures (mocks/)
├── store/          Zustand state slices
├── types/          shared TS interfaces
├── theme/          design tokens
└── utils/          accessibility context, formatting helpers
```
