# WashLab Split Guide

## Overview

This codebase is structured to be split into **3 independent Vercel projects**:

| Repo | Domain | Source Folder |
|------|--------|---------------|
| `washlab-public` | washlab.com | `src/public-app/` |
| `washlab-washstation` | app.washlab.com | `src/washstation-app/` |
| `washlab-admin` | admin.washlab.com | `src/admin-app/` |

---

## Step-by-Step Split Instructions

### 1. Create 3 New Repos

```bash
# Clone this repo 3 times
git clone <this-repo> washlab-public
git clone <this-repo> washlab-washstation
git clone <this-repo> washlab-admin
```

### 2. For `washlab-public`

**Keep:**
- `src/public-app/` → move to `src/pages/`
- `src/shared/` → keep as-is
- `src/components/` → keep as-is
- `src/context/` → keep as-is

**Delete:**
- `src/washstation-app/`
- `src/admin-app/`
- `src/pages/admin/`
- `src/pages/WashStation.tsx`
- `src/pages/StaffLogin.tsx`

**Update App.tsx:**
```tsx
import PublicAppRouter from "./public-app/PublicAppRouter";
// Mount at root
<Route path="/*" element={<PublicAppRouter />} />
```

### 3. For `washlab-washstation`

**Keep:**
- `src/washstation-app/` → move to `src/pages/`
- `src/shared/` → keep as-is

**Delete:**
- `src/public-app/`
- `src/admin-app/`
- `src/pages/Index.tsx`
- `src/pages/OrderPage.tsx`
- `src/pages/admin/`

**Update App.tsx:**
```tsx
import WashStationRouter from "./washstation-app/WashStationRouter";
// Mount at root (no /washstation prefix)
<Route path="/*" element={<WashStationRouter />} />
```

### 4. For `washlab-admin`

**Keep:**
- `src/admin-app/` → move to `src/pages/`
- `src/shared/` → keep as-is

**Delete:**
- `src/public-app/`
- `src/washstation-app/`
- `src/pages/Index.tsx`
- `src/pages/WashStation.tsx`

**Update App.tsx:**
```tsx
import AdminRouter from "./admin-app/AdminRouter";
// Mount at root (no /admin prefix)
<Route path="/*" element={<AdminRouter />} />
```

---

## Environment Variables

| Variable | Public | WashStation | Admin |
|----------|--------|-------------|-------|
| `VITE_API_URL` | ✅ | ✅ | ✅ |
| `VITE_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `VITE_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |

---

## Critical Notes

1. **Enrollment Links**: Must work at `admin.washlab.com/enroll/:token`
2. **No Cross-App Imports**: All shared code lives in `src/shared/`
3. **Pricing Config**: Lives in `src/shared/services/pricing.ts`
4. **WebAuthn**: Lives in `src/shared/hooks/useWebAuthn.ts`

---

## Vercel Configuration

Each app needs its own `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This enables SPA routing with direct URL access.
