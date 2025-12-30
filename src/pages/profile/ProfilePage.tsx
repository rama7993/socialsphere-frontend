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
        // 1. Get Profile (For now, use 'me' or fallback to authUser if endpoint missing)
        // If we had /users/me, we'd use that.
        // We'll use authUser logic or fetch fresh
        let currentUser = authUser;
        if (!currentUser) {
          const meRes = await api.get("/users/profile").catch(() => null);
          currentUser = meRes?.data;
        }
        setProfileUser(currentUser);

        // 2. Get All Posts and Filter (Temporary solution)
        const postsRes = await api.get("/posts");
        const allPosts: Post[] = postsRes.data;
        // Filter by author.id. Ensure logic matches (string vs number, etc)
        // Assuming backend returns author object with id.
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
          <PostCard key={post.id} post={post} />
        ))}
        {userPosts.length === 0 && (
          <div className="text-center py-10 text-gray-500">No posts yet.</div>
        )}
      </div>
    </div>
  );
}
