# STU-8: Design Specification

## Styleguide (New)

### Design Tokens
Add to `frontend/src/index.css` using Tailwind v4's `@theme` directive:

```css
@import "tailwindcss";

@theme {
  /* Brand Colors */
  --color-primary: #e11d48;        /* rose-600 */
  --color-primary-hover: #be123c;  /* rose-700 */
  --color-primary-focus: #f43f5e;  /* rose-500 */
  --color-primary-border: #fecdd3; /* rose-200 */
  --color-primary-text: #e11d48;   /* rose-600 */
  --color-primary-light: #fff1f2;  /* rose-50 */
  
  /* Neutral Palette */
  --color-background: #fafaf9;     /* stone-50 */
  --color-surface: #ffffff;
  --color-border: #e7e5e4;         /* stone-200 */
  --color-text: #1c1917;           /* stone-900 */
  --color-text-secondary: #57534e; /* stone-600 */
  --color-text-muted: #78716c;     /* stone-500 */
  
  /* Extended Neutrals */
  --color-text-dark: #0c0a09;      /* stone-950 */
  --color-text-light: #a8a29e;     /* stone-400 */
  --color-bg-subtle: #f5f5f4;      /* stone-100 */
  --color-bg-muted: #e7e5e4;       /* stone-200 */
  
  /* Gray Palette (for forms) */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Error Colors */
  --color-error: #dc2626;          /* red-600 */
  --color-error-light: #fef2f2;    /* red-50 */
  --color-error-text: #991b1b;     /* red-800 */
}
```

### Reusable Utility Classes
```css
/* Button Patterns */
.btn-primary {
  @apply w-full py-2.5 px-4 text-sm font-medium text-white bg-primary rounded-md 
         hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 
         focus:ring-primary-focus transition-colors;
}

.btn-secondary {
  @apply w-full py-2.5 px-4 text-sm font-medium text-primary border border-primary-border 
         rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 
         focus:ring-offset-2 focus:ring-primary-focus transition-colors;
}

/* Input Pattern */
.input-field {
  @apply w-full px-3 py-2 border border-gray-200 text-sm text-gray-900 
         placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 
         focus:ring-offset-2 focus:ring-primary-focus;
}

/* Card Pattern */
.card {
  @apply bg-surface rounded-xl shadow-md p-6 sm:p-8;
}

/* Text Utilities */
.text-heading {
  @apply text-gray-900 font-bold;
}

.text-body {
  @apply text-gray-600;
}

.text-muted {
  @apply text-gray-500;
}
```

## Color Palette Updates

### Background
- **Current:** `bg-gray-50` (line 36)
- **New:** `bg-background` (token) or `bg-stone-50`

### Primary Accent
- **Current:** `bg-indigo-600` (line 156)
- **New:** `bg-primary` (token) or `bg-rose-600`

### Hover Accent
- **Current:** `hover:bg-indigo-700` (line 156)
- **New:** `hover:bg-primary-hover` (token) or `hover:bg-rose-700`

### Focus Ring
- **Current:** `focus:ring-indigo-500` (lines 68, 85, 101, 118, 132, 145, 156, 165)
- **New:** `focus:ring-primary-focus` (token) or `focus:ring-rose-500`

### Text Links
- **Current:** `text-indigo-600 hover:text-indigo-700` (lines 47, 145)
- **New:** `text-primary-text hover:text-primary-hover` (tokens) or `text-rose-600 hover:text-rose-700`

### Border Accent
- **Current:** `border-indigo-200` (line 165)
- **New:** `border-primary-border` (token) or `border-rose-200`

### Checkbox
- **Current:** `text-indigo-600 focus:ring-indigo-500` (line 132)
- **New:** `text-primary focus:ring-primary-focus` (tokens) or `text-rose-600 focus:ring-rose-500`

### Secondary Button Hover
- **Current:** `hover:bg-indigo-50` (line 165)
- **New:** `hover:bg-primary-light` (token) or `hover:bg-rose-50`

## Typography Updates

### Heading
- **Current:** `text-3xl font-extrabold` (line 40)
- **New:** `text-2xl font-bold`

## Spacing Updates

### Button Height
- **Current:** `py-2` (lines 156, 165)
- **New:** `py-2.5`

## Files to Modify

### 1. `frontend/src/index.css`
- Add `@theme` block with design tokens
- Add reusable utility classes

### 2. `frontend/src/views/AuthPage.tsx`
- Replace hardcoded colors with tokens
- Update typography and spacing

## Lines to Update in AuthPage.tsx
1. Line 36: Background color
2. Line 40: Heading typography
3. Line 47: Link color
4. Line 68: Focus ring
5. Line 85: Focus ring
6. Line 101: Focus ring
7. Line 118: Focus ring
8. Line 132: Checkbox color + focus ring
9. Line 145: Link color
10. Line 156: Button colors + height
11. Line 165: Secondary button colors + height + border
