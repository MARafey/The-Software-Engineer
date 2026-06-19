# Structure & State

## Directory structure (standardized)
```
src/
  components/   # presentational + container components
  hooks/        # reusable hooks
  services/     # API clients
  store/        # client state (Context / Redux)
```

## Rendering
- Component-level rendering, not full-page re-renders.
- Optimize with `useMemo` and `useCallback`.

## State
- **Server state**: TanStack Query (React Query) for API caching. Do **not** store raw API data in global client state.
- **Client state**: Context API or Redux for UI state (themes, toggles, etc.).
