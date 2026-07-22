# STU-14: Design Spec — Conditional Sidebar Navigation

## Architecture

### Data Flow

```
DashboardDataProvider (fetches data)
  └─ DashboardLayout (consumes context)
       ├─ Sidebar (receives navItems via props)
       └─ MobileSidebar (receives navItems via props)
```

## Implementation Details

### 1. DashboardDataProvider

**File:** `frontend/src/components/DashboardDataProvider.tsx`

```typescript
interface DashboardData {
  company: Company | null;
  vendor: Vendor | null;
  venues: Venue[] | null;
  isLoading: boolean;
}
```

- Fetches company, vendor, and venue objects from the API
- Uses `useState` + `useEffect` pattern (matches AuthProvider)
- Provides raw nullable objects via context — consumers compute `hasX` as needed
- Shows loading state while fetching

### 2. Sidebar Updates

**File:** `frontend/src/components/Sidebar.tsx`

Changes:
- Remove static `navItems` array from module scope
- Accept `navItems: NavItem[]` as a prop
- Keep `NavItem` interface unchanged
- Both `Sidebar` and `MobileSidebar` accept the same prop

Updated interface:
```typescript
interface SidebarProps {
  navItems: NavItem[];
}
```

### 3. DashboardLayout Integration

**File:** `frontend/src/components/DashboardLayout.tsx`

Changes:
- Import `useDashboardData` from provider
- Build `navItems` array dynamically based on context data
- Pass `navItems` to both `Sidebar` and `MobileSidebar`

Dynamic navItems construction:
```typescript
const { company, vendor, venues } = useDashboardData();

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shouldShow: true },
  { to: "/company", label: "Company", icon: Users, shouldShow: company !== null },
  { to: "/vendors", label: "Vendors", icon: DollarSign, shouldShow: vendor !== null },
  { to: "/venues", label: "Venues", icon: Clock, shouldShow: venues !== null && venues.length > 0 },
  { to: "/onboarding", label: "Onboarding", icon: Sparkles, shouldShow: true },
];
```

### 4. Provider Wrapping

The `DashboardDataProvider` wraps at the `DashboardLayout` level in the router, not at the app root. This ensures data is only fetched when the user is in the dashboard.

```tsx
// Router.tsx — no changes needed if provider is inside DashboardLayout
{
  path: "",
  element: <DashboardLayout />,
  children: [...]
}
```

Alternatively, wrap inside `DashboardLayout.tsx` directly:
```tsx
export default function DashboardLayout() {
  return (
    <DashboardDataProvider>
      <div className="flex min-h-screen bg-stone-50">
        <Sidebar navItems={navItems} />
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          <Outlet />
        </main>
        <MobileSidebar navItems={navItems} />
      </div>
    </DashboardDataProvider>
  );
}
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Data fetch fails | All entity objects null → tabs hidden (fail-closed) |
| Data still loading | Show loading skeleton or hide entity tabs until loaded |
| User has some entities | Only non-null objects → only those tabs shown |
| User has no entities | All objects null → only Dashboard and Onboarding visible |

## Testing

- Unit: Test navItems construction with various data combinations
- Integration: Test sidebar renders correct items based on context
- E2E: Test navigation to each tab when visible
