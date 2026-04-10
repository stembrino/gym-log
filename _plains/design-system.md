# LYTELOG DESIGN SYSTEM: RETRO-TECH SPECIFICATIONS

## 1. Design Philosophy

- Style: Terminal-Core / Retro-Linux (Ubuntu terminal + developer docs).
- Core Principle: Zero-friction logging with high legibility and large touch targets.
- Visual Language: Flat UI, no shadows, no gradients, monospace-first.
- Product Tone: Technical, reliable, precise, tool-like.

## 2. Color Tokens

### 2.1 Global

- brand.primary: #E95420
- status.success: #31F91E

### 2.2 Light Mode

- bg.app: #F7F7F7
- bg.surface: #FFFFFF
- text.primary: #2C2C2C
- text.muted: #6B7280
- border.default: #D1D5DB

### 2.3 Dark Mode

- bg.app: #1E1E1E
- bg.surface: #2D2D2D
- text.primary: #EAEAEA
- text.muted: #888888
- border.default: #404040

## 3. Typography

- Base Font Family: Menlo, Monaco, Consolas, Courier New, monospace.
- Section Titles: uppercase + semibold/bold.
- Data Inputs (weight/reps): minimum 20px font size.
- Labels: wider letter spacing.
- Data values: tighter letter spacing.

## 4. Layout + Spacing

- Minimum touch target: 44x44.
- Screen padding: 16.
- Card padding: 12 to 16.
- Vertical rhythm: spacing steps of 4/8/12/16.
- Radius: 0 to 2 only (avoid rounded pill UI).

## 5. Component Rules

### 5.1 Inputs

- Shape: square or 2px radius.
- Border: 1px default, 2px on focus.
- Focus color: brand.primary.
- Placeholder: text.muted.
- Input density: large enough for fast logging.

### 5.2 Buttons

- Primary:
  - background: brand.primary
  - text: white
  - text-transform: uppercase
  - font: monospace + bold
- Secondary:
  - transparent/surface background
  - border: 1px border.default
  - text: text.primary
- Never use elevation/shadows.

### 5.3 Cards

- Surface uses bg.surface.
- Separation uses borders only (0.5px to 1px).
- No glow, no blur, no drop shadows.

### 5.4 Tabs + Header Controls

- Header icons/buttons (theme and language) should stay compact but tap-safe.
- Tab labels must come from i18n keys, never hardcoded.
- Keep icon color synchronized with active theme text color.

## 6. Accessibility

- Keep text contrast >= WCAG AA where possible.
- Do not rely on color alone for state (selected, done, error).
- All icon-only buttons require accessibility labels.

## 7. Internationalization Rules

- All user-facing strings must come from translation keys.
- No literal English/Portuguese strings inside screens/components.
- Use pt-BR as default locale; en-US as secondary locale.

## 8. Theme Rules

- Dark is default.
- Theme tokens drive all surfaces/text/borders.
- Never hardcode random colors in feature screens.

## 9. NativeWind Theme Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#E95420",
        terminal: "#31F91E",
        retro: {
          light: {
            bg: "#F7F7F7",
            card: "#FFFFFF",
            text: "#2C2C2C",
            muted: "#6B7280",
            border: "#D1D5DB",
          },
          dark: {
            bg: "#1E1E1E",
            card: "#2D2D2D",
            text: "#EAEAEA",
            muted: "#888888",
            border: "#404040",
          },
        },
      },
      fontFamily: {
        mono: ["Menlo", "Monaco", "Consolas", "Courier New", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
      },
    },
  },
};
```

## 10. Copilot Generation Instruction

When generating React Native components for Lytelog:

- Use monospace typography by default.
- Apply Retro-Tech color tokens from this guide.
- Keep UI flat (no shadows/gradients).
- Prefer square/2px radius shapes.
- Keep inputs and action targets large for quick gym logging.
- Use i18n keys for all labels/messages.
