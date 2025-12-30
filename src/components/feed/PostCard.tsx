import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import type { Post } from "../../types";
import { cn } from "../../utils/cn";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                {post.author.firstName?.[0]}
                {post.author.lastName?.[0]}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {post.author.firstName} {post.author.lastName}
            </div>
            <div className="text-sm text-gray-500">
              @{post.author.username} •{" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.imageUrl && (
        <div className="w-full h-64 sm:h-80 bg-gray-100 overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-gray-500">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onLike?.(post.id)}
            className={cn(
              "flex items-center space-x-2 transition-colors duration-200",
              post.isLikedByCurrentUser ? "text-red-500" : "hover:text-red-500"
            )}
          >
            <Heart
              size={20}
              fill={post.isLikedByCurrentUser ? "currentColor" : "none"}
            />
            <span className="text-sm font-medium">{post.likesCount}</span>
          </button>

          <button
            onClick={() => onComment?.(post.id)}
            className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-200"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          <Share2 size={20} />
        </button>
      </div>
    </article>
  );
}
