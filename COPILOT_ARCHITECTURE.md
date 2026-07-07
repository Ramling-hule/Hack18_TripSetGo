# AI Copilot Component Architecture

This document specifies the target component tree, modular specifications, folder organization, and interaction properties for TripSetGo's AI Copilot workspace.

---

## 1. Component Folders

To maintain clean separation, components are grouped into:
1. **`components/common`**: Visual items without business or page state coupling.
2. **`components/layout`**: Layout shells and containers.
3. **`components/domain/copilot`**: Feature-specific components bound to the Copilot context, trips API, or conversation streams.

---

## 2. Component Specifications

### 1. CopilotLayout
- **Folder**: `components/layout`
- **Purpose**: Page layout frame providing a responsive three-pane split on desktop and overlay drawers on mobile.
- **Props**: `children` (React nodes)
- **Dependencies**: React, Framer Motion
- **Reusable**: Yes
- **Animation**: Gliding transitions for panel folds (200ms ease).
- **Loading State**: Displays a page skeleton outline during the boot sequence.
- **Streaming State**: N/A
- **Error State**: Renders full-page fallback container if state initialization fails.
- **Accessibility**: Landmark tags (`role="navigation"`, `role="main"`, `role="complementary"`).
- **Responsive Behavior**:
  - **Desktop (>1024px)**: Left pane (280px sidebar), Center pane (chat window), Right pane (300px grounding context).
  - **Mobile (<1024px)**: Chat window is full-screen, with side panels toggleable via drawer buttons.

### 2. ConversationSidebar
- **Folder**: `components/domain/copilot`
- **Purpose**: Sidebar tray housing conversation actions and recent chats history.
- **Props**: `onNewChat` (fn), `activeConvId` (id)
- **Dependencies**: React, `ConversationList`
- **Reusable**: No
- **Animation**: Linear slide-in (250ms `easeInOut`).
- **Loading State**: Sidebar skeleton tags.
- **Streaming State**: N/A
- **Error State**: Displays "Recent chats unavailable" inline alert.
- **Accessibility**: `aria-label="Conversation History"`.
- **Responsive Behavior**: Collapses to sliding hamburger drawer on mobile.

### 3. ConversationList
- **Folder**: `components/domain/copilot`
- **Purpose**: Iterative list of past chats showing destination name and truncation previews.
- **Props**: `conversations` (array), `activeConvId` (id), `onSelect` (fn), `onDelete` (fn)
- **Dependencies**: React, Lucide Icons
- **Reusable**: Yes
- **Animation**: List item entrance transitions (`y: 10`, `opacity: 0`).
- **Loading State**: Skeleton pills.
- **Streaming State**: N/A
- **Error State**: N/A
- **Accessibility**: List container (`role="list"`, `role="listitem"`).
- **Responsive Behavior**: Adapts text truncation length based on width.

### 4. ChatHeader
- **Folder**: `components/domain/copilot`
- **Purpose**: Top panel displaying assistant status, active trip grounding indicators, and controls.
- **Props**: `title` (str), `subtitle` (str), `tripName` (str), `onNewChat` (fn)
- **Dependencies**: Lucide React
- **Reusable**: No
- **Animation**: Micro hover translations on buttons.
- **Loading State**: Status dot pulses.
- **Streaming State**: Status indicator shows a rotating spinner.
- **Error State**: Status indicator shows warning icon.
- **Accessibility**: Semantic HTML `<header>` tag.
- **Responsive Behavior**: Wraps items or hides descriptive sub-headers on mobile.

### 5. TripContextBanner
- **Folder**: `components/domain/copilot`
- **Purpose**: Banner indicating the active trip context for grounding.
- **Props**: `trip` (object), `onClear` (fn)
- **Dependencies**: React Router `Link`
- **Reusable**: Yes
- **Animation**: Slide-down entrance.
- **Loading State**: N/A
- **Streaming State**: N/A
- **Error State**: N/A
- **Accessibility**: Banner alert layout (`role="status"`).
- **Responsive Behavior**: Compresses typography on mobile viewports.

### 6. ChatWindow
- **Folder**: `components/domain/copilot`
- **Purpose**: Scrollable chat box displaying message bubbles and loading indicators.
- **Props**: `messages` (array), `isStreaming` (bool)
- **Dependencies**: React, `AIMessage`, `UserMessage`, `ThinkingDots`
- **Reusable**: No
- **Animation**: Auto-scroll scroll animations.
- **Loading State**: Displays initial thread load skeleton.
- **Streaming State**: Displays `ThinkingDots` at the bottom of the list.
- **Error State**: Appends error bubble at the end of the message index.
- **Accessibility**: Chat stream region (`role="log"`, `aria-live="polite"`).
- **Responsive Behavior**: Adjusts viewport height to avoid overlap with mobile keyboards.

### 7. AIMessage
- **Folder**: `components/domain/copilot`
- **Purpose**: AI message bubble with markdown parsing and profile tags.
- **Props**: `text` (str), `timestamp` (str)
- **Dependencies**: Custom Markdown Regex parser, `RichResponseCard`
- **Reusable**: Yes
- **Animation**: Fade-in on mount.
- **Loading State**: N/A
- **Streaming State**: Renders partial markdown string progressively.
- **Error State**: N/A
- **Accessibility**: Speech tag properties.
- **Responsive Behavior**: Adjusts bubble max-width (`85%` on desktop, `92%` on mobile).

### 8. UserMessage
- **Folder**: `components/domain/copilot`
- **Purpose**: User speech bubble displaying user text and avatar.
- **Props**: `text` (str), `user` (object), `timestamp` (str)
- **Dependencies**: `Avatar`
- **Reusable**: Yes
- **Animation**: Fade-in on mount.
- **Loading State**: N/A
- **Streaming State**: N/A
- **Error State**: N/A
- **Accessibility**: Right-aligned bubble context.
- **Responsive Behavior**: Bubble max-width matching AIMessage limits.

### 9. RichResponseCard
- **Folder**: `components/domain/copilot`
- **Purpose**: Visual card embedded in AI responses representing entities like Hotels, Restaurants, Sights.
- **Props**: `entity` (object), `onAddStop` (fn)
- **Dependencies**: Lucide React, `api` helper
- **Reusable**: Yes
- **Animation**: Slide-up hover effects.
- **Loading State**: Inner details skeleton.
- **Streaming State**: N/A
- **Error State**: Displays fallback text if model data is corrupted.
- **Accessibility**: Focusable anchors.
- **Responsive Behavior**: Switches layout from horizontal row (desktop) to vertical stack (mobile).

### 10. SuggestedActions
- **Folder**: `components/common`
- **Purpose**: Suggested quick reply buttons displayed at the end of the message thread.
- **Props**: `actions` (array), `onClick` (fn)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Entrance scale slide-in (`scale: 0.95`, `opacity: 0`).
- **Loading State**: N/A
- **Streaming State**: Hidden while AI is typing.
- **Error State**: N/A
- **Accessibility**: Keyboard focusable buttons.
- **Responsive Behavior**: Wraps actions or renders scrollable horizontal rows.

### 11. ContextPanel
- **Folder**: `components/domain/copilot`
- **Purpose**: Panel displaying selected trip details, live budget bar, weather widget, and mini preview Map.
- **Props**: `trip` (object), `weather` (object), `budget` (object)
- **Dependencies**: `MapContainer`, `useMapbox`, `BudgetBar`
- **Reusable**: No
- **Animation**: Glass container fades and slide movements.
- **Loading State**: Inner loading skeletons for widgets.
- **Streaming State**: N/A
- **Error State**: Error banners for weather/map load failures.
- **Accessibility**: Navigation landmarks.
- **Responsive Behavior**: Collapses to toggleable bottom sheet on mobile devices.

### 12. InputComposer
- **Folder**: `components/domain/copilot`
- **Purpose**: Input field bar for typing queries.
- **Props**: `value` (str), `onChange` (fn), `onSubmit` (fn), `disabled` (bool)
- **Dependencies**: Lucide Icons
- **Reusable**: Yes
- **Animation**: Focused border accent changes.
- **Loading State**: Disables controls during streaming.
- **Streaming State**: N/A
- **Error State**: Highlights border red on validation errors.
- **Accessibility**: Input label associations (`aria-label="Message the copilot"`).
- **Responsive Behavior**: Spans full screen width on mobile layouts.

### 13. PromptSuggestions
- **Folder**: `components/common`
- **Purpose**: Grid of initial prompts displayed on empty chat states.
- **Props**: `suggestions` (array), `onSelect` (fn)
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: Sequential list animations.
- **Loading State**: N/A
- **Streaming State**: N/A
- **Error State**: N/A
- **Accessibility**: Focusable chips.
- **Responsive Behavior**: Wraps cards from 2-column grid (desktop) to single list (mobile).

### 14. Footer
- **Folder**: `components/layout`
- **Purpose**: Bottom footer text with AI disclaimer notes.
- **Props**: None
- **Dependencies**: React
- **Reusable**: Yes
- **Animation**: N/A
- **Loading State**: N/A
- **Streaming State**: N/A
- **Error State**: N/A
- **Accessibility**: Secondary content info.
- **Responsive Behavior**: Centers content on mobile.
