import { useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";

export function useIsOwnProfile(user: User | null) {
  const { user: currentUser } = useAuthStore();

  return useMemo(() => {
    if (!currentUser || !user) return false;
    
    // Check by ID (UUID/Numeric)
    if (currentUser.id && user.id && String(currentUser.id) === String(user.id)) {
      return true;
    }
    
    // Check by username (Case-insensitive)
    if (currentUser.username && user.username && 
        currentUser.username.toLowerCase() === user.username.toLowerCase()) {
      return true;
    }
    
    return false;
  }, [currentUser, user]);
}
