import { useEffect, useState } from "react";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { PostCard } from "../../components/feed/PostCard";
import type { Post, User } from "../../types";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";

export function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        let currentUser = authUser;
        if (!currentUser) {
          const meRes = await api.get("/users/profile").catch(() => null);
          currentUser = meRes?.data;
        }
        setProfileUser(currentUser);

        const postsRes = await api.get("/posts");
        const allPosts: Post[] = postsRes.data;
        const myPosts = allPosts.filter((p) => p.author.id === currentUser?.id);
        setUserPosts(myPosts);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser]);

  if (loading)
    return <div className="text-center py-10">Loading profile...</div>;
  if (!profileUser)
    return (
      <div className="text-center py-10">Please log in to view profile.</div>
    );

  return (
    <div className="max-w-xl mx-auto">
      <ProfileHeader user={profileUser} />

      <div className="space-y-4">
        {userPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={(id) =>
              setUserPosts((prev) => prev.filter((p) => p.id !== id))
            }
          />
        ))}
        {userPosts.length === 0 && (
          <div className="text-center py-10 text-gray-500">No posts yet.</div>
        )}
      </div>
    </div>
  );
}
