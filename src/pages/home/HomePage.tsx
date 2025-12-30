import { useEffect, useState } from "react";
import type { Post } from "../../types";
import { CreatePost } from "../../components/feed/CreatePost";
import { PostCard } from "../../components/feed/PostCard";
import api from "../../lib/axios";

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No posts yet. Be the first to post!
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
}
