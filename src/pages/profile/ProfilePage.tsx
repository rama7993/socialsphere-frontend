import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { DiscoverPeople } from "../../components/profile/DiscoverPeople";
import { PostCard } from "../../components/feed/PostCard";
import type { Post, User } from "../../types";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import { Grid, Bookmark, User as UserIcon, Camera } from "lucide-react";
import { cn } from "../../utils/cn";

export function ProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const fetchProfileData = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      let currentUser = profileUser;
      if (pageNum === 1) {
        if (id) {
          const res = await api.get(`/users/${id}`);
          currentUser = res.data;
        } else if (authUser) {
          currentUser = authUser;
        } else {
          const meRes = await api.get("/users/profile").catch(() => null);
          currentUser = meRes?.data;
        }
        setProfileUser(currentUser);
      }

      if (currentUser) {
        const res = await api.get(`/posts/user/${currentUser.id}`, {
          params: { page: pageNum, limit: 10 },
        });
        const newPosts = res.data;
        if (pageNum === 1) {
          setUserPosts(newPosts);
        } else {
          setUserPosts((prev) => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length === 10);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProfileData(1);
  }, [id, authUser]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfileData(nextPage);
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-0 py-4">
        <div className="flex items-start gap-8 md:gap-16">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full shimmer flex-shrink-0" />
          <div className="flex-1 space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-32 h-5 rounded-lg shimmer" />
              <div className="w-24 h-7 rounded-lg shimmer" />
            </div>
            <div className="flex gap-6">
              <div className="w-16 h-4 rounded shimmer" />
              <div className="w-20 h-4 rounded shimmer" />
              <div className="w-20 h-4 rounded shimmer" />
            </div>
            <div className="w-28 h-4 rounded shimmer" />
            <div className="w-48 h-3 rounded shimmer" />
          </div>
        </div>
      </div>
    );
  if (!profileUser)
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Please log in to view profile.
      </div>
    );

  const isOwnProfile = !id || id === authUser?.id;

  const TabEmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: any;
    title: string;
    description: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="h-24 w-24 rounded-full border-4 border-gray-900 flex items-center justify-center mb-8 shadow-xl shadow-gray-200">
        <Icon size={40} strokeWidth={2.5} className="text-gray-900" />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
        {title}
      </h2>
      <p className="text-gray-600 max-w-[320px] leading-relaxed font-extrabold text-[15px]">
        {description}
      </p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
      <ProfileHeader user={profileUser} />

      {isOwnProfile && <DiscoverPeople />}

      <div className="flex mt-6 mb-12 justify-center border-t border-gray-50 pt-2">
        {[
          { id: "posts", label: "Posts", icon: Grid },
          { id: "saved", label: "Saved", icon: Bookmark },
          { id: "tagged", label: "Tagged", icon: UserIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-10 py-4 text-xs font-medium transition-all relative focus:outline-none group",
              activeTab === id
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            {activeTab === id && (
              <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gray-900 rounded-full" />
            )}
            <Icon
              size={12}
              className={cn(
                "transition-all duration-500",
                activeTab === id ? "text-gray-900 scale-110" : "group-hover:scale-110 group-hover:text-gray-400",
              )}
              strokeWidth={activeTab === id ? 3 : 2.5}
            />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="pb-20">
        {activeTab === "posts" && (
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={(id) =>
                    setUserPosts((prev) => prev.filter((p) => p.id !== id))
                  }
                />
              ))
            ) : (
              <TabEmptyState
                icon={Camera}
                title="No posts yet"
                description="When you share photos, they will appear on your profile."
              />
            )}

            {hasMore && !loading && userPosts.length > 0 && (
              <button
                onClick={loadMore}
                className="w-full py-4 mt-6 bg-white border border-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-[0.98]"
              >
                Load More
              </button>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <TabEmptyState
            icon={Bookmark}
            title="Saved"
            description="Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved."
          />
        )}

        {activeTab === "tagged" && (
          <TabEmptyState
            icon={UserIcon}
            title="Photos of you"
            description="When people tag you in photos, they'll appear here."
          />
        )}
      </div>
    </div>
  );
}
