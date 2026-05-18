# Frontend Rules — Generic Project

This file defines frontend conventions for this project.
**Update this file during project setup** with your specific stack and design system.

---

## Design Tokens (CSS vars — never hardcode values)

<!-- Customize these for your design system -->
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Backgrounds: `bg-card`, `bg-surface`, `bg-background`
- Border: `border-border`
- Brand: `text-primary-500`, `bg-primary-50`, `bg-primary-500`
- Dark mode: `dark:` prefix on the same class

If your project uses a different design system (e.g., shadcn/ui, MUI), replace this section with its token conventions.

---

## Utility Classes

- **Conditional classes:** Always use `cn()` from `src/utils/cn.ts`
- **Never** use template literals to build Tailwind class strings
- **Never** hardcode colors — always use design tokens

---

## Component Structure

- Page components: `src/pages/[Name].tsx` — default export
- Shared components: `src/components/[Name].tsx`
- Local sub-components of a page: defined in the same file as the page
- Tests: colocated next to the component as `[Name].test.tsx`

---

## Global State

<!-- Customize for your state management choice -->
- Store: `src/store/useStore.ts` (Zustand)
- Never duplicate local state if it already exists in the store
- Store actions: always inside the store, never business logic outside

---

## Performance

- No objects/arrays/functions created inside render without `useMemo`/`useCallback`
- List keys: always a unique ID, never the array index
- Index as key only for static lists that never reorder

---

## Icons

<!-- Customize for your icon library -->
- Only from `lucide-react`
- Standard sizes: `size={14}` (xs), `size={16}` (sm), `size={18}` (md), `size={20}` (lg)

---

## TypeScript

- No `any` — use `unknown` + type guards when the type is uncertain
- Explicit types on all component props
- Prefer named exports over default exports (except page components)

---

## Responsive

<!-- Customize for your layout conventions -->
- Fixed sidebar layout, scrollable content area
- Grid: `grid-cols-1 lg:grid-cols-N` to adapt to smaller screens
