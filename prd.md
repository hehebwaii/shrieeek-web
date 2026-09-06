# PRD: IEEE Event Digital Character Card System

## 1. Overview
A web app for an IEEE event where each participant signs in with Google, generates a personal superhero-style "character card," and levels it up by scanning other participants' QR codes at the event. An admin dashboard tracks XP/leaderboard data privately.

## 2. Goals
- Give every participant a fun, shareable digital identity for the event.
- Drive in-person networking/engagement via the QR-scan mechanic.
- Prevent cheating (self-scans, repeat-scans, client-side XP/level tampering).
- Give organizers a private view of engagement without exposing a public leaderboard.

## 3. User Roles
- **Participant** — signs in, owns one card, can scan others.
- **Admin** — password-protected access to the tracking dashboard only.

---

## 4. Core User Flow (Participant)

1. Open event link.
2. **Sign in with Google** (OAuth). This is the participant's permanent identity — used to prevent duplicate accounts and to key their card/QR.
3. If first time: see a **"Generate Character"** button.
4. On click: system randomly assigns a **superhero character** (e.g., Hulk, Iron Man, Thor) from a fixed pool, and creates the participant's card with:
   - Character image/art
   - Editable **name**
   - Editable **powers** (short text, e.g., "Super Strength")
   - **Card level** (starts at 1)
   - **XP bar** (starts at 0)
   - A **persistent unique QR code**
5. Participant can edit their **display name** and **powers** text at any time. These fields are cosmetic only and never affect XP/level logic.
6. Participant's QR code is shown on their card (and/or downloadable) so others can scan it.
7. To gain XP, the participant scans **someone else's** QR code using an in-app scanner (camera access).
8. On a valid scan:
   - Scanner's XP increases by a fixed amount (e.g., +10).
   - If XP crosses a level threshold, **level-up animation** plays and level increments (possibly multiple levels if XP jump is large).
9. Returning participants: skip character generation, go straight to their existing card.

## 5. Character Generation
- Fixed roster of superhero characters (art assets prepared in advance), e.g., Hulk, Iron Man, Thor, Spider-Man, Black Panther, Captain Marvel, etc.
- Assignment can be random or round-robin; duplicates across participants are allowed (character is flavor, not identity — Google account is identity).
- Character (once assigned) is **not re-rollable** by the participant, to keep it simple and prevent "reroll farming." (Confirm if re-roll should be allowed — open question below.)

## 6. Card Contents
| Field | Editable by user? | Notes |
|---|---|---|
| Character art/name | No | Assigned at generation |
| Display name | Yes | Free text, sanitized/length-limited |
| Powers | Yes | Free text, sanitized/length-limited |
| Level | No | Server-computed from XP |
| XP bar | No | Server-computed, animated on change |
| QR code | No | Fixed for life of the account |

## 7. XP & Leveling Rules
- XP is awarded **only** via a valid scan event, processed server-side.
- Level = a function of total XP (e.g., a level table or formula — TBD by event organizer, e.g., every 50 XP = 1 level).
- **Level-up animation** triggers client-side when the server confirms a level increase, whether from one scan or a batch.
- XP and level are **never writable directly by the client** — the client can only trigger a "scan" request; the server validates and updates XP/level, then returns the new state.

## 8. QR Code Rules
- Each participant gets **one unique QR code**, generated at account/card creation, encoding a stable participant ID (not the Gmail address directly — see Security).
- The QR code **does not change** on refresh, logout/login, or edit — it's tied permanently to the participant's account.
- QR code should **not be guessable/incrementing** (use a random opaque token, not a sequential user ID).

## 9. Anti-Abuse Rules (Scanning)
- **No self-scan:** a participant cannot gain XP by scanning their own QR code.
- **No self pair repeat:** once participant A has successfully scanned participant B's QR code, that specific **A→B** scan cannot award XP again (subsequent scans of B by A are no-ops or show "already scanned").
  - Directionality question: does A scanning B also let B scan A for XP? (Recommended: yes — they're independent pairs, A→B and B→A are tracked separately, so two people can scan each other once each.)
- A participant **can** still scan any number of *different* people for XP.
- All scan validation happens **server-side**; the client only sends "I scanned code X," never an XP delta.
- Rate limiting / cooldown recommended (e.g., max N scans per minute) to prevent rapid QR-sharing abuse (e.g., someone photographing and mass-sharing their QR).
- Consider optional geofencing or event-time-window restriction so scans only count during the event.

## 10. Admin Dashboard
- Accessible at a separate route (e.g., `/admin`), protected by a **password** (not part of participant Google auth flow).
- Displays a table (hidden leaderboard) with, per participant:
  - Gmail
  - Display name
  - Current XP
  - Current level
  - Timestamp of last XP received
- Not sortable/visible to participants; no public leaderboard exists.
- Read-only view — admin cannot edit XP/level from this page (keeps a single source of truth: the scan-processing logic).
- Nice-to-have: export to CSV, search/filter by name or email.

## 11. Data Model (high-level)
**Participant**
- `id` (internal, opaque)
- `googleId` / `email`
- `displayName` (editable)
- `powers` (editable)
- `characterId` (assigned once)
- `xp` (server-managed)
- `level` (server-managed, derived or stored)
- `qrToken` (opaque, permanent, unique)
- `createdAt`

**ScanEvent**
- `id`
- `scannerId` (participant who scanned)
- `scannedId` (participant whose QR was scanned)
- `timestamp`
- Unique constraint on `(scannerId, scannedId)` to enforce "one-time per pair"

## 12. Security & Integrity Requirements
- Google Sign-In (OAuth 2.0) for participant auth; session cookie/JWT for subsequent requests.
- All XP/level mutations happen through a single server-side endpoint that:
  1. Verifies the requester's identity (session).
  2. Verifies the scanned QR token exists and isn't the requester's own.
  3. Checks the `(scannerId, scannedId)` pair hasn't already been recorded.
  4. Writes the ScanEvent and updates XP/level atomically (DB transaction).
- No client-side code should ever compute or send XP/level values — client only reads state after server confirms.
- Admin route protected by a password/secret separate from participant auth (e.g., a simple admin login or a shared passphrase gate + server-side check — not just a hidden URL).
- Input sanitization on name/powers fields (length limits, strip scripts/HTML) to prevent XSS since these render on cards.

## 13. Non-Functional Notes
- Should work well on mobile browsers (participants will scan QR codes using their phone camera at the event).
- Card and scan actions should feel fast; level-up animation should be lightweight (CSS/canvas, not heavy video).
- Expect concurrent scan bursts around event start/breaks — server logic must handle race conditions on the unique-pair constraint (DB-level unique constraint recommended, not just app-level check).

## 14. Open Questions
1. Fixed XP-per-scan, or does XP vary by which character scans whom?
2. Can a participant re-roll their character, or is the first assignment permanent?
3. Should scanning be mutual (A scans B awards B nothing, only A) or does the QR also let the *scanned* person gain something?
4. What's the level formula/thresholds, and is there a max level?
5. Time window: should scans only be valid during the live event, or anytime the link is open?
6. Do participants need a way to download/save their QR code (e.g., add to phone wallet) in case of no signal at the venue?

## 15. Out of Scope (v1)
- Public-facing leaderboard.
- Participant-to-participant messaging/chat.
- Editing XP/level manually from admin (beyond viewing).
