// ============================================================
// data.js — static content for the plan. Edit this file to
// adjust exercises, the Power BI reading arc, or home-mods tasks.
// ============================================================

const BOOKS = {
  dax:     { key: 'dax',     title: 'The Definitive Guide to DAX',  authors: 'Ferrari & Russo',            edition: '3rd ed. 2025' },
  kimball: { key: 'kimball', title: 'The Data Warehouse Toolkit',   authors: 'Kimball & Ross',             edition: '3rd ed. 2013' },
  swd:     { key: 'swd',     title: 'Storytelling with Data',       authors: 'Knaflic',                    edition: '2015' },
  bbod:    { key: 'bbod',    title: 'The Big Book of Dashboards',   authors: 'Wexler, Shaffer & Cotgreave', edition: '2017' },
};

// Four-week Power BI arc. Cycles automatically — week 5 repeats week 1's
// topic slot (go deeper into your own project each pass), etc.
const POWERBI_ARC = [
  { // Week 1 — Data Modeling
    topic: 'Data Modeling',
    days: [
      { concept: 'Star schema basics: facts vs. dimensions',
        apply: 'Sketch a star schema for a dataset you\u2019re working with — identify the grain, the facts, and the dimensions before you build anything.',
        reading: { book: 'kimball', chapter: 1, chapterTitle: 'Data Warehousing, BI, and Dimensional Modeling Primer' } },
      { concept: 'Fact table techniques: transaction, snapshot, accumulating snapshot',
        apply: 'Classify your current fact table(s) by type. Which pattern actually fits your data?',
        reading: { book: 'kimball', chapter: 2, chapterTitle: 'Kimball Dimensional Modeling Techniques Overview (fact tables)' } },
      { concept: 'Dimension techniques: conformed dimensions, slowly changing dimensions',
        apply: 'Find one dimension that changes over time. Decide how you\u2019d track that change (which SCD type fits).',
        reading: { book: 'kimball', chapter: 2, chapterTitle: 'Kimball Dimensional Modeling Techniques Overview (dimensions)' } },
      { concept: 'The four-step dimensional design process',
        apply: 'Run the four steps — grain, dimensions, facts, business process — against one real reporting need.',
        reading: { book: 'kimball', chapter: 3, chapterTitle: 'Retail Sales (case study)' } },
      { concept: 'How DAX sees your model',
        apply: 'Open your model and trace how one measure moves through your relationships. No new building today, just tracing.',
        reading: { book: 'dax', chapter: 1, chapterTitle: 'Introduction to learning DAX' } },
    ],
  },
  { // Week 2 — DAX
    topic: 'DAX',
    days: [
      { concept: 'Measures vs. calculated columns',
        apply: 'Rewrite one existing calculated column as a measure (or vice versa) and compare how each behaves.',
        reading: { book: 'dax', chapter: 2, chapterTitle: 'Introducing DAX' } },
      { concept: 'Filter context & CALCULATE',
        apply: 'Write one CALCULATE() measure that deliberately overrides a filter — e.g. a total that ignores the date slicer.',
        reading: { book: 'dax', chapter: 3, chapterTitle: 'Introducing the filter context and CALCULATE' } },
      { concept: 'Manipulating the filter context',
        apply: 'Solve a real filtering problem in your model using KEEPFILTERS, REMOVEFILTERS, or ALL.',
        reading: { book: 'dax', chapter: 4, chapterTitle: 'Manipulating the filter context' } },
      { concept: 'Row context & context transition',
        apply: 'Write a measure using an iterator (SUMX) and be able to explain out loud why context transition happens inside it.',
        reading: { book: 'dax', chapter: 5, chapterTitle: 'Introducing the row context and the context transition' } },
      { concept: 'Variables for readability & performance',
        apply: 'Refactor one of your more tangled measures using VAR / RETURN.',
        reading: { book: 'dax', chapter: 7, chapterTitle: 'Understanding variables' } },
    ],
  },
  { // Week 3 — Visualization / UX
    topic: 'Visualization & UX',
    days: [
      { concept: 'Know your audience before you design',
        apply: 'Write one sentence: who reads this dashboard, and what decision do they need it for?',
        reading: { book: 'swd', chapter: 1, chapterTitle: 'Understand the Context' } },
      { concept: 'Choosing the right visual',
        apply: 'Take one existing visual — is it the right chart type for the comparison you\u2019re making? Rebuild it if not.',
        reading: { book: 'swd', chapter: 2, chapterTitle: 'Choose an Effective Visual' } },
      { concept: 'Cutting clutter',
        apply: 'Remove three unnecessary elements from a dashboard page — gridlines, borders, redundant labels.',
        reading: { book: 'swd', chapter: 3, chapterTitle: 'Identify & Eliminate Clutter' } },
      { concept: 'Directing attention with color and size',
        apply: 'Use color or size with intent to highlight the single most important number on a page.',
        reading: { book: 'swd', chapter: 4, chapterTitle: 'Focus Attention' } },
      { concept: 'Dashboard layout foundations',
        apply: 'Review your dashboard\u2019s layout against the primer\u2019s core principles. Note two changes to make.',
        reading: { book: 'bbod', chapter: 1, chapterTitle: 'Data Visualization: A Primer' } },
    ],
  },
  { // Week 4 — Portfolio / Ship
    topic: 'Portfolio & Shipping',
    days: [
      { concept: 'Executive-level dashboard patterns',
        apply: 'Compare your dashboard\u2019s top section to an executive-summary pattern — adjust the information hierarchy.',
        reading: { book: 'bbod', chapter: 5, chapterTitle: 'Executive Sales Dashboard' } },
      { concept: 'Pace-to-goal visualizations',
        apply: 'Add or refine a pace-to-target visual (YoY growth tracking against a cadence).',
        reading: { book: 'bbod', chapter: 7, chapterTitle: 'Are We On Pace to Reach Our Goals?' } },
      { concept: 'A designer\u2019s eye: alignment, whitespace, type',
        apply: 'Do a 15-minute visual polish pass on one dashboard page — nothing structural, just refinement.',
        reading: { book: 'swd', chapter: 5, chapterTitle: 'Think Like a Designer' } },
      { concept: 'Packaging it as a story',
        apply: 'Write the three-sentence narrative you\u2019d use to present this dashboard to a stakeholder.',
        reading: { book: 'swd', chapter: 6, chapterTitle: 'Tell a Story' } },
      { concept: 'Time-intelligence polish',
        apply: 'Add one time-intelligence measure (YTD, SPLY) to finish the piece, then ship it.',
        reading: { book: 'dax', chapter: 13, chapterTitle: 'Time intelligence calculations' } },
    ],
  },
];

// One task per weekday admin slot (15 min). Friday doubles as catch-up.
const HOME_MODS_ADMIN = [
  { day: 'Mon', task: 'Research a specific modification', detail: 'Grab bars, ramp specs, doorway widths, walk-in shower, stairlift, or smart-home controls — pick one and go deep for 15 minutes.' },
  { day: 'Tue', task: 'Make one contact', detail: 'One phone call or email to a contractor or supplier. Just one — momentum matters more than volume.' },
  { day: 'Wed', task: 'Compare quotes or reviews', detail: 'Line up what you\u2019ve gathered so far. Look for the option that\u2019s actually the best fit, not just the cheapest.' },
  { day: 'Thu', task: 'Check funding sources', detail: 'Tax credits, insurance coverage, or local accessibility grants — confirm what\u2019s coverable before paying out of pocket.' },
  { day: 'Fri', task: 'Catch-up + next step', detail: 'Close any loose thread from the week and write down next week\u2019s first concrete action.' },
];

const HOME_MODS_STARTER_CHECKLIST = [
  'Walk every room and flag friction points (thresholds, narrow doorways, low lighting, unstable footing)',
  'Prioritize by safety risk first, convenience second',
  'Get 2\u20133 quotes for anything requiring a contractor',
  'Check what\u2019s coverable under insurance/medical equipment benefits before paying out of pocket',
  'Sequence installs: safety-critical items first, convenience items later',
];

// Core strength routine. type 'reps' = rep-counted, no timer needed beyond
// pacing; type 'hold' = timed isometric hold, runs a countdown per rep.
const CORE_SEATED = [
  { id: 's1', name: 'Pelvic tilts', type: 'reps', reps: 10, sides: false,
    cue: 'Roll your pelvis back (slump slightly), then forward (arch low back). Slow and controlled — this is the foundation everything else builds on.' },
  { id: 's2', name: 'Isometric brace', type: 'hold', holdSeconds: 5, reps: 8, sides: false,
    cue: 'Exhale, tighten your abdomen like bracing for a poke, hold.' },
  { id: 's3', name: 'Seated marching', type: 'reps', reps: 10, sides: true,
    cue: 'Lift one knee, lower with control, alternate. Use your hand to assist or resist lightly if needed.' },
  { id: 's4', name: 'Trunk rotations', type: 'reps', reps: 10, sides: true,
    cue: 'Arms crossed over chest, rotate shoulders one way, then the other.' },
  { id: 's5', name: 'Lateral lean-outs', type: 'reps', reps: 8, sides: true,
    cue: 'Lean sideways over the armrest a few inches, return using your obliques — not your arm. Start tiny.' },
  { id: 's6', name: 'Forward reach', type: 'reps', reps: 8, sides: false,
    cue: 'Hinge forward toward your knees, return slowly. The return is the work.' },
  { id: 's7', name: 'Overhead reach hold', type: 'hold', holdSeconds: 10, reps: 5, sides: false,
    cue: 'Arms up, ribs down, hold. Sneaky-hard anti-extension work.' },
];

const CORE_FLOOR = [
  { id: 'f1', name: 'Supine pelvic tilts', type: 'reps', reps: 12, sides: false,
    cue: 'Same motion as the seated version, now on your back.' },
  { id: 'f2', name: 'Assisted dead bug', type: 'reps', reps: 8, sides: true,
    cue: 'Knees bent, lower one arm overhead while keeping your low back flat. Add leg motion only if the back stays down.' },
  { id: 'f3', name: 'Bridges', type: 'reps', reps: 10, sides: false,
    cue: 'Feet planted, lift hips. Sub in a glute squeeze hold if leg control makes this unsafe.' },
  { id: 'f4', name: 'Side-lying leg lift or hip hike', type: 'reps', reps: 8, sides: true,
    cue: 'Controlled motion, no momentum.' },
  { id: 'f5', name: 'Prone on elbows', type: 'hold', holdSeconds: 25, reps: 1, sides: false,
    cue: 'Face down, propped on forearms. Great for back extensors, which usually get very weak in chair users.' },
  { id: 'f6', name: 'Quadruped hold', type: 'hold', holdSeconds: 20, reps: 1, sides: false,
    cue: 'Hands and knees. Progress later to lifting one arm.' },
];

const SAFETY_NOTES = [
  'Heat worsens symptoms temporarily \u2014 cool room, cold drink, cooling towel. Stop if things feel heavy or blurry.',
  'Stop with gas in the tank \u2014 finish feeling like you could\u2019ve done 2 more reps, not zero.',
  'Exhale on effort. Never hold your breath.',
  'Spasticity flare = reduce range, not push through.',
  'Progress slowly: add reps first (up to ~15), then hold time, then light resistance \u2014 one change at a time, every 2 weeks or so.',
];

const SETUP_NOTES = [
  'Sit toward the front third of the seat, back off the backrest, if your balance allows it.',
  'Feet flat and level, knees and hips at roughly 90\u00b0. Too tall? Use a platform, stacked books, or a yoga block under each foot.',
  'Footplates are fine as long as both feet are planted evenly and thighs are level.',
  'Leg spasticity flaring with firm foot contact? Back off to lighter contact or elevate the feet slightly.',
  'Chair locked, brakes on.',
];
