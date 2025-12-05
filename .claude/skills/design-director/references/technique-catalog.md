# Design Technique Catalog

Organized by what you're trying to achieve. Use these specific techniques rather than generic defaults.

---

## Creating Visual Hierarchy

### Through Size
- **Dramatic contrast**: Headlines at 2-3x body size (not 1.2x)
- **Diminishing returns**: After 48px, increase by larger amounts
- **Mobile scaling**: Reduce heading sizes proportionally, keep body stable

### Through Weight
- **Semibold for emphasis**: 600 weight stands out without shouting
- **Light for supporting**: 300-400 for secondary information
- **Avoid mixing too many**: Max 3 weights per design

### Through Color
- **Primary content**: `#18181b` or `#1f2937` (near-black, warm)
- **Secondary content**: `#52525b` or `#6b7280` (medium gray)
- **Tertiary/disabled**: `#a1a1aa` or `#9ca3af` (light gray)

### Through Position
- **Top-left anchors**: Primary content starts top-left (LTR languages)
- **Z-pattern for scanning**: Key info along the natural scan path
- **Isolation for importance**: Important items get extra surrounding space

---

## Adding Sophistication

### Subtle Shadows
```css
/* Card shadow - barely there */
box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);

/* Elevated element */
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);

/* Modal/overlay */
box-shadow: 0 10px 25px rgba(0,0,0,0.08), 0 6px 10px rgba(0,0,0,0.05);
```

### Refined Borders
```css
/* Subtle separator */
border-color: rgba(0,0,0,0.06);

/* Card border */
border: 1px solid rgba(0,0,0,0.08);

/* Consider using shadow instead of border for depth */
```

### Gentle Gradients
```css
/* Background warmth */
background: linear-gradient(180deg, #fafafa 0%, #f5f5f4 100%);

/* Subtle surface */
background: linear-gradient(180deg, #ffffff 0%, #fafaf9 100%);

/* Never gradient text unless absolutely necessary */
```

### Micro-animations
```css
/* Standard transition */
transition: all 150ms ease;

/* Entrance */
animation: fadeIn 200ms ease;

/* Hover lift */
transform: translateY(-1px);
box-shadow: /* slightly elevated shadow */;
```

---

## Improving Scannability

### Visual Chunking
- Group related items with consistent spacing (16px within, 32px between)
- Use subtle background colors to define sections
- Cards for discrete units of content

### Strategic Whitespace
- Generous padding: 24px minimum for content areas
- Section margins: 48px+ between major sections
- Line spacing: 1.5-1.7 for body text readability

### Alignment Techniques
- Left-align text in most cases
- Align numbers right in tables
- Align labels consistently (all left, or all right)

### Information Density
- Progressive disclosure: show summary, reveal detail
- Truncation with expansion for long content
- Visual indicators for more content (arrows, ellipsis)

---

## Creating Focus

### Isolation
- Pull important elements away from others
- Use generous padding around CTAs
- Single-column layouts for focused tasks

### Contrast Techniques
- Color pop on neutral background (muted, not neon)
- Size contrast: one large element among smaller ones
- Weight contrast: bold headline in light text context

### Guided Attention
- Visual cues pointing to key areas (subtle arrows, alignment)
- Reduced opacity on non-essential elements
- Blur or dim backgrounds for modal focus

---

## Building Consistency

### Spacing Scale
```
4px   - micro (icon padding)
8px   - small (button padding, tight margins)
16px  - medium (card padding, standard margins)
24px  - large (section padding)
32px  - extra (major separations)
48px  - section (between major content blocks)
64px+ - page (top/bottom of major sections)
```

### Color Tokens
```css
--color-text-primary: #18181b;
--color-text-secondary: #52525b;
--color-text-tertiary: #a1a1aa;
--color-bg-primary: #ffffff;
--color-bg-secondary: #fafafa;
--color-bg-tertiary: #f5f5f4;
--color-border: rgba(0,0,0,0.08);
--color-success: #22c55e;  /* muted green */
--color-warning: #f59e0b;  /* warm amber */
--color-error: #ef4444;    /* not too harsh */
--color-accent: #3b82f6;   /* calm blue */
```

### Component Patterns
- Buttons: consistent height (36-40px), padding (12-16px horizontal)
- Inputs: match button height, clear focus states
- Cards: consistent border-radius (8-12px), padding (16-24px)

---

## Progress & Achievement Visuals

### Progress Bars
```css
/* Calm, substantial progress bar */
height: 8px;
border-radius: 4px;
background: #e5e5e5;

/* Fill with warm success color */
background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
```

### Achievement Indicators
- Check marks: simple, clean, not animated on load
- Stars/badges: muted colors, subtle shadows
- Numbers: clear typography, warm colors for positives

### Streak Displays
- Emphasize current achievement, not loss potential
- Use warm colors (amber, green) not anxious colors (red)
- Optional visibility for those who find streaks stressful

### Empty States
```
Instead of: "No progress yet"
Use: "Ready to begin your journey"

Instead of: "0 words learned"
Use: "Your vocabulary awaits"

Instead of: "You haven't practiced today"
Use: "Today's practice is ready for you"
```
