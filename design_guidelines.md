# Design Guidelines: The Glass Wall - Encryption Visualizer

## Design Approach

**System**: Material Design with custom educational patterns
**Rationale**: This educational tool requires clear information hierarchy, strong visual feedback for mode changes, and interactive components that feel responsive and engaging. Material Design provides excellent component patterns for toggles, tooltips, and progressive disclosure while allowing customization for the unique split-screen and timeline visualizations.

**Key Principles**:
- Progressive disclosure: technical details expand on demand
- Visual hierarchy through size and weight, not just treatment
- Generous breathing room around educational content
- Clear state changes that feel immediate and satisfying

---

## Core Design Elements

### A. Typography

**Font Family**: Inter (primary), JetBrains Mono (code/wire view)

**Hierarchy**:
- Page title: 2.5rem, bold (40px)
- Section headers: 1.75rem, semibold (28px)
- Control labels: 0.875rem, medium, uppercase, letter-spacing 0.05em
- Body text: 1rem, regular (16px)
- Wire view content: 0.875rem, JetBrains Mono, regular
- Tooltips/hints: 0.875rem, regular
- Button text: 1rem, medium

### B. Layout System

**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16 units
- Component padding: p-6 or p-8
- Section gaps: gap-8 or gap-12
- Inline spacing: gap-2 or gap-4
- Card padding: p-6
- Button padding: px-6 py-3

**Grid Structure**:
- Container: max-w-7xl mx-auto px-4
- Split-screen: grid grid-cols-1 lg:grid-cols-2 gap-8
- Control panels: flex flex-col gap-6
- Timeline: vertical flex flex-col gap-8

---

## C. Component Library

### 1. Split-Screen Layout
- Left: "User View" - dummy login form with clear labels
- Right: "Wire View" - network traffic visualization
- Mobile: stack vertically, User View first
- Desktop: 50/50 split with subtle divider between panels
- Each panel has rounded container with padding p-8

### 2. Control Panel (Top of page)
- Horizontal layout with flex gap-6
- Three toggle groups: HTTP/HTTPS, VPN OFF/ON, Auto-play
- Toggle switches with clear ON/OFF states, labels above switches
- Each toggle group in its own container with subtle border, p-4 rounded

### 3. Action Buttons
- Primary: "Send Request" - large, prominent, px-8 py-4, rounded-lg
- Secondary: "Replay Timeline" - medium size, px-6 py-3, rounded-lg
- Tertiary: "Next Step" (step mode) - smaller, px-4 py-2, rounded
- Buttons stack vertically on mobile, horizontal on desktop

### 4. Timeline Component
**Structure**:
- Vertical layout with three nodes: Connect → Request → Response
- Each node: circle indicator (w-12 h-12) connected by vertical line (h-16)
- Node states: inactive (outlined), active (filled), complete (filled with check)
- Animation: nodes activate sequentially with 1s intervals

**Node Content**:
- Icon in circle (DNS, upload, download)
- Title text next to circle (1rem, semibold)
- Expandable detail panel below (starts collapsed)
- Expand/collapse with smooth transition

### 5. Wire View Content Panels
**Collapsed state**: One-line summary with expand arrow
**Expanded state**: 
- Headers section: key-value pairs in monospace, gap-2
- Payload section: bordered container, p-4, rounded
- HTTP mode: JSON-like structure, clearly formatted
- HTTPS mode: Ciphertext blocks represented as monospace gibberish with "ENCRYPTED" label
- VPN overlay: Semi-transparent tunnel visualization wrapping content

### 6. Info Banners
- Warning banner (public Wi-Fi): full-width, px-6 py-4, rounded-lg, flex items-center gap-3
- Icon left, text right, close button far right
- Mode change notification: smaller, inline banner above timeline
- Tooltips: absolute positioned, max-w-xs, px-3 py-2, rounded shadow-lg

### 7. Dummy Login Form (User View)
- Clean, centered layout, max-w-md
- Input fields: full-width, px-4 py-3, rounded border
- Labels: mb-2, font-medium
- Submit button: full-width, py-3, rounded-lg
- Fields clearly marked "DEMO - Not real credentials"

### 8. VPN Tunnel Visualization
- Animated dashed line/border wrapping timeline
- "Tunnel" label with lock icon
- Route indicator: Device → VPN Server → Destination
- Small icons representing each hop, connected by animated lines

---

## D. Animations & Interactions

**Timeline Animation** (3-second total):
- Connect node: 0-1s (pulse effect on node, line extends)
- Request node: 1-2s (pulse effect, content fades in)
- Response node: 2-3s (pulse effect, completion state)
- Wire view content: stagger fade-in 200ms after each node activates

**Toggle Switches**: 
- Smooth slide transition 200ms
- Thumb moves, track changes state
- Haptic feedback via subtle scale transform

**Expandable Panels**:
- Height transition 300ms ease-out
- Content fade-in 200ms delay
- Rotate chevron icon 200ms

**Mode Changes**:
- Fade out old wire view content 200ms
- Fade in new content 200ms after 100ms delay
- Notification banner slides down 300ms

**Button States**:
- Hover: subtle scale 1.02, 200ms
- Active: scale 0.98
- Disabled: opacity 0.5, cursor-not-allowed

---

## Layout Specifications

**Page Structure**:
1. Header: Page title + subtitle (max-w-4xl, text-center, mb-12)
2. Info banner: Public Wi-Fi warning (mb-8)
3. Control panel: Mode toggles (mb-8)
4. Action buttons: Send Request + Replay (mb-12)
5. Split-screen content: User View | Wire View
6. Footer: Additional educational links/resources (mt-16)

**Responsive Breakpoints**:
- Mobile (< 768px): Single column, stack all panels
- Tablet (768px - 1024px): Split-screen if space allows
- Desktop (> 1024px): Full split-screen layout

**Accessibility**:
- All toggles keyboard navigable
- Focus states: outline offset 2px, rounded
- ARIA labels on all interactive elements
- Sufficient touch targets: minimum 44x44px
- Screen reader announcements for timeline state changes