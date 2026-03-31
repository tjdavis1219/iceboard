# Strategy Board — Build Brief

## What This Is

A new tab called **Strategy Board** that becomes the default landing page for IceBoard. This is the coach's command center for managing a recruiting class — it shows open slots, constraints, and where each active target stands. Think of it as the "decision layer" on top of the existing Pipeline Board.

## How It Connects to Existing Features

- **War Room / Roster** → The Strategy Board pulls in graduating player counts by position for the selected season. If the War Room says 2F and 1D graduate, the Strategy Board knows those are the gaps to fill.
- **Pipeline Board** → Prospects on the Strategy Board are NOT a separate list. They are pulled from the existing pipeline based on recruiting stage (Building Relationship, Offer Extended, Committed). The coach can also manually pin any prospect from the pipeline to appear on the Strategy Board as a target.
- **Player Cards** → When a coach updates a prospect's status to "Committed" on their player card, that prospect automatically fills a slot on the Strategy Board.

## Data Model

### Recruiting Class

```
{
  id: string,
  team_id: string,
  season: string,           // e.g. "2027-28"
  total_slots: number,      // coach sets this (e.g. 8)
  positional_targets: {
    F: number,              // e.g. 4
    D: number,              // e.g. 3
    G: number               // e.g. 1
  },
  band_limits: {            // nullable — only relevant for some schools
    A: number | null,       // null = unlimited
    B: number | null,       // e.g. 3
    C: number | null        // e.g. 1
  },
  bands_enabled: boolean,   // toggle for schools that don't use academic banding
  created_at: timestamp,
  updated_at: timestamp
}
```

### Prospect Recruiting Fields (add to existing prospect/player model)

```
{
  // ... existing fields ...
  academic_band: "A" | "B" | "C" | null,       // manual entry by coach
  financial_aid_status: "Unknown" | "Requested" | "Received - Workable" | "Received - Not Workable" | null,
  country: string | null,                        // manual entry
  target_class_season: string | null,            // which recruiting class this prospect is slotted for (e.g. "2027-28")
  pinned_to_strategy: boolean,                   // true = show on Strategy Board even if not yet at Building Relationship stage
  committed_at: timestamp | null
}
```

### Slot State

Each slot in the class can be in one of these states:
- **Open** — no one assigned
- **Targeted** — one or more prospects are being actively recruited for this slot
- **Pending** — offer extended, waiting on commitment
- **Filled** — prospect committed
- **Conditional** — committed but deferred (e.g. chasing a D1 offer first, could reopen)

## UI Layout

### Top Section: Class Header

- **Season selector dropdown** — defaults to next season. Options are next 3 seasons (e.g. 2027-28, 2028-29, 2029-30). When changed, entire board updates.
- **Graduating summary** — pulled from War Room/roster data: "Graduating after this season: 2F, 1D, 0G"
- **Class summary bar** — horizontal row of slot tiles showing: `8 total | 3 filled | 1 pending | 4 open`. Color-coded.

### Middle Section: Slot Grid

A visual grid showing each slot, organized by position group:

```
FORWARDS (4 slots)                    DEFENSE (3 slots)              GOALIES (1 slot)
┌─────────────┐ ┌─────────────┐      ┌─────────────┐               ┌─────────────┐
│ FILLED       │ │ PENDING     │      │ TARGETED    │               │ OPEN        │
│ J. Torresi   │ │ A. Lehtinen │      │ B. Ashworth │               │             │
│ F·R | NAHL   │ │ F·L | NAHL  │      │ D·R | NAHL  │               │ Need: G     │
│ Band: A ✓    │ │ Band: B ⚠   │      │ Band: A ✓   │               │ 0 targets   │
│ Aid: Workable│ │ Aid: Unknown│      │ Aid: Reqstd │               │             │
└─────────────┘ └─────────────┘      └─────────────┘               └─────────────┘
```

Each slot card shows:
- Slot state (color-coded: green=filled, yellow=pending, blue=targeted, gray=open, orange=conditional)
- Player name + position + handedness + current team
- Academic band with indicator (✓ = no issue, ⚠ = using a limited band slot)
- Financial aid status
- If OPEN: shows "Need: [position]" and count of pipeline targets at that position

### Bottom Section: Constraint Tracker

A compact bar or panel showing real-time constraint math:

```
BANDS REMAINING:  A: unlimited  |  B: 1 of 3 left ⚠  |  C: 1 of 1 left
POSITIONS:        F: 2 open  |  D: 1 open  |  G: 1 open
TOTAL:            5 of 8 slots remaining
```

Warning indicators when a constraint is getting tight (1 remaining = yellow, 0 remaining = red).

### Right Panel or Expandable: Active Targets

A list of all prospects pinned to this recruiting class who are NOT yet committed. Grouped by position. Each row shows:
- Name, team, league
- Current pipeline stage (Building Relationship / Offer Extended)
- Academic band
- Aid status
- Days since last contact

This is the coach's "who am I working on" list. Clicking a name opens their full player card.

## Behavior

1. **When a prospect is marked Committed** → they automatically fill the next open slot matching their position. If no open slot matches, prompt: "This commitment exceeds your planned [position] slots. Adjust class plan?"
2. **When a slot is filled** → constraint counters update immediately. If a B-band slot is used, the remaining B-band count decreases.
3. **Conditional commits** → slot shows as filled but with an orange "Conditional" badge. Constraint counters treat it as filled but the coach can reopen it with one click.
4. **Season switching** → changing the dropdown loads a completely different class with its own slots, constraints, and targets. Each season is independent.
5. **Bands toggle** → if `bands_enabled` is false for this team, the entire academic band column/constraint disappears from the UI. Keep it clean for programs that don't care.
6. **Class setup** → first time a coach views a season with no class defined, show a setup flow: "How many spots are you filling? Break them down by position. Does your program use academic banding?"

## Design Notes

- Match the existing IceBoard dark theme and color palette
- This should feel like a **war room whiteboard** — visual, at-a-glance, not a spreadsheet
- Mobile responsive — coaches check this on their phones between games
- The slot grid is the hero — it should take up the most visual real estate

## What NOT to Build Yet

- Automated graduation detection from roster data (for now, coach manually enters "Graduating: 2F, 1D, 0G" or we hardcode the pull if War Room data structure supports it)
- Drag-and-drop from pipeline to strategy board (start with a "Pin to Strategy Board" button on player cards)
- Multi-scenario planning (e.g. "what if we get this kid vs that kid") — future feature
- Notifications or reminders for stale targets — future feature
