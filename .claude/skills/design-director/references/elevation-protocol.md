# Elevation Protocol

A systematic process for refining visual outputs from functional to polished. Execute these passes internally before delivering the final result.

---

## Overview

```
Functional Draft → Typography → Color → Layout → Detail → Restraint → Deliver
```

Each pass focuses on one dimension. Don't try to fix everything at once.

---

## Pass 1: Functional Draft

### Objective
Get the content and structure right. Don't worry about beauty yet.

### Actions
- Include all necessary content and functionality
- Establish basic structure and grouping
- Use placeholder styling (default fonts, basic colors)
- Ensure information architecture is logical

### Checkpoint
- [ ] All required content is present
- [ ] Structure makes logical sense
- [ ] User could accomplish their goal with this (if ugly)

---

## Pass 2: Typography

### Objective
Establish clear hierarchy and readable text.

### Actions
1. **Set base**: Choose body text size (16-18px for web)
2. **Build hierarchy**:
   - h1: 2-2.5x base (32-40px)
   - h2: 1.5-1.75x base (24-28px)
   - h3: 1.25x base (20px)
   - Small: 0.875x base (14px)
3. **Assign weights**:
   - Headings: 600-700
   - Body: 400-500
   - Secondary: 400
4. **Set line heights**:
   - Headings: 1.1-1.3
   - Body: 1.5-1.7
5. **Check readability**:
   - Line length: 50-75 characters
   - Sufficient contrast

### Checkpoint
- [ ] Clear hierarchy visible at a glance
- [ ] Body text comfortable to read
- [ ] No more than 4 distinct text sizes
- [ ] Weights are consistent within levels

---

## Pass 3: Color

### Objective
Create a cohesive, purposeful palette.

### Actions
1. **Define palette**:
   - Background: warm white (`#fafafa`, `#f5f5f4`)
   - Primary text: warm black (`#18181b`)
   - Secondary text: medium gray (`#52525b`)
   - Accent: one muted color for CTAs/links
2. **Apply semantically**:
   - Success: muted green (`#22c55e`)
   - Warning: warm amber (`#f59e0b`)
   - Error: clear but not harsh red (`#ef4444`)
3. **Check accessibility**:
   - Run contrast checks
   - Ensure color isn't only indicator
4. **Remove unnecessary color**:
   - Can any colored element be gray?
   - Is color adding meaning?

### Checkpoint
- [ ] Palette is 5 or fewer colors
- [ ] Each color has a purpose
- [ ] Accessibility requirements met
- [ ] Feels warm, not cold

---

## Pass 4: Layout

### Objective
Optimize spatial relationships and flow.

### Actions
1. **Establish grid**:
   - Base unit: 8px
   - Common increments: 8, 16, 24, 32, 48, 64
2. **Apply spacing**:
   - Within groups: 8-16px
   - Between groups: 24-32px
   - Between sections: 48-64px
3. **Check alignment**:
   - Everything on grid
   - Consistent margins
   - Related items aligned
4. **Verify hierarchy**:
   - Most important content most prominent
   - Natural eye flow
   - Clear groupings

### Checkpoint
- [ ] Consistent spacing throughout
- [ ] Generous whitespace (when in doubt, add more)
- [ ] Clear visual groupings
- [ ] Nothing feels cramped

---

## Pass 5: Detail

### Objective
Polish micro-level elements.

### Actions
1. **Shadows and depth**:
   - Add subtle shadows to cards/modals
   - Ensure consistent shadow direction
   - Keep shadows soft (`rgba(0,0,0,0.05-0.08)`)
2. **Border radius**:
   - Consistent radius (typically 8px for cards, 4px for buttons)
   - Larger elements can have larger radius
3. **Transitions**:
   - Add hover states to interactive elements
   - Keep transitions quick (150-200ms)
   - Use ease or ease-out timing
4. **States**:
   - Verify hover, focus, active states
   - Check disabled appearance
   - Ensure loading states if applicable

### Checkpoint
- [ ] Interactive elements have feedback
- [ ] Shadows are subtle and consistent
- [ ] Border radii are harmonious
- [ ] Transitions feel smooth, not slow

---

## Pass 6: Restraint Check

### Objective
Remove everything unnecessary. This is critical.

### Actions
1. **Audit every element**:
   - What can be removed without losing meaning?
   - Is every color necessary?
   - Is every border necessary? (Consider spacing instead)
   - Is every shadow necessary?
2. **Simplify**:
   - Combine similar elements
   - Reduce color variations
   - Remove decorative elements
3. **Test removal**:
   - Temporarily remove questionable elements
   - Does it still work? Keep it removed.
4. **Final questions**:
   - Would a designer at Notion approve this?
   - Does this feel calm and confident?
   - Is there anything that screams "template"?

### Checkpoint
- [ ] Nothing decorative remains
- [ ] Every element is earning its place
- [ ] Design feels intentional, not default
- [ ] Passes the "senior designer" test

---

## Motivation Check (For Progress/Learning UIs)

If the output relates to learning, progress, or achievement:

### Additional Questions
- [ ] Do empty states encourage or shame?
- [ ] Does progress feel rewarding?
- [ ] Is celebration proportional?
- [ ] Would this motivate continued engagement?
- [ ] Are streaks/metrics supportive, not pressuring?

### Tone Adjustments
- Use warm colors for positive states
- Phrase copy encouragingly
- Make "0" feel like potential, not failure
- Celebrate effort, not just completion

---

## Delivery

After all passes complete, deliver the polished result. The user sees only the final output unless they explicitly request to see the design thinking process.

### Final Self-Check
- [ ] Would I be proud to show this to a professional designer?
- [ ] Does this look hand-crafted, not generated?
- [ ] Is it calm, confident, and warm?
- [ ] Does every choice have a reason?
