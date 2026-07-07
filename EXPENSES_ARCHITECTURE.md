# collaborative Expenses Component Architecture

This document specifies the target component tree, modular specifications, folder organization, and interaction properties for TripSetGo's collaborative travel finance workspace.

---

## 1. Component Folders

To maintain clean separation, components are grouped into:
1. **`components/common`**: Reusable generic widgets.
2. **`components/layout`**: Layout panels and dashboard frames.
3. **`components/domain/expenses`**: Domain-specific widgets coupled to the group ledger API.

---

## 2. Component Specifications

### 1. ExpensesLayout
- **Folder**: `components/layout`
- **Purpose**: Page layout wrapper providing sidebar tab navigation (Ledger & Settle vs. Category Insights).
- **Props**: `children` (React nodes)
- **Dependencies**: React, Framer Motion
- **Reusable**: Yes
- **Animation**: Smooth tab-switching glide transitions.
- **Loading State**: Displays page-level skeleton grid.
- **Error State**: Displays full-page error boundary banner.
- **Accessibility**: Landmark tags (`role="navigation"`, `role="main"`).
- **Responsive Behavior**: Splits into two columns on desktop; stacks vertically on mobile.

### 2. TripBudgetHero
- **Folder**: `components/domain/expenses`
- **Purpose**: Main header banner displaying group name, member avatars, ownership badges, and mutate triggers.
- **Props**: `group` (object), `isOwner` (bool), `onAddMember` (fn), `onDeleteGroup` (fn)
- **Dependencies**: `Avatar`, `Button`
- **Reusable**: No
- **Animation**: Entrance fade and micro button hover transitions.
- **Loading State**: Rounded skeletons for avatars and headers.
- **Error State**: N/A
- **Accessibility**: Landmark `<header>`.
- **Responsive Behavior**: Wraps action buttons on mobile screens.

### 3. BudgetOverview
- **Folder**: `components/domain/expenses`
- **Purpose**: Stats grid displaying spent total, members count, and individual average shares.
- **Props**: `totalSpent` (num), `memberCount` (num), `perPerson` (num)
- **Dependencies**: React, Lucide Icons
- **Reusable**: Yes
- **Animation**: Animated numbers counter and stagger entrance.
- **Loading State**: Inline skeleton cards.
- **Error State**: N/A
- **Accessibility**: Landmark indicators with semantic labels.
- **Responsive Behavior**: Scales from 3 columns (desktop) to single vertical list (mobile).

### 4. GroupBalances
- **Folder**: `components/domain/expenses`
- **Purpose**: List of group members showing individual balance sheets (whether they owe money or get money back).
- **Props**: `members` (array), `balances` (object), `currentUserId` (str)
- **Dependencies**: `Avatar`
- **Reusable**: Yes
- **Animation**: Transition shifts on list updates.
- **Loading State**: Skeletons for member rows.
- **Error State**: N/A
- **Accessibility**: List attributes (`role="list"`, `role="listitem"`).
- **Responsive Behavior**: Compresses text labels on mobile.

### 5. SettlementSummary
- **Folder**: `components/domain/expenses`
- **Purpose**: Visual panel detailing debt clearances (who owes what to whom) to minimize transaction counts.
- **Props**: `settlements` (array), `onSettle` (fn), `members` (array)
- **Dependencies**: React, Lucide Icons
- **Reusable**: Yes
- **Animation**: Scale list entrance.
- **Loading State**: Skeleton list blocks.
- **Error State**: N/A
- **Accessibility**: Clear visual text summaries with explicit labels.
- **Responsive Behavior**: Shrinks arrows and card sizes on smaller screens.

### 6. ExpenseFilters
- **Folder**: `components/common`
- **Purpose**: Category filters and search input controls for transactions.
- **Props**: `selectedCategory` (str), `onSelectCategory` (fn), `searchQuery` (str), `onSearchChange` (fn)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: N/A
- **Loading State**: Disables control inputs.
- **Error State**: N/A
- **Accessibility**: Focus indicator outlines and form labels.
- **Responsive Behavior**: Wraps options or renders horizontal scroll list.

### 7. ExpenseTimeline
- **Folder**: `components/domain/expenses`
- **Purpose**: Chronological timeline list containing transaction cards.
- **Props**: `expenses` (array), `onDeleteExpense` (fn)
- **Dependencies**: `ExpenseCard`
- **Reusable**: No
- **Animation**: Staggered children entrance.
- **Loading State**: Renders multi-card skeletons.
- **Error State**: N/A
- **Accessibility**: Scroll regions.
- **Responsive Behavior**: Spans full width.

### 8. ExpenseCard
- **Folder**: `components/domain/expenses`
- **Purpose**: Individual transaction detail card displaying category symbol, title, payer, split count, and delete action.
- **Props**: `expense` (object), `onDelete` (fn)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Hover shadow lift.
- **Loading State**: N/A
- **Error State**: N/A
- **Accessibility**: Focusable anchors.
- **Responsive Behavior**: Wraps details and category indicators cleanly.

### 9. CategoryBreakdown
- **Folder**: `components/domain/expenses`
- **Purpose**: Recharts container rendering a donut chart of spending by category, alongside legend items.
- **Props**: `expenses` (array)
- **Dependencies**: Recharts (`PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`)
- **Reusable**: Yes
- **Animation**: Donut radial wipe animation.
- **Loading State**: Renders circular outline spinner.
- **Error State**: Displays "No insights data available" placeholder.
- **Accessibility**: Tabular fallback descriptions for screen readers.
- **Responsive Behavior**: Responsive scaling container.

### 10. SpendingInsights
- **Folder**: `components/domain/expenses`
- **Purpose**: Bulleted insights pointing out budget warnings and trends.
- **Props**: `expenses` (array), `totalBudget` (num)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Fade-in on load.
- **Loading State**: Skeleton block rows.
- **Error State**: N/A
- **Accessibility**: Inline alerts (`role="status"`).
- **Responsive Behavior**: Adjusts margins.

### 11. ExpenseCharts
- **Folder**: `components/common`
- **Purpose**: Generic recharts wrapper configuration.
- **Props**: `data` (array), `type` (str)
- **Dependencies**: Recharts
- **Reusable**: Yes
- **Animation**: Slide/wipe transitions.
- **Loading State**: N/A
- **Error State**: N/A
- **Accessibility**: Chart aria descriptive text.
- **Responsive Behavior**: Flexbox resize.

### 12. SettlementHistory
- **Folder**: `components/domain/expenses`
- **Purpose**: Log list of previously settled amounts.
- **Props**: `history` (array)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Fade-in.
- **Loading State**: Skeletons.
- **Error State**: N/A
- **Accessibility**: Accessible log.
- **Responsive Behavior**: Adjusts column width.

### 13. QuickActions
- **Folder**: `components/common`
- **Purpose**: Floating button triggers for starting modal flows.
- **Props**: `onOpen` (fn)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Hover scale up.
- **Loading State**: N/A
- **Error State**: N/A
- **Accessibility**: Focus state overlays.
- **Responsive Behavior**: Renders at bottom-right of viewport on mobile.

### 14. Footer
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
