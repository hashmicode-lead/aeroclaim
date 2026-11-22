# AeroClaim OS

Automated flight, refund and baggage claim recovery for India. Phase 1 MVP: intake, rule engine, weather verification, deadline tracking and claim-packet generation.

## What works today

| Module | Details |
| --- | --- |
| **Intake & parsing** | Upload e-tickets, boarding passes, PIRs, airline SMS/email and receipts (PDF, image, text). Text-layer PDFs, pasted text and raw IATA BCBP boarding-pass barcode strings are parsed for PNR, flight, route, date, PIR reference and disruption cause. Files are stored as evidence and auto-classified. |
| **Rule engine** (`src/lib/rules/india.ts`) | DGCA CAR Sec 3 Series M Part IV (cancellation slabs by block time and notice window, the 2-hour alternate-flight exemption, denied boarding at 200%/400% with ₹10k/₹20k caps, delay duty of care, refund/alternate beyond 6h, hotel rules), Part II refund timelines (7 days for card, 30 working days via agents), Montreal Convention baggage (1,519 SDR cap, Art. 31 7-day/21-day notice, Art. 35 two-year limit), Consumer Protection Act two-year limitation, single- vs separate-PNR connections, chargeback flagging. |
| **Weather audit** (`src/lib/weather.ts`) | Open-Meteo hourly weather for both airports, ±3h around scheduled times (forecast, historical-forecast or ERA5 archive, chosen by date). Classifies fog/visibility, thunderstorms, heavy rain and gusts, and feeds the "extraordinary circumstances" risk score. |
| **Deadlines** | Every legal and airline deadline with live countdowns, plus an `.ics` calendar export with 3-day and 1-day alarms. |
| **Claim packet** | Demand letter to the airline nodal officer citing the exact clauses, chronology of events and indexed annexures. Print or save as PDF, or copy into an email. |

Rule packs implement `RulePack` (`src/lib/rules/pack.ts`). Register a new jurisdiction such as EU261 in `src/lib/rules/index.ts`.

## Run locally

Requires Node 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # rule engine, parser, weather, time tests
npm run build
```

With no env vars set, data (SQLite file and uploads) lives in `./data/`, which is gitignored.

## Deploy to Vercel

Storage is environment-driven: **Turso** (libSQL) for the database and **Vercel Blob (private)** for evidence files. The browser uploads files directly to Blob, which avoids Vercel's 4.5 MB function body limit.

1. On vercel.com, **Add New → Project** and import this GitHub repo. The defaults are fine.
2. In the project, open **Storage**. Create a **Blob** store with access set to **Private** and connect it. This sets `BLOB_READ_WRITE_TOKEN`.
3. Still under **Storage** (or the Marketplace), add **Turso** and connect a database. This sets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Tables are created automatically on first request.
4. **Redeploy** so the build picks up the new variables.

See `.env.example`. Without `TURSO_DATABASE_URL`, a Vercel deployment fails with a clear error rather than silently losing data.

## Not yet built (Sprint 2–3)

Insurance/card top-up and chargeback packets, AirSewa/e-Jagriti drafts, claim-status timeline, email/WhatsApp reminders, settlement "waiver-trap" scanner, OCR/vision for images, auth and role workspaces, Digital LoA e-sign, Razorpay checkout, LiveKit advocate room, B2B dashboard.

## Notes

- Not a law firm and not legal advice. Check amounts against the current CAR text.
- `SDR_TO_INR` in `rules/india.ts` is a static estimate. Replace it with a live IMF/RBI rate.
- Weather uses modelled data, not METARs.
