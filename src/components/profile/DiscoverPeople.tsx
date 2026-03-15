import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import type { User as UserType } from "../../types";
import { useFollow } from "../../hooks/useFollow";
import { cn } from "../../utils/cn";

function SuggestionCard({ user, onFollowChange }: { user: UserType; onFollowChange?: (isFollowing: boolean) => void }) {
  const { isFollowing, toggleFollow, isLoading, isOwnProfile } = useFollow(user, onFollowChange);

  if (isOwnProfile) return null;

  return (
    <div className="flex-shrink-0 w-[160px] group cursor-pointer">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-500 hover:shadow-lg hover:border-transparent group-hover:-translate-y-1 relative h-full">
        <Link to={`/profile/${user.id}`} className="mb-4 flex flex-col items-center group-hover:scale-105 transition-transform duration-300 cursor-pointer w-full">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center mb-3 ring-4 ring-gray-50/50 group-hover:ring-indigo-50 transition-all overflow-hidden shadow-inner">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-200 uppercase font-light text-xl">
                {user.username?.[0]}
              </div>
            )}
          </div>
          <div className="font-black text-[13px] text-gray-900 line-clamp-1 tracking-tight">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-[11px] text-gray-400 font-bold line-clamp-1 mt-0.5 uppercase tracking-wider">
            @{user.username}
          </div>
        </Link>

        <button
          onClick={toggleFollow}
          disabled={isLoading}
          className={cn(
            "w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none",
            isFollowing
              ? "bg-gray-50 text-gray-400 border border-gray-100 shadow-none"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
          )}
        >
          {isLoading ? (
            <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      </div>
    </div>
  );
}

export function DiscoverPeople({ onFollowChange }: { onFollowChange?: (isFollowing: boolean) => void }) {
  const [suggestions, setSuggestions] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await api.get("/users/suggestions");
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (!isVisible || suggestions.length === 0) return null;
  if (loading) return null;

  return (
    <div className="bg-gray-50/50 border border-gray-100/50 rounded-[32px] p-6 mb-12 relative overflow-hidden transition-all hover:bg-white hover:shadow-xl hover:border-transparent group/section duration-700">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-[15px] font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Discover People</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
        </h3>
        <div className="flex items-center gap-4">
          <Link to="/search" className="text-[12px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">
            See All
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-300 hover:text-gray-900 hover:bg-white rounded-lg p-1.5 transition-all focus:outline-none shadow-sm shadow-transparent hover:shadow-gray-100"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-1 px-1">
        {suggestions.map((user) => (
          <SuggestionCard key={user.id} user={user} onFollowChange={onFollowChange} />
        ))}
      </div>
    </div>
  );
}
