# Parking Management System - Design System

## Overview

This design system provides a comprehensive, modern UI/UX framework for the parking management application with full dark/light theme support. Built on Material-UI with custom enhancements for premium aesthetics and optimal usability.

---

## 1. Color System

### Primary Colors
```typescript
Primary Main: #3b82f6 (Blue 500)
Primary Dark: #2563eb (Blue 600)
Primary Light: #60a5fa (Blue 400)
Primary Gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)
```

**Usage**: Primary actions, CTAs, links, active states, brand elements

### Secondary Colors
```typescript
Secondary Main: #10b981 (Emerald 500)
Secondary Dark: #059669 (Emerald 600)
Secondary Light: #34d399 (Emerald 400)
```

**Usage**: Success states, confirmations, positive indicators

### Accent Colors
```typescript
Accent Main: #8b5cf6 (Violet 500)
Accent Dark: #7c3aed (Violet 600)
Accent Light: #a78bfa (Violet 400)
Accent Gradient: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)
```

**Usage**: Special features, highlights, premium elements

### Semantic Colors

#### Success
```typescript
Main: #10b981
Light: #34d399
Dark: #059669
Usage: Success messages, operational status, completion states
```

#### Warning
```typescript
Main: #f59e0b
Light: #fbbf24
Dark: #d97706
Usage: Warnings, preparing states, attention needed
```

#### Error
```typescript
Main: #ef4444
Light: #f87171
Dark: #dc2626
Usage: Errors, stopped states, critical alerts
```

#### Info
```typescript
Main: #3b82f6
Light: #60a5fa
Dark: #2563eb
Usage: Information messages, tips, neutral notifications
```

### Dark Theme Palette

#### Backgrounds
```typescript
Default:  #0a0a0a  // Pure black base
Paper:    #141414  // Elevated surface
Elevated: #1a1a1a  // Modal/drawer backgrounds
Surface:  #1e1e1e  // Card surfaces
```

#### Text
```typescript
Primary:   #f5f5f5  // Main content
Secondary: #a3a3a3  // Supporting text
Tertiary:  #737373  // Hints, labels
Disabled:  #525252  // Disabled states
```

#### Borders
```typescript
Subtle:  rgba(255, 255, 255, 0.06)  // Default borders
Medium:  rgba(255, 255, 255, 0.12)  // Hover borders
Strong:  rgba(255, 255, 255, 0.18)  // Active borders
```

### Light Theme Palette

#### Backgrounds
```typescript
Default:  #f8f9fa  // Soft grey background
Paper:    #ffffff  // Pure white
Elevated: #ffffff  // Modal/drawer backgrounds
Surface:  #f5f6f8  // Card surfaces
```

#### Text
```typescript
Primary:   #1a1a1a  // Main content
Secondary: #525252  // Supporting text
Tertiary:  #737373  // Hints, labels
Disabled:  #a3a3a3  // Disabled states
```

#### Borders
```typescript
Subtle:  rgba(0, 0, 0, 0.06)  // Default borders
Medium:  rgba(0, 0, 0, 0.12)  // Hover borders
Strong:  rgba(0, 0, 0, 0.18)  // Active borders
```

### Color Usage Guidelines

1. **WCAG AAA Compliance**: All text/background combinations meet AAA standards
2. **Contrast Ratios**:
   - Normal text: 7:1 minimum
   - Large text: 4.5:1 minimum
3. **Status Colors**: Use semantic colors consistently across all interfaces
4. **Gradients**: Reserve for primary CTAs and hero elements only

---

## 2. Typography

### Font Stack
```css
font-family: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont,
             system-ui, Roboto, 'Helvetica Neue', 'Segoe UI',
             'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
```

### Type Scale (8px baseline grid)

#### Headings
```typescript
h1: 40px / 2.5rem    | 800 weight | -0.02em tracking | 1.2 line-height
h2: 32px / 2rem      | 700 weight | -0.01em tracking | 1.3 line-height
h3: 28px / 1.75rem   | 700 weight | normal tracking  | 1.3 line-height
h4: 24px / 1.5rem    | 600 weight | normal tracking  | 1.4 line-height
h5: 20px / 1.25rem   | 600 weight | normal tracking  | 1.4 line-height
h6: 16px / 1rem      | 600 weight | normal tracking  | 1.5 line-height
```

#### Body Text
```typescript
body1:     16px / 1rem      | 400 weight | 1.6 line-height
body2:     14px / 0.875rem  | 400 weight | 1.6 line-height
subtitle1: 16px / 1rem      | 500 weight | 1.5 line-height
subtitle2: 14px / 0.875rem  | 500 weight | 1.5 line-height
```

#### Utility Text
```typescript
button:   15px / 0.9375rem | 600 weight | 0.01em tracking | no transform
caption:  12px / 0.75rem   | 400 weight | 1.5 line-height
overline: 12px / 0.75rem   | 700 weight | 0.08em tracking | uppercase
```

### Typography Best Practices

1. **Hierarchy**: Use heading levels semantically (h1 → h2 → h3)
2. **Line Length**: 60-80 characters per line for optimal readability
3. **Line Height**: 1.6 for body text, tighter for headings
4. **Font Weights**: Use 400 (regular), 600 (semibold), 700 (bold), 800 (extrabold)
5. **Korean Support**: Pretendard provides excellent Korean character support

---

## 3. Spacing System

### 8px Grid System
All spacing follows an 8px baseline grid for visual consistency.

```typescript
spacing(1) = 8px
spacing(2) = 16px
spacing(3) = 24px
spacing(4) = 32px
spacing(5) = 40px
spacing(6) = 48px
spacing(8) = 64px
spacing(10) = 80px
```

### Component Spacing

#### Cards
```typescript
Padding: 24px (3 units)
Gap between cards: 16-24px (2-3 units)
```

#### Buttons
```typescript
Padding: 10px 24px (vertical: 1.25, horizontal: 3)
Icon gap: 8px (1 unit)
```

#### Lists
```typescript
Item padding: 12-16px (1.5-2 units)
Gap between items: 4-8px (0.5-1 unit)
```

#### Page Layout
```typescript
Page margins: 32px (4 units) desktop, 16px (2 units) mobile
Section spacing: 40-64px (5-8 units)
```

---

## 4. Elevation & Shadows

### Dark Theme Shadows
```typescript
sm:   0 1px 2px 0 rgba(0, 0, 0, 0.5)
md:   0 4px 6px -1px rgba(0, 0, 0, 0.4)
lg:   0 10px 15px -3px rgba(0, 0, 0, 0.5)
xl:   0 20px 25px -5px rgba(0, 0, 0, 0.6)
2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.7)
glow: 0 0 20px rgba(59, 130, 246, 0.3)
```

### Light Theme Shadows
```typescript
sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05)
md:   0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl:   0 20px 25px -5px rgba(0, 0, 0, 0.12)
2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.15)
glow: 0 0 20px rgba(59, 130, 246, 0.2)
```

### Elevation Guidelines
- **Level 0**: Default surface (no shadow)
- **Level 1 (sm)**: Subtle cards, list items
- **Level 2 (md)**: Standard cards, dropdowns
- **Level 3 (lg)**: Modals, drawers
- **Level 4 (xl)**: Active/hover states for cards
- **Level 5 (2xl)**: Hero elements, promotional cards
- **Glow**: Interactive elements, focus states

---

## 5. Border Radius

### Scale
```typescript
sm:   4px   // Small elements (chips, badges)
md:   6px   // Default (buttons, inputs, list items)
lg:   8px   // Cards, larger buttons
xl:   12px  // Large cards, panels
2xl:  16px  // Hero elements
full: 9999px // Circular/pill shapes
```

### Component-Specific
```typescript
Buttons:      8px
Cards:        12px
Input fields: 8px
Chips:        6px
Modals:       12px
Avatars:      50% (circular)
```

---

## 6. Component Specifications

### Buttons

#### Variants

**Contained (Primary)**
```typescript
Background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)
Padding: 10px 24px (default), 14px 32px (large), 6px 16px (small)
Border radius: 8px
Font: 15px / 600 weight
Hover: Darker gradient + subtle shadow + translateY(-1px)
```

**Outlined**
```typescript
Border: 1.5px solid (subtle border color)
Padding: Same as contained
Background: transparent
Hover: Border → primary.main, background → rgba(59, 130, 246, 0.08)
```

**Text**
```typescript
No border or background
Padding: Same as contained
Hover: Background → rgba(255, 255, 255, 0.05) dark / rgba(0, 0, 0, 0.04) light
```

#### States
```typescript
Default: Standard styling
Hover: Transform + shadow + color change
Active: No transform
Disabled: 50% opacity, no pointer events
Focus: 2px outline offset
```

### Cards

```typescript
Border radius: 12px
Border: 1px solid (subtle border)
Background: paper background
Padding: 24px
Shadow: none (default), xl on hover
Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Hover: translateY(-4px) + border color → primary + shadow xl
```

### Input Fields

```typescript
Border radius: 8px
Border: 1px solid (subtle border)
Padding: 12px 16px
Font: 16px / 400 weight
Height: 48px (default)
Focus: 2px border, primary color
Placeholder: 60% opacity
```

### Chips/Badges

```typescript
Height: 24px
Padding: 4px 12px
Border radius: 6px
Font: 11px / 600 weight / uppercase
Letter spacing: 0.02em
Border: 1px solid (30% opacity of background color)
```

### Tooltips

```typescript
Background: elevated background
Border: 1px solid medium border
Padding: 8px 12px
Border radius: 6px
Font: 13px
Shadow: lg elevation
Max width: 300px
```

---

## 7. Animations & Transitions

### Duration Scale
```typescript
fast:     150ms
normal:   200ms
moderate: 300ms
slow:     400ms
```

### Easing Functions
```typescript
standard: cubic-bezier(0.4, 0, 0.2, 1)  // Default
enter:    cubic-bezier(0.4, 0, 0.2, 1)  // Elements appearing
exit:     cubic-bezier(0.4, 0, 0.2, 1)  // Elements leaving
```

### Animation Classes

#### Fade Animations
```css
.animate-fade-in         // 400ms fade in
.animate-fade-in-up      // 500ms fade + translateY
.animate-fade-in-down    // 500ms fade + translateY reverse
```

#### Scale Animations
```css
.animate-scale-in        // 300ms scale from 0.9 to 1
.animate-scale-up        // 200ms scale to 1.05
```

#### Slide Animations
```css
.animate-slide-in-left   // 400ms slide from left
.animate-slide-in-right  // 400ms slide from right
```

#### Special Effects
```css
.animate-pulse-glow      // 2s infinite glow pulse
.animate-shimmer         // 2s infinite shimmer (loading)
```

### Interactive Animations
```typescript
Button hover: transform 200ms + shadow 300ms
Card hover: transform 300ms + border/shadow 300ms
Icon hover: scale 200ms
```

---

## 8. Glassmorphism

### Dark Theme Glass
```css
.glass-light {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-medium {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### Light Theme Glass
```css
.glass-light-mode {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
```

**Usage**: Overlays, modals, floating panels, navigation bars

---

## 9. Gradients

### Available Gradients
```typescript
primary:  linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)
accent:   linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)
success:  linear-gradient(135deg, #10b981 0%, #34d399 100%)
warning:  linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)
error:    linear-gradient(135deg, #ef4444 0%, #f87171 100%)
night:    linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)
dawn:     linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Usage**: Hero headings, primary CTAs, special badges

---

## 10. Layout Patterns

### Page Structure
```
Header (48-64px height)
├─ Logo + Title
├─ Navigation/Breadcrumbs
└─ Actions (Theme toggle, Settings, Profile)

Main Content (flexible height)
├─ Page Title + Description (40-64px spacing)
├─ Filters/Search Bar (optional)
└─ Content Grid/List

Footer (optional)
└─ Additional actions or info
```

### Grid Systems

#### Project Cards (Dashboard)
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 24px;
```

#### Tool Cards (Feature Pages)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 24px;

@media (max-width: 1024px): repeat(2, 1fr);
@media (max-width: 640px): repeat(1, 1fr);
```

### Container Max Widths
```typescript
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## 11. Accessibility

### Focus States
```typescript
Outline: 2px solid primary.main
Outline offset: 2px
Border radius: inherit from element
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus visible on Tab, hidden on click
- Logical tab order maintained

### Screen Reader Support
- Semantic HTML5 elements
- ARIA labels for icon-only buttons
- Alt text for all images
- Status announcements for dynamic content

### Color Contrast
- AAA standard: 7:1 for normal text, 4.5:1 for large text
- Never rely on color alone for information
- Provide text labels with status colors

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Page-Specific Guidelines

### ProjectSelectionView (Project Cards)
- **Layout**: Grid with 3 columns (desktop), 2 (tablet), 1 (mobile)
- **Card height**: Auto (flexible based on content)
- **Hover effect**: Lift + glow + border highlight
- **Status badges**: Top-left corner
- **Action buttons**: Top-right corner icon
- **Metadata**: Bottom footer section with muted background

### ProjectDashboardPage (Tool Cards)
- **Layout**: Grid with 3 columns
- **Tool icons**: 56x56px avatar with colored background (10% opacity)
- **Color coding**: Each tool gets unique color (blue, orange, green, purple, etc.)
- **Status**: Chip in top-right showing progress/status
- **CTA**: "Open Tool" button at bottom

### ROI Editor (Dark-First Design)
- **Background**: Pure black (#0a0a0a) for canvas area
- **Sidebars**: #1e1e1e with subtle borders
- **Canvas**: Black with white/colored ROI outlines
- **Controls**: Floating with glass effect
- **Split view**: 50/50 reference vs workspace

### Live Monitoring Pages
- **High contrast**: Status colors must be vibrant
- **Real-time indicators**: Pulse animation for active states
- **Data refresh**: Shimmer effect during updates
- **Alert priority**: Color + icon + size hierarchy

---

## 13. Implementation Guidelines

### Using the Theme
```typescript
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const isDark = theme.palette.mode === 'dark';

// Access custom palette
theme.palette.accent.main
theme.palette.glass.medium
theme.palette.background.elevated
```

### Using Gradients
```typescript
import { GRADIENTS } from '../styles/theme';

sx={{
  background: GRADIENTS.primary,
  '&:hover': { background: GRADIENTS.accent }
}}
```

### Using Shadows
```typescript
import { SHADOWS } from '../styles/theme';

const theme = useTheme();
const isDark = theme.palette.mode === 'dark';
const shadows = isDark ? SHADOWS.dark : SHADOWS.light;

sx={{ boxShadow: shadows.xl }}
```

### Responsive Design
```typescript
sx={{
  display: { xs: 'block', md: 'flex' },
  padding: { xs: 2, md: 4 },
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)'
  }
}}
```

---

## 14. Do's and Don'ts

### Do
- Use the 8px grid system for all spacing
- Apply gradients to primary CTAs only
- Maintain consistent border radius across similar components
- Use semantic color names (success, error, warning)
- Test both dark and light themes
- Ensure WCAG AAA compliance
- Use micro-interactions for better UX
- Keep animations subtle and purposeful

### Don't
- Mix spacing values outside the grid system
- Overuse gradients (reserve for important elements)
- Use pure white (#fff) or pure black (#000) for text
- Rely on color alone for status indication
- Create custom shadows (use elevation system)
- Animate multiple properties simultaneously
- Use heavy animations that impact performance
- Forget hover/focus/active states

---

## 15. Browser Support

### Minimum Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Enhancement
- Glassmorphism: Falls back to solid background if backdrop-filter unsupported
- Gradients: Falls back to solid primary color
- Animations: Respects prefers-reduced-motion
- Grid: Falls back to flexbox on older browsers

---

## 16. Performance Considerations

### Optimization Techniques
1. **CSS-in-JS**: Use `sx` prop for dynamic styles, `styled` for static
2. **Animations**: Use `transform` and `opacity` (GPU-accelerated)
3. **Images**: Lazy load, use appropriate formats (WebP with fallback)
4. **Fonts**: Subset fonts, use font-display: swap
5. **Shadows**: Avoid excessive box-shadows on many elements

### Bundle Size
- Material-UI tree-shaking enabled
- Import only required components
- Use dynamic imports for heavy components

---

## Quick Reference

### File Structure
```
frontend/src/
├── styles/
│   └── theme.ts           // Main theme configuration
├── index.css              // Global styles & utilities
└── components/            // Styled components
```

### Key Constants
```typescript
Primary: #3b82f6
Grid: 8px
Border radius: 8px (default), 12px (cards)
Transition: 200-300ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Essential Utilities
```css
.gradient-primary        // Primary gradient background
.glass-medium            // Glassmorphism effect
.animate-fade-in-up      // Entrance animation
.hover-lift              // Lift on hover
.elevation-xl            // Extra large shadow
```

---

**Last Updated**: 2025-12-31
**Version**: 1.0.0
**Maintained by**: UX/UI Design Team
