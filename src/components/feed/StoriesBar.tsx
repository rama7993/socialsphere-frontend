import { useEffect, useState, useMemo } from "react";
import api from "../../lib/axios";
import type { Story } from "../../types";
import { CreateStory } from "./CreateStory";
import { StoryViewer } from "./StoryViewer";
import { useAuthStore } from "../../store/authStore";

export function StoriesBar() {
  const { user: currentUser } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    index: number;
  }>({
    isOpen: false,
    index: 0,
  });

  const fetchStories = async () => {
    try {
      const response = await api.get("/stories");
      setStories(response.data);
    } catch (error) {
      console.error("Failed to fetch stories", error);
    } finally {
      setLoading(false);
    }
  };

  const usersWithStories = useMemo(() => {
    const grouped = stories
      .filter((s) => s.user)
      .reduce((acc, story) => {
        const userId = story.user.id;
        if (!acc.has(userId)) {
          acc.set(userId, { user: story.user, stories: [], isOwn: userId === currentUser?.id });
        }
        acc.get(userId)!.stories.push(story);
        return acc;
      }, new Map<string, { user: any; stories: Story[]; isOwn: boolean }>());

    const list = Array.from(grouped.values()).map(group => {
      const isAllSeen = group.stories.every(s =>
        s.seenBy?.some(u => u.id === currentUser?.id)
      );
      const newestTimestamp = Math.max(...group.stories.map(s => new Date(s.createdAt).getTime()));
      return { ...group, isAllSeen, newestTimestamp };
    });

    return list.sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      if (!a.isAllSeen && b.isAllSeen) return -1;
      if (a.isAllSeen && !b.isAllSeen) return 1;
      return b.newestTimestamp - a.newestTimestamp;
    });
  }, [stories, currentUser?.id]);

  if (loading)
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4 mb-4 mt-2 no-scrollbar">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
            <div className="w-16 h-16 rounded-full shimmer" />
            <div className="w-10 h-2 rounded-md shimmer" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 mb-4 mt-2 scrollbar-hide no-scrollbar">
      <div
        onClick={() => setIsCreateOpen(true)}
        className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
          <span className="text-2xl text-gray-400">+</span>
        </div>
        <span className="text-[10px] font-medium text-gray-500">
          Your Story
        </span>
      </div>

      {usersWithStories.map((group, index) => (
        <div
          key={group.user.id}
          onClick={() => setViewerState({ isOpen: true, index })}
          className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
        >
          <div className={`w-16 h-16 rounded-full p-[2px] ${
            group.isAllSeen 
              ? "bg-gray-300" 
              : "bg-gradient-to-tr from-yellow-400 to-fuchsia-600"
          }`}>
            <div className={`w-full h-full rounded-full border-2 border-white overflow-hidden ${
              group.isAllSeen ? "bg-gray-100" : "bg-gray-200"
            }`}>
              <img
                src={
                  group.user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${group.user.username}`
                }
                alt={group.user.username}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
          <span className={`text-[10px] font-medium max-w-[64px] truncate ${
            group.isAllSeen ? "text-gray-400" : "text-gray-700"
          }`}>
            {group.isOwn ? "You" : group.user.username}
          </span>
        </div>
      ))}

      <CreateStory
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onStoryCreated={fetchStories}
      />

      <StoryViewer
        userStories={usersWithStories}
        initialUserIndex={viewerState.index}
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ ...viewerState, isOpen: false })}
      />
    </div>
  );
}
