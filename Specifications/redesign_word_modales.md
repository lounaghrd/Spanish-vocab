# Word modale - Guess

Modale when the word is due for review.

### What changed:

- New design of the card: layout, padding, boxes, etc.
- The “close” button removed
- Modale title is now made of a new component called *Word card title*. In the Guess modale, the title must have the following variants:
  - Masked = true
  - State = default
  See last section of this note for more details on the component to implement.
- The English translation and word type are now on the same line, separated by a separator
- Updated text field component: we are now using the text field variant with the arrow button in it. Two states:
  - When the text field is empty, the arrow button is not visible.
  - When the text field has at least one character, the arrow button is visible (default state) and the user can click it to submit their guess.

### Links to Figma

- When the text field is empty (arrow button not visible): [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4050&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4050&m=dev)
- When the text field has at least one character: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4073&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4073&m=dev)

# Word modale - View

Modale when the word is not due for review.

### What changed:

- New design of the card: layout, padding, boxes, etc.
- The “close” button removed
- Modale title is now made of a new component called *Word card title*. In the Guess modale, the title must have the following variants:
  - Masked = false
  - State = default
  See last section of this note for more details on the component to implement.
- The English translation and word type are now on the same line, separated by a separator

### Links to Figma

- [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4096&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4096&m=dev)

# Word modale - Result

Result after submitting a guess.

- New design of the card: layout, padding, boxes, etc.
- The “close” button removed
- Modale title is now made of a new component called *Word card title*. In the Guess modale, the title must have the following variants:
  - Masked = false
  - State = correct (if result is correct), incorrect (if result is incorrect)
  See last section of this note for more details on the component to implement.
- The English translation, word type and example sentence are not in the word modale anymore.
- Word level and progress bar is now in the modale (Word progress component, same one as used in the word card in the “My words” page)
- Next review date is now in the modale. The text is the following: Next review in {x} {time}.
Examples:
  - Next review right now.
  - Next review in 1 hour.
  - Next review in 1 day.
  - Next review in 4 days.

### Links to Figma

- When result is correct: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4198&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4198&m=dev)
- When result is incorrect: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4213&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4213&m=dev)

# New component to implement: Word card title

The word card title component is used as a title in the word modale. It has two properties:

- State
  - Default → word is in black, no icon.
  - Correct → word is in green, check icon next to it.
  - Incorrect → word is in red, cross icon next to it.
- Masked
  - True → the word is masked by the grey squar
  - False → the word is not masked, it is hence visible.

### Links to Figma

- Link to component set: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4263&m=dev](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=678-4263&m=dev)

# Implementation Standards: Pixel-Perfect Figma Fidelity

Before writing any code, you must complete a full design audit. These steps are **mandatory** and must be done before implementing anything.

### Step 1 — Inventory every Figma node

Open each Figma link provided in the specs. For every frame, go through **all layers in the layer panel**, not just what is visible at first glance. For each layer, record:

- Layer name and type (frame, group, component instance, text, vector, etc.)
- Visibility (is it shown? hidden? conditional?)
- Position and size (x, y, w, h — exact values from Dev Mode)
- Whether it is a **component instance** (and if so, which component and which variant/state)

Do not start coding until you have reviewed every single layer.

### Step 2 — Extract exact layout and spacing values

For every frame and auto-layout container, read and use the **exact values from Figma Dev Mode**, not approximations:

- Layout mode: horizontal / vertical / none
- Alignment: horizontal and vertical
- Padding: top, right, bottom, left (check each side individually — they may differ)
- Gap between items
- Width and height constraints: fixed / fill / hug
- Corner radius (check each corner individually if needed)
- Border and stroke: width, color, style, position (inside / outside / center)
- Opacity and blend mode if non-default

### Step 3 — Extract exact typography values

For every text layer, read from Dev Mode:

- Font family (exact name)
- Font weight (exact weight, e.g. 500 Medium, not just "medium")
- Font size (exact px)
- Line height (exact value and unit — px or %)
- Letter spacing (exact value)
- Text color (exact hex or design token)
- Text alignment
- Text transform (uppercase, capitalize, none)
- Number of lines / truncation behavior if applicable

### Step 4 — Extract exact color and style values

- All colors must come from Dev Mode (hex, rgba, or design token name)
- Background fills: check for gradients, multiple fills, or image fills
- Do not eyeball or guess colors — read the exact value

### Step 5 — Component instances: check every property

When a layer is a component instance:

1. Open the component in Figma (go to the main component, not just the instance)
2. Read **all properties** defined on the component: variants, boolean properties, text overrides, nested instance swaps
3. Cross-reference with the instance in the design to identify which **exact variant combination** is being used (e.g. `Masked=true, State=default`)
4. Implement the component with all its variants, not just the one visible in a single frame
5. Check if the component has interactive states (hover, focus, disabled) and implement those too if they are defined in the component set

### Step 6 — Icons and illustrations

Never substitute an icon with a similar-looking one. For every icon:

1. Identify the exact icon name from the Figma layer name or component name
2. If it comes from an icon library (e.g. Phosphor, Heroicons, Lucide, Feather, Material), use the exact same library and the exact same icon name
3. Check icon size, color, and stroke weight from Dev Mode
4. If the icon is a custom illustration or SVG, export it from Figma directly — do not recreate it by hand

### Step 7 — States and variants: implement all of them

When the spec describes multiple states of a component or screen (e.g. empty vs. filled text field, correct vs. incorrect result), implement **all states**. For each:

- Read the Figma frame for that state specifically
- Do not copy-paste the code from another state and assume small tweaks are enough — re-audit the layers for each state
- Check what changes between states: visibility of elements, color, text content, icon, layout shifts

### Step 8 — Verify before submitting

Before considering the implementation done, do a side-by-side check:

- Open each Figma frame
- Compare every visual element: spacing, colors, text, icons, component states
- Flag anything that does not match and fix it before submitting

### Step 9 — Flag missing design specs before starting

If anything required for implementation is not defined in Figma — a missing state, a variant that is not designed, a component that is referenced but does not exist, an interaction that is described in the specs but has no corresponding frame — **do not invent it**. Stop and list everything that is missing, then ask the designer to create it in Figma before you begin implementing that part. This applies to edge cases too: empty states, loading states, error states, disabled states. If the design does not cover it, ask first.

This section applies to every component, modal, and screen described in these specs. If any Figma link is inaccessible, stop and ask before proceeding — do not make assumptions about what the design looks like.