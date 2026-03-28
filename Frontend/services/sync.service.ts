import { User } from '@/store/slices/auth.slice';
import { Meal } from '@/store/slices/meals.slice';
import { WaterEntry } from '@/store/slices/water.slice';
import { getAuthToken } from '@/utils/auth-token';

// ─── Shared ───────────────────────────────────────────────────────────────────

function getApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    const host = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost ?? '';
    if (host) return `http://${host.split(':')[0]}:3000`;
  } catch {
    // ignore
  }
  return '';
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── User ─────────────────────────────────────────────────────────────────────

/** Fire-and-forget: upserts the user profile. Backend extracts userId from JWT. */
export async function syncUserToServer(user: User): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/user`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(user),
    });
  } catch {
    // Redux persist is source of truth — server sync failure is non-fatal.
  }
}

/** Fetch user profile from server. Backend uses JWT to scope the query. */
export async function fetchUserFromServer(): Promise<User | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/user`, {
      headers: await authHeaders(),
    });
    const data = await res.json();
    if (data.success && data.data) return data.data as User;
    return null;
  } catch {
    return null;
  }
}

// ─── Meals ────────────────────────────────────────────────────────────────────

/** Fire-and-forget: upserts a meal. Backend extracts userId from JWT. */
export async function syncMealToServer(meal: Meal): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/meals`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ meal }),
    });
  } catch {
    // non-fatal
  }
}

/** Fire-and-forget: deletes a meal from server. Backend extracts userId from JWT. */
export async function deleteMealFromServer(mealId: string): Promise<void> {
  try {
    await fetch(
      `${getApiBase()}/api/meals/${encodeURIComponent(mealId)}`,
      { method: 'DELETE', headers: await authHeaders() },
    );
  } catch {
    // non-fatal
  }
}

/** Fetch meals from server for a specific date. Returns [] on error. */
export async function fetchMealsFromServer(date: string): Promise<Meal[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/api/meals?date=${encodeURIComponent(date)}`,
      { headers: await authHeaders() },
    );
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data as Meal[];
    return [];
  } catch {
    return [];
  }
}

// ─── Water ────────────────────────────────────────────────────────────────────

/** Fire-and-forget: upserts a water entry. Backend extracts userId from JWT. */
export async function syncWaterToServer(entry: WaterEntry): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/water`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ entry }),
    });
  } catch {
    // non-fatal
  }
}

/** Fetch water entries from server for a specific date. Returns [] on error. */
export async function fetchWaterFromServer(date: string): Promise<WaterEntry[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/api/water?date=${encodeURIComponent(date)}`,
      { headers: await authHeaders() },
    );
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data as WaterEntry[];
    return [];
  } catch {
    return [];
  }
}

// ─── Badges ───────────────────────────────────────────────────────────────────

/** Fire-and-forget: syncs a newly unlocked badge. Backend extracts userId from JWT. */
export async function syncBadgeToServer(badgeId: string): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/badges`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ badgeId }),
    });
  } catch {
    // non-fatal
  }
}

/** Fetch all unlocked badge IDs from server. Returns [] on error. */
export async function fetchBadgesFromServer(): Promise<string[]> {
  try {
    const res = await fetch(
      `${getApiBase()}/api/badges`,
      { headers: await authHeaders() },
    );
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data as string[];
    return [];
  } catch {
    return [];
  }
}
