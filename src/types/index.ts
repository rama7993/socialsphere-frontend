export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  isActive: boolean;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: User;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  createdAt: string;
  likes: User[];
  replies?: Comment[];
}

export interface Like {
  id: string;
  user: User;
  postId: string;
}

export interface Story {
  id: string;
  mediaUrl: string;
  user: User;
  expiresAt: string;
  createdAt: string;
  seenBy?: User[];
}

export const NotificationType = {
  LIKE: "like",
  COMMENT: "comment",
  FOLLOW: "follow",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  recipient: User;
  actor: User;
  createdAt: string;
}
