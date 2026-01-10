export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  isActive: boolean;
  avatarUrl?: string;
  followersCount?: number; // Computed
  followingCount?: number; // Computed
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
