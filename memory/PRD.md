# Artiqal — PRD

## Original problem statement
Build Artiqal — a website for adults with aphasia practising functional communication. A virtual hub where users access activity categories: SFA Therapy Tool, Reading (Receipt, Medication Package, Forms), Writing, Word Finding, Auditory Comprehension, Functional Tasks, Activities Hub. Indigo theme. Dropbox/Loom/Speechify aesthetic. Source content is owned by the user (SLP Blueprint).

## User personas
- Adult with aphasia (primary): wants calm, clear, slow-paced practice
- Speech-language pathologist (secondary): may guide a session

## Tech
- FastAPI + MongoDB backend
- React + Tailwind + Shadcn frontend
- Emergent LLM key for OpenAI TTS (tts-1), Whisper-1, Claude Sonnet 4.5
- JWT cookie auth + Emergent Google OAuth (currently bypassed in `ProtectedRoute.jsx` per user)

## What's been implemented
- Dashboard hub with bento-grid category tiles, breadcrumb navigation
- "Reading an Appointment Letter": Green (10), Amber (10), Red (10) — complete
- "Reading Prescription and Medication Labels": Green (10), Amber (10), Red (10) — **complete: 30 labels total**
- Stacked layout (label on top, questions below) for medication-labels activity
- 30+ unique letterhead/label variant SVG designs in `Letterheads.jsx`
- `answerMatch.js` — semantic answer matching (synonyms, digits/words, singular/plural, stop-word removal)
- 4-tool highlighter (yellow/green/pink + eraser) on every letter/label via `TreeWalker`
- Full-screen mode, clickable breadcrumbs
- End-of-activity summary screen + Download PDF (`window.print()`, zero-dependency)
- "End activity" early-exit button → partial PDF summary
- Per-activity TTS playback (OpenAI TTS) and voice recording with Whisper
- SFA Therapy Tool with 10 target words and 6 feature prompts
- Backend: session tracking, SOAP notes via Claude Sonnet 4.5
- "Listening to a Voicemail" activity — Green (10), Amber (10), Red (10), Bonus Pink (10 phone menus) — complete
- Interactive Phone Keypad UI for Bonus tier with audio replay on key "5" for menus that state "press 5 to hear options again" (VMs 1, 2, 5) — **fully wired (2026-02)**
- Audio speed controls (1x / 1.25x / 0.75x) on voicemail player
- Rebranded user-facing copy to Artiqal (internal CSS/storage keys preserved)

### Reading Prescription and Medication Labels — Amber (NEW, Feb 2026)
- All 10 Intermediate labels added: Co-codamol, Flucloxacillin, Bendroflumethiazide, Sertraline, Gabapentin, Doxycycline, Naproxen, Citalopram, Prednisolone, Tramadol
- Each: 4 questions, secondary warning, `Rx No` line, more complex dosing schedules
- `MedLabelShell` extended with optional `rx_number` and `warning` fields (renders warning triangle icon)
- All 10 Rx label variants now registered (oakwood, brightside, maple, clearview, meadow, parkview, northfield, highfield, willowbank, soundwell)

### Bulk Print PDF (Feb 2026)
- Added "Print" button on every difficulty card in `DifficultyPicker`, below the Start button
- Opens a new tab with a cover page + one printable A4 page per label (pharmacy header, Rx No, patient, medication, instructions, quantity/prescriber, warning, plus questions with blank answer lines for handwritten responses) and auto-triggers print dialog
- Button disables for levels with no labels yet
- Implemented via zero-dependency `window.open` + `window.print`; reusable for any leveled reading activity (letters or labels)

### Listening to a Voicemail — COMPLETE 40/40 (Feb 2026)
- New activity under Functional Communication: `voicemails` slug, leveled framework + a 4th **Bonus (Pink)** tier
- **40 items total**: Green 10 · Amber 10 · Red 10 · Bonus 10
- Voicemails (Green/Amber/Red): full transcript + 5–6 multiple-choice questions each
- **Bonus tier**: phone-menu scenarios. New `format: "phone-menu"` renders the audio card on the **right** and a **realistic 3×4 phone keypad** (1–9, *, 0, #) on the **left**, with "Stay on the line" / "Hang up" buttons underneath. All 12 keys clickable. Correct key glows green, wrong key glows red, with answer-key tag below.
- Bonus tier theme: **neon-pink dots, glowing ✨ Bonus pill**, pink CTA, 4-card responsive grid (cols 2/4 on lg, sticky right column for the phone card)
- VoicemailCard differentiates header by format ("New voicemail" vs "Phone menu — automated line") with Voicemail or Phone icon
- Layout: `phone-menu` uses 5-col split (3 questions / 2 card); voicemails use stacked (card on top, questions below)
- 0.75× / 1× / 1.25× playback speed control on every audio card

### Reading Prescription and Medication Labels — Complex (Red) 1–10 COMPLETE (Feb 2026)
- All 10 OTC products added with **photorealistic 3D Gemini Nano Banana renders**:
  - **Boxes**: Relievex extra (Ibuprofen), Paxolin (Paracetamol), Allergex (Cetirizine), Rexazid (Ranitidine), Throatmin Honey & Lemon lozenges
  - **Bottles**: Throatease Night Dry Cough Linctus (with measuring cup), Reguloxin Senna, Ferrovex Iron Supplement, Voyagex Cinnarizine
  - **Jar**: Derminex Antiseptic Cream
- Each: 5 questions, multi-section content (Directions / Caution / Warning / Storage / Ingredients)
- Renders saved as PNG in `/app/frontend/public/renders/` (served `/renders/red-N-*.png`)
- `LetterheadView` checks `letterhead.image_url` and renders the AI image directly (highlight tool disabled — image, not text)
- Generation script: `/app/backend/scripts/generate_3d_labels.py` (Universal Key, `gemini-3.1-flash-image-preview`). Per-label `EXACT_TEXT` map enforces verbatim text. Material-aware prompt (cardboard for boxes, glossy plastic for bottles/jars). Re-runnable via `ONLY=<slug>`.

### Label sizing fix (Feb 2026)
- Labels (medication-labels activity) now size to content rather than a fixed `2.6/1` aspect ratio. Prevented bottom-row clipping (barcode/prescriber) when warnings / extra rows were added.

## Backlog / Next
- P0: Intermediate (Amber) labels 6–10 — awaiting next user image batch
- P0: Complex (Red) labels 1–10 — awaiting user images
- P1: "Reading a Receipt" task
- P1: 2 "Writing Forms" tasks
- P1: Populate SFA Therapy Tool with curated static set of common words/concepts
- P2: Re-enable authentication (currently bypassed in `ProtectedRoute.jsx`)
- P2: Progress tracking dashboard, clinician/therapist dashboard, shareable session reports
- Refactor: `ActivityPage.jsx` (~1584 lines) and `Letterheads.jsx` (~1645 lines) are growing — consider modularising per-variant files later

## Key files
- `/app/backend/content.py` — activities + labels content
- `/app/frontend/src/components/Letterheads.jsx` — variant dispatcher + `MedLabelShell`
- `/app/frontend/src/pages/ActivityPage.jsx` — `LeveledReadingExercise`, PDF, layout toggle
- `/app/frontend/src/lib/answerMatch.js` — semantic matching
- `/app/frontend/src/components/ProtectedRoute.jsx` — auth bypass

## Notes
- Auth is bypassed; `/app/memory/test_credentials.md` has no required credentials for current testing.
- AMBER 5 source image labels the pharmacy "Maple Pharmacy" while showing the Meadow Pharmacy visual + Meadow Road address — preserved verbatim from the image. Flag for user review if undesired.
