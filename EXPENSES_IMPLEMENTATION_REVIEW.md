# Expenses Implementation Review

This document reviews the current state of TripSetGo's Expenses module, evaluating its architecture, layouts, sub-components, and visual guidelines compliance.

---

## 1. Current State Analysis

### 1. Current Architecture
- **State Integration**: Connects with Redux using `expensesSlice.js` thunks (`fetchGroups`, `fetchGroup`, `createGroup`, `deleteGroup`, `addMember`, `addExpense`, `deleteExpense`).
- **Data Derivation**: Dynamically computes selected group detail pointers, total spending tallies, member counts, individual averages, individual debts, and ledger items in memory on render.

### 2. Component Hierarchy
Currently, `Expenses.jsx` is a monolithic page containing all layout rows, lists, totals computations, modals, and split buttons:
```
Expenses (Page Component)
 ├── Group Selector Tabs
 ├── Stat Summary Grid
 ├── Expense List Cards
 ├── Settlements List
 ├── Balances List
 └── Modals (Create Group, Add Member, Add Expense)
```

### 3. Existing Reusable Components
- Imports and uses standard UI library primitives (`Button`, `Input`, `Modal`, `Avatar`) from `@/components/common`.

### 4. Existing Expense Cards
- Rendered inline in a vertical block using standard emojis, showing title, payer name, split counts, and trash delete icons.

### 5. Existing Settlement Components
- Rendered in a simple text ledger format under the "Settle Up" section, outputting: `[From Name] -> [To Name] [Amount]`.

### 6. Existing Charts
- **None**: There are **no visual charts** representing category spending distributions or member share metrics, despite `recharts` being installed in the project's dependencies list.

### 7. Existing Loading States
- Displays `SkeletonCard` from `@/components/common/Loader` while groups or details are loading.

### 8. Existing Empty States
- Renders standard fallback icons and call-to-actions when groups or expense lists are empty.

### 9. Existing Error States
- Lacks inline error banners; falls back to raw toast notifications for network exceptions.

### 10. Existing Animations
- Entrance movements on lists use simple Framer Motion configurations (`motion.div`).

### 11. Existing Accessibility
- Lacks landmarks and explicit labels for screen reader accessibility on modals and balance items.

### 12. Existing Responsive Behavior
- Hardcoded inline style wrappers (e.g. `display: 'flex'`, `gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`) that clash with standard responsive styles and break clean layouts.
- **Aurora Violations**: Uses gradient text (`bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent`) on line 153, which is prohibited by Aurora Visual Guidelines Section 4.

---

## 2. Component Classifications

| File / Component | Type | Classification | Rationale & Planned Action |
|---|---|---|---|
| [Expenses.jsx](file:///e:/Desktop/Web%20Development/Hack18_TripSetGo/frontend/src/pages/Dashboard/Expenses.jsx) | Page | **REFACTOR** | Overhaul into a clean dashboard containing two primary tabs: **Ledger & Settlement** and **Spending Insights**. Replace inline styles with Tailwind v4 grid structures. Replace gradient-clipped title with solid Aurora header styling. |
| `SummaryCard` | Inline | **EXTEND** | Extract into a modular component supporting animated stat counters. |
| `ExpenseCard` | Inline | **EXTEND** | Extract into a domain component with custom category badges and clean layouts. |
| `SettlementList` | Inline | **EXTEND** | Extract into a component displaying clear debit/credit cards with arrow highlights. |
| `BalanceList` | Inline | **EXTEND** | Extract into a list displaying colored indicator chips for owes vs. gets. |
| `CategoryInsights` | New | **NEW** | Build a new spending insights component displaying a **donut chart** (using `recharts`) showing category expenses breakdown, and category spending legends. |
