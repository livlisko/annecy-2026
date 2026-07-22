# 2026-07-22 — Confirmed logistics on the Trip page

- **Date:** 2026-07-22
- **Tool:** Claude Code

## Summary

Extended `#/trip` into the full source of truth: confirmed flights (Liv JFK⇄GVA Aug 11/29 on UA 9719 out & LX 22 back; Andrew EWR⇄GVA Aug 14/29 on United) and the National van (GVA, Aug 12 09:30 → Aug 29 09:30, four drivers, P51 pickup instructions), plus a departure-Saturday timing warning (leave Veyrier ~6:15; arrange early checkout + deposit handback with Casa Elisa).

## Decisions

- Public-page privacy: confirmation codes are **masked** (ESN•••, B69•••, #16948•••••) with an in-app note that full codes live in email. KTN, frequent-flyer/Emerald numbers, phone, email, and payment details are deliberately excluded from the repo entirely. First names only.
- Van estimated total (≈CHF 1,860) shown for group cost-splitting.

## Next actions

- Owner may ask to unmask booking codes (one-line change; advised against on a public site since airline PNR + surname allows booking changes).
