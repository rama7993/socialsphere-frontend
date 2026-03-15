import { Link as LinkIcon, MapPin } from "lucide-react";
import type { User } from "../../types";
import { useState, useEffect } from "react";
import { EditProfileModal } from "./EditProfileModal";
import { cn } from "../../utils/cn";
import { useFollow } from "../../hooks/useFollow";
import { FollowListModal } from "./FollowListModal";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user: initialUser }: ProfileHeaderProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [listModal, setListModal] = useState<{ isOpen: boolean; type: "followers" | "following" }>({
    isOpen: false,
    type: "followers",
  });
  const { isFollowing, toggleFollow, isLoading, isOwnProfile } = useFollow(user);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleFollowToggle = async () => {
    await toggleFollow();
    if (!isFollowing) {
      setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
    } else {
      setUser(prev => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 0) - 1) }));
    }
  };

  const handleCountChange = (type: "followers" | "following", delta: number) => {
    setUser(prev => ({
      ...prev,
      followersCount: type === "followers" ? Math.max(0, (prev.followersCount || 0) + delta) : prev.followersCount,
      followingCount: type === "following" ? Math.max(0, (prev.followingCount || 0) + delta) : prev.followingCount,
    }));
  };

  const displayName = user.firstName || user.lastName
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : user.username;

  return (
    <div className="mb-8">
      {/* Avatar + Info row */}
      <div className="flex items-start gap-8 md:gap-16 px-4 md:px-0 py-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className="relative group cursor-pointer"
            onClick={() => isOwnProfile && setIsEditOpen(true)}
            title={isOwnProfile ? "Change photo" : undefined}
          >
            <div className="h-24 w-24 md:h-36 md:w-36 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 shadow-lg">
              <div className="h-full w-full rounded-full ring-[3px] ring-white bg-white overflow-hidden relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500">
                    <span className="text-2xl md:text-4xl font-bold uppercase">
                      {user.username?.[0] || "?"}
                    </span>
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          {/* Username + Actions row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{user.username}</h1>
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-5 py-1.5 bg-gray-100 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
              >
                Edit profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={cn(
                  "px-6 py-1.5 rounded-lg font-semibold text-sm transition-all focus:outline-none active:scale-95",
                  isFollowing
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                )}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                ) : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mb-4 text-sm">
            <span className="text-gray-900">
              <span className="font-semibold">0</span>{" "}
              <span className="text-gray-600">posts</span>
            </span>
            <button
              onClick={() => setListModal({ isOpen: true, type: "followers" })}
              className="text-gray-900 hover:text-indigo-600 transition-colors"
            >
              <span className="font-semibold">{user.followersCount || 0}</span>{" "}
              <span className="text-gray-600">followers</span>
            </button>
            <button
              onClick={() => setListModal({ isOpen: true, type: "following" })}
              className="text-gray-900 hover:text-indigo-600 transition-colors"
            >
              <span className="font-semibold">{user.followingCount || 0}</span>{" "}
              <span className="text-gray-600">following</span>
            </button>
          </div>

          {/* Name & bio */}
          <div className="space-y-1">
            <p className="font-semibold text-sm text-gray-900">{displayName}</p>
            {user.bio && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-w-sm">{user.bio}</p>
            )}
            {user.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={12} />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <a
                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors w-fit"
              >
                <LinkIcon size={12} />
                {user.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        user={user}
        onClose={() => setIsEditOpen(false)}
        onUpdate={(updatedUser) => setUser(updatedUser)}
      />

      <FollowListModal
        userId={user.id}
        isOpen={listModal.isOpen}
        type={listModal.type}
        title={listModal.type === "followers" ? "Followers" : "Following"}
        isOwnProfile={isOwnProfile}
        onClose={() => setListModal({ ...listModal, isOpen: false })}
        onCountChange={handleCountChange}
      />
    </div>
  );
}
