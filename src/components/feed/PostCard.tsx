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
import { ConfirmationModal } from "../common/ConfirmationModal";
import { Toast } from "../common/Toast";

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  currentUser: any;
}

function CommentItem({ comment, onReply, onDelete, currentUser }: CommentItemProps) {
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
    <div className="flex space-x-3 mb-4">
      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold overflow-hidden cursor-pointer border border-indigo-100">
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
      <div className="flex-1 min-w-0">
        <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none relative group border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-0.5">
            <span className="font-bold text-sm text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors">
              {comment.author?.username || "user"}
            </span>
            <div className="absolute right-3 top-3 flex items-center space-x-2">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
              >
                {likesCount > 0 && (
                  <span className="text-[10px] font-bold text-gray-400">
                    {likesCount}
                  </span>
                )}
                <Heart
                  size={14}
                  fill={isLiked ? "red" : "none"}
                  className={isLiked ? "text-red-500" : ""}
                />
              </button>
              {currentUser?.id === comment.author?.id && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed pr-8">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-1.5 ml-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
          <button
            onClick={() => onReply(comment)}
            className="hover:text-indigo-600 transition-colors"
          >
            Reply
          </button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-[1.5px] border-gray-100 space-y-1">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      api
        .get(`/likes/post/${post.id}/check`)
        .then((res) => setIsLiked(res.data.liked));
    }
    api.get(`/likes/post/${post.id}`).then((res) => setLikesCount(res.data));
    api
      .get(`/comments/post/${post.id}/count`)
      .then((res) => setCommentsCount(res.data.count));
  }, [post.id, currentUser]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/likes/post/${post.id}`);
      setIsLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {}
  };

  const handleDeletePost = async () => {
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
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setToastMessage("Link copied to clipboard!");
    setShowToast(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      await api.delete(`/comments/${commentToDelete}`);
      
      const removeCommentFromList = (list: Comment[], id: string): Comment[] => {
        return list
          .filter(c => c.id !== id)
          .map(c => ({
            ...c,
            replies: c.replies ? removeCommentFromList(c.replies, id) : []
          }));
      };

      setComments(prev => removeCommentFromList(prev, commentToDelete));
      setCommentsCount(prev => prev - 1);
      setToastMessage("Comment deleted");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to delete comment");
      setShowToast(true);
    } finally {
      setCommentToDelete(null);
    }
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
                  {post.author.firstName?.[0] ||
                    post.author.username?.[0] ||
                    "?"}
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
                <button
                  onClick={() => {
                    if (currentUser?.id === post.author.id) {
                      setShowDeleteModal(true);
                    } else {
                      setToastMessage("You can only delete your own posts");
                      setShowToast(true);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
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
          <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100/50">
            <div className="space-y-1 pt-5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {loadingComments ? (
                <p className="text-center text-sm text-gray-500">Loading...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onDelete={(id) => {
                    setCommentToDelete(id);
                    setShowCommentDeleteModal(true);
                  }}
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <ConfirmationModal
        isOpen={showCommentDeleteModal}
        onClose={() => setShowCommentDeleteModal(false)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
