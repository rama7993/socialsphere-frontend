import { useState, useEffect } from "react";
import { X, Search, User as UserIcon } from "lucide-react";
import api from "../../lib/axios";
import type { User } from "../../types";
import { useFollow } from "../../hooks/useFollow";
import { cn } from "../../utils/cn";
import { Link } from "react-router-dom";

interface UserListModalProps {
  userId: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isOwnProfile?: boolean;
  onCountChange?: (type: "followers" | "following", delta: number) => void;
}

function UserCard({ 
  user, 
  onAction, 
  type, 
  isOwnProfile, 
  onRemove,
  onCountChange
}: { 
  user: User; 
  onAction?: () => void;
  type: "followers" | "following";
  isOwnProfile?: boolean;
  onRemove?: (userId: string) => void;
  onCountChange?: (type: "followers" | "following", delta: number) => void;
}) {
  const { isFollowing, toggleFollow, isLoading, isOwnProfile: isMe } = useFollow(user, (following) => {
    onCountChange?.("following", following ? 1 : -1);
  });
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await api.delete(`/users/${user.id}/followers`);
      onRemove?.(user.id);
      onCountChange?.("followers", -1);
    } catch (error) {
      console.error("Failed to remove follower", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 rounded-2xl transition-all duration-300 group cursor-pointer">
      <Link 
        to={`/profile/${user.id}`} 
        onClick={onAction}
        className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
      >
        <div className="h-[44px] w-[44px] rounded-full border border-gray-100 p-0.5 bg-white shadow-sm ring-2 ring-transparent group-hover:ring-indigo-50 transition-all overflow-hidden flex-shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-300 uppercase font-black text-[10px] rounded-full">
              {user.username?.[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-[14px] text-gray-900 truncate leading-tight">
              {user.username}
            </span>
            {type === "followers" && !isMe && (
              <span className="text-indigo-600 font-black text-[11px] mt-0.5 pointer-events-none">• Follow</span>
            )}
          </div>
          <div className="text-[13px] text-gray-400 font-bold truncate">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {type === "followers" && isOwnProfile && (
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-5 py-2 bg-gray-100/80 text-gray-900 rounded-xl text-[12px] font-black transition-all hover:bg-gray-200 active:scale-95 focus:outline-none"
          >
            {isRemoving ? "..." : "Remove"}
          </button>
        )}

        {!isMe && type === "following" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFollow();
            }}
            disabled={isLoading}
            className={cn(
              "px-5 py-2 rounded-xl text-[12px] font-black transition-all duration-300 active:scale-95 focus:outline-none",
              isFollowing
                ? "bg-gray-100/80 text-gray-900 hover:bg-gray-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
            )}
          >
            {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}

export function FollowListModal({ userId, type, isOpen, onClose, title, isOwnProfile, onCountChange }: UserListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${userId}/${type}`);
        setUsers(data);
      } catch (error) {
        console.error(`Failed to fetch ${type}`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, isOpen]);

  if (!isOpen) return null;

  const handleRemoveUser = (removedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== removedId));
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="bg-white rounded-[28px] w-full max-w-[400px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="w-10" /> {/* Spacer */}
          <h2 className="text-[16px] font-black text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-900 p-2 transition-all focus:outline-none"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-400 transition-colors" size={16} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-100/50 border-none rounded-2xl text-[14px] font-bold placeholder:text-gray-400 focus:ring-0 focus:bg-gray-100 transition-all"
            />
          </div>
        </div>
        
        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-0.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="h-6 w-6 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                type={type}
                isOwnProfile={isOwnProfile}
                onAction={onClose} 
                onRemove={handleRemoveUser}
                onCountChange={onCountChange}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center animate-in fade-in duration-500">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <UserIcon size={32} className="text-gray-200" />
              </div>
              <h3 className="text-gray-900 font-black text-lg mb-2">No {type}</h3>
              <p className="text-gray-400 text-sm font-bold leading-relaxed">
                {searchQuery 
                  ? `No results for "${searchQuery}"`
                  : `This user doesn't have any ${type} yet.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
