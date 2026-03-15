import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
  Bookmark,
} from "lucide-react";
import type { Post, Comment } from "../../types";
import { cn } from "../../utils/cn";
import { useState, useEffect, useRef } from "react";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import { LikesModal } from "./LikesModal";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  currentUser: any;
}

function CommentItem({ comment, onReply, currentUser }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some((u) => u.id === currentUser?.id) || false,
  );
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/comments/${comment.id}/like`);
      setIsLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {}
  };

  return (
    <div className="flex space-x-3 mb-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold overflow-hidden cursor-pointer">
        {comment.author?.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.username}
            className="h-full w-full object-cover"
          />
        ) : (
          comment.author?.username?.[0] || comment.author?.firstName?.[0] || "?"
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded-2xl relative group">
          <div className="flex justify-between items-start">
            <span className="font-semibold text-sm cursor-pointer hover:underline">
              {comment.author?.username || "user"}
            </span>
          </div>
          <p className="text-sm text-gray-800">{comment.content}</p>
          <button
            onClick={handleLike}
            className="absolute right-2 top-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Heart
              size={14}
              fill={isLiked ? "red" : "none"}
              className={isLiked ? "text-red-500" : ""}
            />
          </button>
        </div>
        <div className="flex items-center space-x-4 mt-1 ml-2 text-xs text-gray-500 font-semibold">
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          {likesCount > 0 && <span>{likesCount} likes</span>}
          <button
            onClick={() => onReply(comment)}
            className="hover:text-gray-800"
          >
            Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-gray-100">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const { user: currentUser } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [showLikes, setShowLikes] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      api.get(`/likes/post/${post.id}/check`).then((res) => setIsLiked(res.data.liked));
    }
    api.get(`/likes/post/${post.id}`).then((res) => setLikesCount(res.data));
    api.get(`/comments/post/${post.id}/count`).then((res) => setCommentsCount(res.data.count));
  }, [post.id, currentUser]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/likes/post/${post.id}`);
      setIsLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {}
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onPostDeleted?.(post.id);
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/comments/post/${post.id}`);
        setComments(data);
        setCommentsCount(data.length);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    const username = comment.author?.username || "user";
    setNewComment(`@${username} `);
    inputRef.current?.focus();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post("/comments", {
        content: newComment,
        postId: post.id,
        parentId: replyTo?.id,
      });
      setComments((prev) => [data, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setNewComment("");
      setReplyTo(null);
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-300 relative shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-100">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-sm">
                {post.author.firstName?.[0] || post.author.username?.[0] || "?"}
                {post.author.lastName?.[0] || ""}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 tracking-tight leading-tight">
              {post.author.firstName || post.author.lastName
                ? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim()
                : post.author.username}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              @{post.author.username} •{" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              {currentUser?.id === post.author.id ? (
                <button
                  onClick={handleDeletePost}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
              ) : (
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 tracking-tight">
          {post.title}
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
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

      <div className="p-2 px-4 border-t border-gray-100 flex items-center justify-between text-gray-500">
        <div className="flex items-center space-x-1 flex-1">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all duration-200",
              isLiked
                ? "bg-red-50 text-red-500"
                : "hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setShowLikes(true)}
            disabled={likesCount === 0}
            className="flex items-center justify-center py-2 px-2 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 disabled:cursor-default"
          >
            <span className="text-sm font-bold">{likesCount}</span>
          </button>

          <button
            onClick={toggleComments}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-bold">{commentsCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 cursor-pointer"
          >
            <Share2 size={18} />
          </button>

          <button className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 cursor-pointer">
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          <div className="space-y-4 pt-4 max-h-96 overflow-y-auto custom-scrollbar">
            {loadingComments ? (
              <p className="text-center text-sm text-gray-500">Loading...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                No comments yet. Be the first!
              </p>
            )}
          </div>

          <form
            onSubmit={handleCommentSubmit}
            className="mt-4 flex gap-2 items-center"
          >
            <div className="flex-1 relative">
              {replyTo && (
                <div className="absolute -top-6 left-0 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-t-md flex items-center">
                  Replying to{" "}
                  {replyTo.author?.username ||
                    replyTo.author?.firstName ||
                    "user"}
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment("");
                    }}
                    className="ml-2 text-red-500 font-bold"
                  >
                    &times;
                  </button>
                </div>
              )}
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyTo ? "Write a reply..." : "Write a comment..."
                }
                className="w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm pl-4 pr-10 py-2 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-transform active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </article>

      <LikesModal
        postId={post.id}
        isOpen={showLikes}
        onClose={() => setShowLikes(false)}
      />
    </>
  );
}
