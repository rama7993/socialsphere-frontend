import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../lib/axios";
import { useFollow } from "../../hooks/useFollow";
import { useAuthStore } from "../../store/authStore";

interface Liker {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface LikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

function LikerRow({ liker, currentUserId }: { liker: Liker; currentUserId?: string }) {
  const { isFollowing, toggleFollow, isLoading } = useFollow(liker as any);
  const isOwn = liker.id === currentUserId;
  const displayName = liker.firstName || liker.lastName
    ? `${liker.firstName || ""} ${liker.lastName || ""}`.trim()
    : liker.username;

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {liker.avatarUrl ? (
            <img src={liker.avatarUrl} alt={liker.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold text-sm uppercase">
              {liker.username?.[0] || "?"}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{liker.username}</p>
          {displayName !== liker.username && (
            <p className="text-xs text-gray-500">{displayName}</p>
          )}
        </div>
      </div>
      {!isOwn && (
        <button
          onClick={toggleFollow}
          disabled={isLoading}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
            isFollowing
              ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}

export function LikesModal({ postId, isOpen, onClose }: LikesModalProps) {
  const { user: currentUser } = useAuthStore();
  const [likers, setLikers] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get(`/likes/post/${postId}/users`)
      .then((res) => setLikers(res.data))
      .finally(() => setLoading(false));
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-6" />
          <h2 className="text-base font-semibold text-gray-900">Likes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="space-y-1 py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-11 h-11 rounded-full shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-3 rounded shimmer" />
                    <div className="w-16 h-2 rounded shimmer" />
                  </div>
                  <div className="w-16 h-7 rounded-lg shimmer" />
                </div>
              ))}
            </div>
          ) : likers.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">No likes yet</p>
          ) : (
            likers.map((liker) => (
              <LikerRow key={liker.id} liker={liker} currentUserId={currentUser?.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
