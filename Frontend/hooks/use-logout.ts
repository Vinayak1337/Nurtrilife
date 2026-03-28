import { useClerk } from '@clerk/clerk-expo';
import { useAppDispatch } from '@/store/hooks';
import { logoutRequest } from '@/store/slices/auth.slice';

export function useLogout() {
  const { signOut } = useClerk();
  const dispatch = useAppDispatch();

  return async () => {
    try {
      await signOut();
    } catch {
      // Clerk signOut may fail if no session — that's fine
    }
    dispatch(logoutRequest());
  };
}
