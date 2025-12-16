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
│   └── quiz-mode.tsx         # Interactive security knowledge quiz
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

**Learning Tools**
8. **Cheat Sheet Modal**: Printable summary of HTTP/HTTPS/VPN differences with quick reference table
9. **Progress Tracker**: Tracks which mode combinations learners have explored (persisted to localStorage)
10. **Comparison View**: Side-by-side HTTP vs HTTPS wire views with animated comparison
11. **Scenario Selector**: 4 real-world scenarios (Home, Coffee Shop, Airport, Hotel) with risk levels
12. **Quiz Mode**: 8-question interactive quiz testing encryption knowledge with explanations

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
