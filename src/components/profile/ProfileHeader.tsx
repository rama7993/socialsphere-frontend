import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  UserPlus,
  UserMinus,
} from "lucide-react";
import type { User } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user: initialUser }: ProfileHeaderProps) {
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(initialUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwnProfile = currentUser?.id === user.id;

  // Check if current user is following this profile
  useEffect(() => {
    if (!isOwnProfile && currentUser) {
      api
        .get(`/users/${user.id}/followers`)
        .then((res) => {
          const followers = res.data as User[];
          setIsFollowing(followers.some((f) => f.id === currentUser.id));
        })
        .catch(() => {});
    }
  }, [user.id, currentUser, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/users/${user.id}/follow`);
        setUser((prev) => ({
          ...prev,
          followersCount: (prev.followersCount || 0) - 1,
        }));
        setIsFollowing(false);
      } else {
        await api.post(`/users/${user.id}/follow`);
        setUser((prev) => ({
          ...prev,
          followersCount: (prev.followersCount || 0) + 1,
        }));
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      <div className="px-6 pb-6">
        <div className="relative flex justify-between items-end -mt-12 mb-4">
          <div className="h-24 w-24 rounded-full ring-4 ring-white bg-white overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-2xl font-bold">
                  {user.firstName?.[0]}
                </span>
              </div>
            )}
          </div>

          {isOwnProfile ? (
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors">
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={loading}
              className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors ${
                isFollowing
                  ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserMinus size={16} /> Unfollow
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Follow
                </>
              )}
            </button>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        <p className="mt-4 text-gray-700">
          Full stack developer who loves building things with React and Node.js.
          Coffee enthusiast ☕️
        </p>

        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon size={16} />
            <a href="#" className="text-blue-500 hover:underline">
              portfolio.dev
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>Joined December 2025</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900">
              {user.followingCount || 0}
            </span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900">
              {user.followersCount || 0}
            </span>
            <span className="text-gray-500">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
