import { useState, useEffect } from "react";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types";
import { useIsOwnProfile } from "./useIsOwnProfile";

export function useFollow(targetUser: User | null, onToggle?: (isFollowing: boolean) => void) {
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isOwnProfile = useIsOwnProfile(targetUser);

  // Sync initial following status
  useEffect(() => {
    if (!targetUser || !currentUser || isOwnProfile) return;

    const checkFollowing = async () => {
      try {
        const { data: followers } = await api.get(`/users/${targetUser.id}/followers`);
        setIsFollowing(followers.some((f: User) => String(f.id) === String(currentUser.id)));
      } catch (error) {
        console.error("Failed to check follow status", error);
      }
    };

    checkFollowing();
  }, [targetUser, currentUser, isOwnProfile]);

  const toggleFollow = async () => {
    if (!targetUser || isOwnProfile || isLoading) return;

    setIsLoading(true);
    // Optimistic Update
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      if (previousState) {
        await api.delete(`/users/${targetUser.id}/follow`);
      } else {
        await api.post(`/users/${targetUser.id}/follow`);
      }
      onToggle?.(!previousState);
    } catch (error) {
      console.error("Failed to toggle follow", error);
      // Revert on error
      setIsFollowing(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, toggleFollow, isLoading, isOwnProfile };
}
