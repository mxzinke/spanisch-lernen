# Design Philosophy

## Core Principles

### 1. Calm Confidence Over Visual Noise
- Quiet authority speaks louder than loud decoration
- Let content breathe; don't crowd it with visual filler
- A confident design doesn't need to shout

### 2. Muted Palettes That Feel Professional, Not Cold
- Warm grays over pure grays
- Soft shadows over harsh black
- Color as accent, not assault
- Preferred palette direction:
  - Backgrounds: `#fafafa`, `#f5f5f4`, `#faf5f3` (warm whites)
  - Text: `#18181b`, `#27272a`, `#52525b` (warm darks)
  - Accents: muted greens, soft blues, gentle amber (never neon)

### 3. Celebrate Progress Warmly
- Achievement should feel earned, not gamified
- Subtle visual rewards: gentle check marks, soft glows, warm colors
- Avoid childish celebrations (no confetti explosions, no cartoon animations)
- Progress bars should feel satisfying, not anxious
- Empty states should encourage, not shame

### 4. Gentle Animations That Guide
- Animation serves comprehension, not decoration
- Transitions should be 150-300ms (perceptible but not slow)
- Prefer transforms and opacity over complex choreography
- Enter from natural directions; exit should feel complete
- No bouncing, no wiggling, no attention-seeking motion

### 5. Every Choice Intentional
- Nothing by default; question every decision
- If you can't explain why, reconsider
- "It looked nice" is not a reason
- Alignment, spacing, color, type size—all deliberate

### 6. Restraint Is Sophistication
- The urge to add is the enemy of good design
- Remove until it breaks, then add one thing back
- White space is not empty; it's working
- Fewer colors, fewer type sizes, fewer visual elements

## Anti-Patterns to Avoid

### Visual
- Neon colors or harsh contrasts
- Drop shadows darker than `rgba(0,0,0,0.08)`
- Gradients that call attention to themselves
- Borders when spacing would suffice
- Icons for decoration rather than meaning

### Animation
- Bounce effects
- Delays that feel sluggish
- Motion that doesn't help comprehension
- Infinite animations (pulsing, spinning) except for true loading states

### Typography
- More than 3 font sizes without clear hierarchy
- All-caps for body text
- Centered text for paragraphs
- Font weights below 400 for small text

### Emotional
- Shame-based empty states ("You haven't done anything yet!")
- Aggressive gamification (streaks as punishment)
- Fake urgency
- Comparison to other users

## The Restraint Test

Before finalizing any visual output, ask:
1. What can I remove without losing meaning?
2. Is every color earning its place?
3. Would a senior designer at Notion/Linear approve this?
4. Does this feel calm and confident?
5. If this shows progress, does it encourage or pressure?
