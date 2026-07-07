# collaborative Travel Analytics Component Architecture

This document specifies the target component tree, modular specifications, folder organization, and interaction properties for TripSetGo's collaborative travel analytics page.

---

## 1. Component Folders

To maintain clean separation, components are grouped into:
1. **`components/common`**: Reusable generic widgets.
2. **`components/layout`**: Layout panels and dashboard frames.
3. **`components/domain/analytics`**: Domain-specific widgets coupled to the trips history slice.

---

## 2. Component Specifications

### 1. AnalyticsLayout
- **Folder**: `components/layout`
- **Purpose**: Page layout wrapper providing tab navigation (History Overview vs. Spending Metrics).
- **Props**: `children` (React nodes)
- **Dependencies**: React, Framer Motion
- **Reusable**: Yes
- **Animation**: Smooth tab-switching slide transitions.
- **Loading State**: Displays page-level skeleton outline.
- **Error State**: Displays full-page error boundary banner.
- **Accessibility**: Landmark tags (`role="navigation"`, `role="main"`).
- **Responsive Behavior**: Splits into two columns on desktop; stacks vertically on mobile.

### 2. TravelSummaryHero
- **Folder**: `components/domain/analytics`
- **Purpose**: Header banner displaying user status, travel levels, and total metrics.
- **Props**: `user` (object), `tripsCount` (num)
- **Dependencies**: `Avatar`
- **Reusable**: No
- **Animation**: Entrance fade and micro button hover transitions.
- **Loading State**: Rounded skeletons.
- **Error State**: N/A
- **Accessibility**: Landmark `<header>`.
- **Responsive Behavior**: Wraps items on mobile.

### 3. TravelStatsGrid
- **Folder**: `components/domain/analytics`
- **Purpose**: Grid containing individual StatCards showing totals (trips, budgets, likes, destinations).
- **Props**: `stats` (array)
- **Dependencies**: `StatCard`
- **Reusable**: Yes
- **Animation**: Staggered items entrance.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Focus outline wrappers.
- **Responsive Behavior**: Scales from 5 columns (desktop) to single vertical list (mobile).

### 4. BudgetInsights
- **Folder**: `components/domain/analytics`
- **Purpose**: Stats details card highlighting spending ratios, total budgets, and averages.
- **Props**: `totalBudget` (num), `avgBudget` (num)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Animated metrics counter.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Accessible labels.
- **Responsive Behavior**: Full width container.

### 5. DestinationInsights
- **Folder**: `components/domain/analytics`
- **Purpose**: List showing favorite destination highlights and geocoded coordinates.
- **Props**: `destinations` (array)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Fade-in on mount.
- **Loading State**: Skeleton pills.
- **Error State**: N/A
- **Accessibility**: List attributes (`role="list"`, `role="listitem"`).
- **Responsive Behavior**: Wraps items.

### 6. TripTimeline
- **Folder**: `components/domain/analytics`
- **Purpose**: Vertical timeline display logging completed and upcoming travel history.
- **Props**: `trips` (array)
- **Dependencies**: React, Lucide Icons
- **Reusable**: Yes
- **Animation**: Chronological path entrance.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Chronological landmarks.
- **Responsive Behavior**: Left-aligned details on mobile.

### 7. TravelFrequency
- **Folder**: `components/domain/analytics`
- **Purpose**: Recharts BarChart container showing favorite destination frequency.
- **Props**: `data` (array)
- **Dependencies**: Recharts
- **Reusable**: Yes
- **Animation**: Bar wipe animation.
- **Loading State**: Circle spinners.
- **Error State**: Displays "No frequency details available".
- **Accessibility**: Screen reader data table fallbacks.
- **Responsive Behavior**: Responsive wrapper.

### 8. CategoryBreakdown
- **Folder**: `components/domain/analytics`
- **Purpose**: Recharts PieChart container displaying budget range distributions.
- **Props**: `data` (array)
- **Dependencies**: Recharts
- **Reusable**: Yes
- **Animation**: Pie circular rotation wipe.
- **Loading State**: Circle spinners.
- **Error State**: Displays "No budget breakdown details".
- **Accessibility**: Screen reader data table fallbacks.
- **Responsive Behavior**: Responsive wrapper.

### 9. AITravelInsights
- **Folder**: `components/domain/analytics`
- **Purpose**: Bulleted cards pointing out travel personalities, habits, and packing guidelines.
- **Props**: `habits` (array)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Fade-in.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Status region (`role="status"`).
- **Responsive Behavior**: Spans full width.

### 10. ChartsSection
- **Folder**: `components/domain/analytics`
- **Purpose**: Layout container arranging Recharts components.
- **Props**: `children` (React nodes)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Fade-in.
- **Loading State**: N/A
- **Error State**: N/A
- **Accessibility**: Landmark grouping.
- **Responsive Behavior**: Grid to stack layouts.

### 11. Achievements
- **Folder**: `components/domain/analytics`
- **Purpose**: Gamified travel achievements (badges earned by visiting destinations).
- **Props**: `achievements` (array)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Badge scale triggers on hover.
- **Loading State**: Badge skeletons.
- **Error State**: N/A
- **Accessibility**: Accessible icons.
- **Responsive Behavior**: Wraps cards.

### 12. Recommendations
- **Folder**: `components/common`
- **Purpose**: Suggestions grid showing travel destination recommendations based on habits.
- **Props**: `recommendations` (array)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Entrance scale slide-in.
- **Loading State**: Skeleton cards.
- **Error State**: N/A
- **Accessibility**: Focus states.
- **Responsive Behavior**: Scales cleanly.

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
