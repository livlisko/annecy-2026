---
name: trip-site-product
description: Use when changing the Annecy 2026 trip site product flow, navigation, activity discovery, saved-board behavior, logistics, or major trip-guide content.
---

# Annecy Trip Site Product Skill

Use this skill before making product, content, navigation, or information
architecture changes to the Annecy 2026 trip site.

## Core Intent

This app is a reference guide and exploration tool for Olivia and her brothers.
It should help them understand the region, discover beautiful things nearby, and
remember basic trip logistics. It should not feel like a managed vacation
schedule.

Optimize for:

- Easy browsing
- Fun regional context
- Activity inspiration
- Simple bookmarking
- Clear trip basics
- Low-friction use while traveling

Avoid:

- Minute-by-minute schedules
- Heavy comparison tables
- Collaborative voting systems
- Overexplaining the UI in the app
- Making mobile worse while phase 1 is focused on structure

## Current Product Direction

Phase 1 should focus on the bones:

- Simplify the information architecture.
- Make Activities the main exploration surface.
- Make Trip/logistics obvious but quiet.
- Turn Saved/Ideas into a Pinterest-style inspiration board where each person can
  save favorite activities.
- Remove or absorb Build a Day. The site does not need a day-planning engine.
- Preserve the current warm, personal voice.

Major mobile polish, map bottom sheets/clustering, weather integrations, and a
large visual redesign are out of scope unless Olivia explicitly asks for them.

## Navigation Changes

Before deleting, merging, or renaming major sections, propose the structure and
wait for approval. Include what happens to:

- Today
- Discover
- Plan
- Browse
- Search
- Saved
- Events
- Map
- Bike
- Logistics
- Existing Build a Day surfaces

Possible target bottom nav options are:

- Today
- Activities
- Ideas
- Trip
- Map

or:

- Today
- Activities
- Trip
- Map
- Bike

Do not implement this blindly. Propose it first.

## Copy Rules

Use human, vacation-friendly language.

Good:

- "Worth it, a bit more effort than you asked"
- "Easy group option"
- "Good rainy/rest day"
- "Must book"

Avoid robot-speak:

- "Close fit"
- "Relaxed effort"
- "Temporal constraints"
- "Optimization result"

## Handoff Checklist

Before finishing product work:

- Confirm the change supports browsing/reference, not overplanning.
- Confirm Build a Day was removed or absorbed rather than renamed into another
  planning engine.
- Confirm logistics are easier to find if they were touched.
- Confirm Ideas/Saved still feels like bookmarking/inspiration, not a
  spreadsheet.
- Confirm phase 1 scope was respected.
- Run the privacy-check skill if trip data, logistics, links, or content from
  confirmations were touched.
- Run the practical local checks for this static site.
