import { useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import type { User } from "../../types";
import { useAuthStore } from "../../store/authStore";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const { user: currentUser } = useAuthStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/users?search=${query}`);
      setResults(data);
      // Ideally, we should also fetch who we are following to show correct button state
      // For now, let's assume if it's in results, we might not adhere to strict following check locally without extra call
      // Better: fetch "my following list" once and check against it.
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      if (following.has(userId)) {
        await api.delete(`/users/${userId}/follow`);
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await api.post(`/users/${userId}/follow`);
        setFollowing((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Follow action failed", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Users</h1>

      <form onSubmit={handleSearch} className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Searching...</div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center space-x-3"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                      {user.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
              </Link>

              {currentUser?.id !== user.id && (
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors ${
                    following.has(user.id)
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {following.has(user.id) ? (
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
              )}
            </div>
          ))
        ) : query && !loading ? (
          <div className="text-center text-gray-500">No users found</div>
        ) : null}
      </div>
    </div>
  );
}
