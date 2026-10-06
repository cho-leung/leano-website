# LEANO — Design System v0.1

## Direction

**Quiet premium B2B + editorial minimalism.**

The design takes broad inspiration from independent editorial portfolio sites: strong typography, generous whitespace, low UI density, large confident sections, subtle motion, and intentional rhythm. It does not copy a reference site's assets, layout, brand identity, or distinctive creative elements.

Leano translates that discipline into:

**precision + cross-border procurement + quiet confidence.**

## Core principles

1. Typography before decoration.
2. Whitespace is structural, not empty.
3. Large sections instead of card grids.
4. Procurement language should feel precise and operational.
5. Motion should be nearly invisible.
6. ICT is a visible current specialization, not the brand identity.
7. Every localized version must preserve the same commercial hierarchy.

## Palette

- Paper: `#f2efe8`
- Paper soft: `#e9e5dc`
- Ink: `#171715`
- Muted text: `#6c6a64`
- Accent: `#435047`
- Accent soft: `#dbe0da`
- Warm white: `#f7f4ed`

The muted forest accent is intentionally low-saturation.

## Typography

Primary sans stack:

`Helvetica Neue, Helvetica, Arial, ui-sans-serif, system-ui, sans-serif`

Chinese fallback:

`PingFang SC, Microsoft YaHei, Noto Sans CJK SC`

Editorial serif accent:

`Iowan Old Style, Baskerville, Times New Roman, serif`

No external font dependency is required.

Longer French, Spanish and Russian hero copy receives language-aware type scaling to preserve the intended whitespace and rhythm. Chinese uses slightly adjusted tracking because Latin negative tracking does not translate cleanly to CJK typography.

## Grid / spacing

- Max content width: `1360px`
- Fluid page gutter: `clamp(22px, 4.4vw, 72px)`
- Large section spacing: `clamp(96px, 12vw, 176px)`
- Desktop layouts intentionally use asymmetry rather than equal cards.

## Language selector

Language choices:

`EN · 中文 · FR · RU · ES`

Rules:

- text only;
- no flags;
- no pills / cards;
- no bright active-state color;
- active language indicated by ink color + thin underline;
- remains visually subordinate to the LEANO wordmark and procurement message.

The selector sits in the header as a utility, not a primary navigation feature.

## Motion

- single subtle reveal behavior;
- short vertical movement;
- no parallax;
- no scroll spectacle;
- honors `prefers-reduced-motion`.

## Commercial hierarchy

### Brand

Leano Sourcing

### Homepage core

Cross-border sourcing / second-source procurement

### Current specialization

ICT project sourcing

### Adjacent validating capability

Supply-route / landed-cost comparison only where relevant, without elevating it to a mature consultancy claim.

## Avoid

- gradients;
- glassmorphism;
- UI card grids;
- generic sourcing photography;
- globes;
- container ships as hero imagery;
- handshake imagery;
- fake dashboards;
- fake statistics;
- client logos without evidence / permission;
- language flags;
- oversized language dropdowns;
- platform language;
- unverified distributor or compliance claims.

## v0.1 Editorial Color Revision

The visual system now uses restrained color as structural hierarchy rather than decoration:

- Warm paper: `#f3efe5`
- Deep forest: `#28473a`
- Muted terracotta: `#a86149`
- Dusty blue: `#526d78`
- Warm sand: `#e6d4b5`
- Muted burgundy: `#613f3a`

Color is assigned to large editorial moments (hero composition, process markers, audience band, operating principle and RFQ area) while the typography-first system remains dominant. No neon gradients, glassmorphism, stock logistics imagery or dense card UI.

## Migration accessibility and responsive adjustments

The production palette remains restrained; small muted text, process numbers and form placeholders use darker tones for readability. Language controls have at least 24px hit targets and form controls expose visible keyboard focus. Narrow French, Spanish and Russian headings receive additional fluid scaling, with emergency wrapping and shrinkable grid columns to avoid clipping. Content is visible without JavaScript; reveal motion is applied only after its observer is initialized.
