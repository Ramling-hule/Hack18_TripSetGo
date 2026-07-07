# Travel Profile Component Architecture

This document specifies the target component tree, modular specifications, folder organization, and interaction properties for TripSetGo's travel profile workspace.

---

## 1. Component Folders

To maintain clean separation, components are grouped into:
1. **`components/common`**: Reusable generic widgets.
2. **`components/layout`**: Layout shells and page grids.
3. **`components/domain/profile`**: Domain-specific widgets coupled to the user's auth slice.

---

## 2. Component Specifications

### 1. ProfileLayout
- **Folder**: `components/layout`
- **Purpose**: Page layout wrapper providing tab navigation (Travel Identity vs. Account Settings).
- **Props**: `children` (React nodes)
- **Dependencies**: React, Framer Motion
- **Reusable**: Yes
- **Animation**: Smooth tab-switching slide transitions.
- **Loading State**: Displays page-level skeleton outline.
- **Error State**: Displays full-page error boundary banner.
- **Accessibility**: Landmark tags (`role="navigation"`, `role="main"`).
- **Responsive Behavior**: Splits into two columns on desktop; stacks vertically on mobile.

### 2. ProfileHero
- **Folder**: `components/domain/profile`
- **Purpose**: Top cover banner housing the user's avatar, Pro badges, and verified status.
- **Props**: `user` (object), `isPro` (bool)
- **Dependencies**: `Avatar`
- **Reusable**: No
- **Animation**: Micro hover translations on badges.
- **Loading State**: Rounded skeleton frames for avatars.
- **Error State**: N/A
- **Accessibility**: Landmark header region.
- **Responsive Behavior**: Center-aligned items on mobile.

### 3. UserOverview
- **Folder**: `components/domain/profile`
- **Purpose**: Sidebar bio card detailing location, bio text description, and social handles.
- **Props**: `bio` (str), `location` (str), `email` (str)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Staggered text entrance.
- **Loading State**: Skeleton text rows.
- **Error State**: N/A
- **Accessibility**: Landmark descriptions.
- **Responsive Behavior**: Full width on mobile.

### 4. TravelStatistics
- **Folder**: `components/domain/profile`
- **Purpose**: Badges indicating user travel levels, trips count, and follower counts.
- **Props**: `tripsCount` (num), `followers` (num), `following` (num)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Animated counts counters.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Accessible labels.
- **Responsive Behavior**: Scales from horizontal row to wrapped column.

### 5. TravelPreferences
- **Folder**: `components/domain/profile`
- **Purpose**: Grid list of category chips displaying travel interests (e.g. Hiking, Foodie, Relaxing).
- **Props**: `interests` (array)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Chip entrance scaling.
- **Loading State**: Skeleton pills.
- **Error State**: N/A
- **Accessibility**: Tabular tags.
- **Responsive Behavior**: Wraps chips.

### 6. SavedDestinations
- **Folder**: `components/domain/profile`
- **Purpose**: List of bookmarked cities with click-triggers routing to discover pages.
- **Props**: `destinations` (array)
- **Dependencies**: React Router `Link`
- **Reusable**: Yes
- **Animation**: Hover cell lift.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Focusable anchors.
- **Responsive Behavior**: Wraps items.

### 7. SavedTrips
- **Folder**: `components/domain/profile`
- **Purpose**: Horizontal slider card list showing saved trip outlines and photography covers.
- **Props**: `trips` (array)
- **Dependencies**: `PhotographyCard`
- **Reusable**: Yes
- **Animation**: Hover shadow highlights.
- **Loading State**: Skeleton cards.
- **Error State**: N/A
- **Accessibility**: Accessible list controls.
- **Responsive Behavior**: Horizontal swipe container on mobile.

### 8. Achievements
- **Folder**: `components/domain/profile`
- **Purpose**: reputation scoreboard panel displaying gamified badge icons.
- **Props**: `score` (num), `badges` (array)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Badge scaling hover effects.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Focus states for badges.
- **Responsive Behavior**: Wraps grid.

### 9. LinkedAccounts
- **Folder**: `components/domain/profile`
- **Purpose**: Auth connections controls panel showing OAuth status (Google connection).
- **Props**: `providers` (array), `onConnect` (fn), `onDisconnect` (fn)
- **Dependencies**: React, Lucide Icons
- **Reusable**: Yes
- **Animation**: Icon hover shifts.
- **Loading State**: Disables buttons.
- **Error State**: N/A
- **Accessibility**: Focus outlines.
- **Responsive Behavior**: Full width.

### 10. NotificationPreferences
- **Folder**: `components/domain/profile`
- **Purpose**: Form toggles setting email alerts and pushes preferences.
- **Props**: `settings` (object), `onChange` (fn)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Toggle switch slide glide (150ms ease).
- **Loading State**: Disables toggles.
- **Error State**: N/A
- **Accessibility**: Form checkbox labels.
- **Responsive Behavior**: Spans full width.

### 11. PrivacySettings
- **Folder**: `components/domain/profile`
- **Purpose**: Form controls setting profile visibility status (public vs. private).
- **Props**: `isPrivate` (bool), `onChange` (fn)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: N/A
- **Loading State**: Disables inputs.
- **Error State**: N/A
- **Accessibility**: Screen reader helper tags.
- **Responsive Behavior**: Spans full width.

### 12. AccountActions
- **Folder**: `components/common`
- **Purpose**: Standard submit action buttons and logout triggers.
- **Props**: `onSave` (fn), `onLogout` (fn), `submitting` (bool)
- **Dependencies**: `Button`
- **Reusable**: Yes
- **Animation**: Micro scale transitions on click.
- **Loading State**: Disables saving buttons.
- **Error State**: N/A
- **Accessibility**: Focus states.
- **Responsive Behavior**: Centered on mobile.

### 13. Footer
- **Folder**: `components/layout`
- **Purpose**: Bottom footer panel containing app links and descriptions.
- **Props**: None
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: N/A
- **Loading State**: N/A
- **Error State**: N/A
- **Accessibility**: Semantic layout.
- **Responsive Behavior**: Center-aligned on mobile.
