---
name: privacy-check
description: Use before finishing changes that touch trip logistics, data files, links, copied confirmations, private docs, or any content that may expose sensitive personal/travel information.
---

# Privacy Check Skill

Use this skill before handing off any change that touches trip logistics, data
files, external links, confirmation-derived content, or private trip details.

## Public Site Rule

This GitHub Pages site is public. Treat anything committed to the repo as public.

Do not commit:

- Booking references or confirmation codes
- Exact private Airbnb/home addresses
- Private Airbnb listing links unless Olivia explicitly confirms they are okay
- Flight confirmation numbers
- Private shared-doc links
- Personal emails, phone numbers, or IDs unless explicitly approved
- API keys, credentials, tokens, or secrets
- Local machine paths outside project documentation examples

Prefer:

- Placeholders
- Public operator/homepage links
- Local-only storage
- Ignored private config files
- Clear warnings when data belongs somewhere private

## Required Review

Before finishing, inspect the current diff and touched files. Look especially at:

- `data.js`
- `app.js`
- `index.html`
- `docs/ai-notes/`
- Any new JSON, Markdown, or config files
- Any logistics, flights, stays, documents, or emergency-info content

Search for sensitive patterns and suspicious terms, including:

- `booking`
- `confirmation`
- `confirm`
- `Airbnb`
- `address`
- `flight`
- `passport`
- `license`
- `phone`
- `email`
- `docs.google.com`
- `drive.google.com`
- `token`
- `secret`
- `api_key`
- `password`

If sensitive content is necessary, replace it with a placeholder or move it to a
private/local-only pattern before committing. If uncertain, stop and ask Olivia.

## Handoff

In the final response, include a short privacy note:

- `Privacy check: passed` when no risky committed data remains.
- Or clearly list what needs Olivia's confirmation before it can be committed.
