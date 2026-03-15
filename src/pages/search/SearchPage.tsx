import { useState, useEffect } from "react";
import { Search, UserPlus, Check, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import type { User } from "../../types";
import { useFollow } from "../../hooks/useFollow";
import { cn } from "../../utils/cn";

function SearchResultCard({ user }: { user: User }) {
  const { isFollowing, toggleFollow, isLoading, isOwnProfile } = useFollow(user);

  if (isOwnProfile) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-indigo-100/50 transition-all group">
      <Link
        to={`/profile/${user.id}`}
        className="flex items-center space-x-4 group-hover:translate-x-1 transition-transform"
      >
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center ring-2 ring-gray-50 group-hover:ring-indigo-50 transition-all overflow-hidden">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon size={24} className="text-indigo-200" />
          )}
        </div>
        <div>
          <div className="font-bold text-gray-900 tracking-tight">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-[13px] text-gray-500 italic">@{user.username}</div>
        </div>
      </Link>

      <button
        onClick={toggleFollow}
        disabled={isLoading}
        className={cn(
          "px-5 py-2 rounded-xl font-bold text-[13px] flex items-center space-x-2 transition-all duration-300 active:scale-95 focus:outline-none shadow-sm",
          isFollowing
            ? "bg-gray-50 text-gray-400 cursor-default"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
        )}
      >
        {isLoading ? (
          "..."
        ) : isFollowing ? (
          <>
            <Check size={16} />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus size={16} />
            <span>Follow</span>
          </>
        )}
      </button>
    </div>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial users
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Fetch first page of users for discovery
      const { data } = await api.get(`/users?page=1&limit=10`);
      setResults(data);
      if (data.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Failed to load discovery data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      loadInitialData();
      setPage(1);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/users?search=${query}`);
      setResults(data);
      setHasMore(false);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const { data } = await api.get(`/users?page=${nextPage}&limit=10`);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setResults((prev) => [...prev, ...data]);
        setPage(nextPage);
        if (data.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more users", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Discovery</h1>
        <p className="text-gray-500 text-[15px]">Find and connect with people across the sphere.</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-10 group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none text-[15px] shadow-sm group-hover:shadow-md"
        />
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
          size={22}
        />
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <SearchResultCard key={user.id} user={user} />
          ))
        ) : query && !loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">No users found</h3>
            <p className="text-gray-500">Try searching for a different name or username.</p>
          </div>
        ) : null}
      </div>

      {hasMore && results.length > 0 && !query && (
        <div className="mt-8 text-center pb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:border-indigo-100 transition-all disabled:opacity-50 shadow-sm active:scale-95 focus:outline-none"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
