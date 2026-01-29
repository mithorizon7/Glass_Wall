# The Glass Wall - Encryption & Network Security Visualizer

## Overview

An interactive educational web application that makes encryption tangible. Part of a larger security training lab series designed for workforce training. The app teaches:

- What happens in HTTP vs HTTPS
- What a VPN does conceptually on public Wi-Fi
- The difference between content and metadata
- Safe behavior on untrusted networks

## Current State

**Status**: MVP Complete

The application is a fully functional frontend simulation with no real network calls. All traffic visualization is simulated for educational purposes.

## Project Architecture

### Frontend Structure

```
client/src/
├── pages/
│   └── glass-wall.tsx        # Main page component with state management
├── components/
│   ├── demo-login-form.tsx   # Simulated login form (User View)
│   ├── wire-view.tsx         # Network traffic visualization
│   ├── timeline.tsx          # Connect → Request → Response timeline
│   ├── control-panel.tsx     # Mode toggles (HTTP/HTTPS, VPN, options)
│   ├── info-banner.tsx       # Educational banners and notifications
│   ├── vpn-tunnel-overlay.tsx # Visual VPN tunnel effect
│   ├── cheat-sheet-modal.tsx # Printable HTTP/HTTPS/VPN comparison guide
│   ├── progress-tracker.tsx  # LocalStorage-based learning progress
│   ├── comparison-view.tsx   # Side-by-side HTTP vs HTTPS comparison
│   ├── scenario-selector.tsx # Network scenario selection (4 scenarios)
│   ├── quiz-mode.tsx         # Interactive security knowledge quiz
│   └── guided-learning-overlay.tsx # 10-step educational onboarding tour
└── App.tsx                   # Router setup
```

### Key Features

**Core Visualization**

1. **Split-Screen Interface**: Left shows user view (login form), right shows wire view (network traffic)
2. **Protocol Toggle**: HTTP shows plaintext, HTTPS shows encrypted ciphertext blocks
3. **VPN Toggle**: Shows tunnel visualization and route indicator
4. **Timeline Animation**: Visual progression through Connect → Request → Response
5. **Step Mode**: Advance one stage at a time for detailed learning
6. **Auto-Play**: Automatically replay when switching modes
7. **Progressive Disclosure**: Expandable sections for technical details

**Learning Tools** 8. **Cheat Sheet Modal**: Printable summary of HTTP/HTTPS/VPN differences with quick reference table 9. **Progress Tracker**: Tracks which mode combinations learners have explored (persisted to localStorage) 10. **Comparison View**: Side-by-side HTTP vs HTTPS wire views with animated comparison 11. **Scenario Selector**: 4 real-world scenarios (Home, Coffee Shop, Airport, Hotel) with risk levels 12. **Quiz Mode**: 8-question interactive quiz testing encryption knowledge with explanations 13. **Guided Learning Overlay**: 10-step educational onboarding tour with spotlight effects, explaining WHY encryption matters

### Design Tokens

- **Fonts**: Inter (primary), JetBrains Mono (code/wire view)
- **Colors**:
  - HTTP Danger: `--http-danger` (red tones)
  - HTTPS Success: `--https-success` (green tones)
  - VPN Tunnel: `--vpn-tunnel` (purple tones)
  - Warning: `--warning-bg` (amber tones)

## Recent Changes

- Initial implementation of all MVP features (December 2024)
- Fixed timeline step mode progression using functional state updates
- Enhanced VPN tunnel overlay with glow effect and animation
- Added auto-expansion of wire view sections during timeline playback
- Added downloadable cheat sheet modal summarizing HTTP/HTTPS/VPN differences
- Implemented progress tracking using localStorage to show which modes learners have explored
- Created side-by-side comparison view showing HTTP and HTTPS wire views simultaneously
- Built scenario selector with four scenarios (Airport Wi-Fi, Coffee Shop, Corporate Office, Home Network) with risk-specific messaging
- Developed interactive quiz mode with 8 questions, scoring, explanations, and progress tracking
- **December 2024 Security Education Update:**
  - Added TLS handshake visualization for HTTPS (timeline shows 4 stages, wire view shows handshake details)
  - Added permanent public Wi-Fi warning banner about deception risks (rogue hotspots, fake portals)
  - Added VPN trust warning explaining that VPN shifts trust, doesn't eliminate it
  - Added tooltips to wire view explaining request/response content and encryption status
  - Added ciphertext disclaimer noting visualization is illustrative, not actual TLS dump
  - Fixed TypeScript iteration errors by adding ES2020 target
  - Fixed protocol switching regression when changing from HTTPS to HTTP mid-timeline
- **December 2024 i18n & Design Fixes:**
  - Fixed hardcoded English strings in cheat-sheet-modal.tsx (badges, print button, footer)
  - Added translation keys: cheatSheet.printButton, httpBadge, httpsBadge, vpnBadge, printFooter
  - Replaced one-sided borders on Cards with gradient backgrounds (design guideline compliance)
  - Added gap to justify-between elements across control-panel, demo-login-form, progress-tracker, quiz-mode
  - Added data-testid="button-close-dialog" to Dialog component for testing
- **December 2024 Guided Learning Feature:**
  - Implemented 10-step guided learning overlay with spotlight effect
  - Educational philosophy: Explains WHY encryption matters, not just HOW to use the tool
  - Steps cover: Introduction, User View, Wire View, Protocol Toggle, VPN Toggle, Action Area, Scenarios, Tools, Progress Tracker, Ready
  - Spotlight uses SVG mask to create cutout highlighting target elements
  - LocalStorage persistence (`glassWall_onboardingCompleted`) so users only see once
  - Restart Guide button in footer for returning users
  - Full translations in EN, LV, RU with educational messaging
  - **Robustness Improvements:**
    - `useTourTarget` hook with ResizeObserver for robust element tracking
    - Smart card positioning via `computeCardPosition` with viewport edge detection
    - SSR-safe `useViewportSize` hook (defers window access to useEffect)
    - CleanupRef pattern prevents observer/listener memory leaks
    - Scroll lock during tour with scrollbar width compensation
    - SVG animation guards prevent undefined attribute errors

## User Preferences

- Educational/approachable design (not dry/corporate)
- Engaging animations and visual feedback
- No real credentials or network calls
- Zero-risk learning environment
- Accessible to non-technical learners

## Technical Notes

- This is a frontend simulation app - no backend API calls needed
- All "network traffic" is simulated using in-memory objects
- Demo payload is constant across mode changes for apples-to-apples comparison
- Uses functional state updates for reliable step mode progression

### i18n (Internationalization)

- **Library**: i18next with react-i18next, i18next-browser-languagedetector, i18next-icu
- **Languages**: English (en), Latvian (lv), Russian (ru)
- **Fallback Language**: Latvian (lv) - primary deployment target is Latvia
- **Namespaces**: `common` (shared strings), `glassWall` (app-specific)
- **Translation files**: `client/src/locales/{lang}/common.json` and `glass-wall.json`
- **Term locks** (never translated): HTTP, HTTPS, VPN, TLS, DNS, TCP, POST, Set-Cookie, SSL
- **Pattern**: `t("section.key")` for nested keys, `t("common:key")` for common namespace
- **ICU Plurals**: Used for count-dependent strings (see `plurals` key in common.json)
  - Russian uses full plural forms: one, few, many, other
  - Latvian uses: =0, =1, other
- **Dev Mode Features**: Missing keys show `[MISSING: key]` and log to console
- **Validation Script**: `node scripts/validate-i18n.js` - checks for missing keys, duplicate keys, ICU syntax, placeholder consistency
- **Aria Labels**: Stored in `common.json` under `aria` key for accessibility
- **Important**: Avoid duplicate JSON keys - later definitions override earlier ones causing rendering errors

#### Key Naming Conventions

Follow this pattern: `feature.screen.element.state`

Examples:

- `controls.protocol` - Protocol toggle control
- `timeline.connect` - Timeline connect step
- `quiz.questions.q1.question` - Quiz question 1 text
- `progressTracker.httpWithVpn` - Progress tracker mode label

Bad examples (avoid):

- `button1`, `msg_42`, `text123` - Non-descriptive
- `Login button` - Text as ID (use stable keys)

#### i18n Scripts

- `node scripts/validate-i18n.js` - Validate translations (key parity, ICU syntax)
- `node scripts/i18n-extract.js` - Extract keys from source and check coverage
- `node scripts/i18n-render-sweep.js` - Check for [MISSING: markers and empty translations
- `node scripts/i18n-check.js` - Run extract + validate + render-sweep (CI-ready)

**To add npm scripts (recommended):** Add to package.json scripts section:

```json
"i18n:extract": "node scripts/i18n-extract.js",
"i18n:validate": "node scripts/validate-i18n.js",
"i18n:check": "node scripts/i18n-check.js"
```

#### Pseudo-Locale Testing

Use `pseudo` locale to test layout expansion and find missing translations:

1. Set `localStorage.setItem('i18nextLng', 'pseudo')` in browser console
2. Refresh page - all text should show `[Bràçkétéd téxt !!!]`
3. Any text NOT in brackets = hardcoded/missing translation

#### Glossary

See `docs/i18n-glossary.md` for term consistency across languages.
