import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store';

export function useAuth() {
  return useAppSelector((state: RootState) => state.auth);
}

export function useUser() {
  return useAppSelector((state: RootState) => state.auth.user);
}

export function useIsAuthenticated() {
  return useAppSelector((state: RootState) => state.auth.isAuthenticated && state.auth.isOnboarded);
}
