import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import type { Post } from "../../types";
import { StoriesBar } from "../../components/feed/StoriesBar";
import { PostCard } from "../../components/feed/PostCard";
import api from "../../lib/axios";

export async function homePageLoader() {
  const token = localStorage.getItem("token");
  if (!token) return { posts: [], followingCount: 0 };

  try {
    const response = await api.get("/posts/feed", {
      params: { page: 1, limit: 10 },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to load feed via loader", error);
    return { posts: [], followingCount: 0 };
  }
}

export function HomePage() {
  const initialData = useLoaderData() as any;
  const initialPosts = Array.isArray(initialData) ? initialData : initialData?.posts || [];
  const initialFollowingCount = initialData?.followingCount ?? 0;

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [followingCount, setFollowingCount] = useState<number | null>(
    initialFollowingCount,
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length === 10);

  const fetchPosts = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const endpoint = "/posts/feed";
      const response = await api.get(endpoint, {
        params: { page: pageNum, limit: 10 },
      });

      const data = response.data;
      const newPosts = Array.isArray(data) ? data : data.posts || [];
      const fCount = data.followingCount ?? 0;

      setFollowingCount(fCount);

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className="max-w-xl mx-auto">
      <StoriesBar />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="space-y-2">
                  <div className="w-24 h-3 rounded-md shimmer" />
                  <div className="w-16 h-2 rounded-md shimmer" />
                </div>
              </div>
              <div className="w-full h-40 rounded-xl shimmer" />
              <div className="space-y-2">
                <div className="w-full h-3 rounded-md shimmer" />
                <div className="w-2/3 h-3 rounded-md shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            followingCount === 0 ? (
              <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to SocialSphere
                </h3>
                <p className="text-gray-500 mb-6 max-w-xs mx-auto text-[15px]">
                  Follow people to see their latest posts in your feed.
                </p>
                <Link
                  to="/search"
                  className="inline-flex px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-sm shadow-indigo-100"
                >
                  Find people to follow
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📭</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto text-[15px]">
                  The people you follow haven't posted anything yet.
                </p>
              </div>
            )
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

      {hasMore && !loading && posts.length > 0 && (
        <button
          onClick={loadMore}
          className="w-full py-3 mt-4 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          Load More
        </button>
      )}
    </div>
  );
}
