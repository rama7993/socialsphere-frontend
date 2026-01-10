import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../../types";
import { CreatePost } from "../../components/feed/CreatePost";
import { PostCard } from "../../components/feed/PostCard";
import api from "../../lib/axios";

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "foryou" ? "/posts" : "/posts/feed";
      const response = await api.get(endpoint);
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  return (
    <div className="max-w-xl mx-auto">
      {/* Feed Tabs */}
      <div className="flex border-b border-gray-200 mb-4 bg-white sticky top-0 z-10 transition-all">
        <button
          onClick={() => setActiveTab("foryou")}
          className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${
            activeTab === "foryou"
              ? "text-black border-b-4 border-blue-600"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${
            activeTab === "following"
              ? "text-black border-b-4 border-blue-600"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Following
        </button>
      </div>

      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200 p-8">
              {activeTab === "following" ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">
                    Your feed is empty
                  </h3>
                  <p className="mb-4">Follow users to see their posts here!</p>
                  <Link
                    to="/search"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Find people to follow
                  </Link>
                </>
              ) : (
                <p>No posts yet. Be the first to post!</p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={(id) =>
                  setPosts((prev) => prev.filter((p) => p.id !== id))
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
