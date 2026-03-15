import { useState, useEffect } from "react";
import type { Story } from "../../types";
import api from "../../lib/axios";

interface UserStoryGroup {
  user: any;
  stories: Story[];
}

interface StoryViewerProps {
  userStories: UserStoryGroup[];
  initialUserIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryViewer({ userStories, initialUserIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentUserIndex(initialUserIndex);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialUserIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isOpen, currentUserIndex, currentStoryIndex]);

  useEffect(() => {
    if (isOpen && userStories[currentUserIndex]?.stories[currentStoryIndex]) {
      const storyId = userStories[currentUserIndex].stories[currentStoryIndex].id;
      api.post(`/stories/${storyId}/seen`).catch(() => {});
    }
  }, [isOpen, currentUserIndex, currentStoryIndex, userStories]);

  const handleNext = () => {
    const currentUserStories = userStories[currentUserIndex].stories;
    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentUserIndex < userStories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      const prevUserStories = userStories[prevUserIndex].stories;
      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(prevUserStories.length - 1);
      setProgress(0);
    }
  };

  if (!isOpen || userStories.length === 0) return null;

  const currentGroup = userStories[currentUserIndex];
  const currentStory = currentGroup.stories[currentStoryIndex];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {currentGroup.stories.map((_, index) => (
          <div key={index} className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ 
                width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%' 
              }}
            ></div>
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img 
            src={currentStory.user.avatarUrl || `https://ui-avatars.com/api/?name=${currentStory.user.username}`} 
            className="w-10 h-10 rounded-full border-2 border-white"
            alt={currentStory.user.username}
          />
          <span className="text-white font-bold drop-shadow-md">{currentStory.user.username}</span>
        </div>
        <button onClick={onClose} className="text-white hover:scale-110 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-lg aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
        <img 
          src={currentStory.mediaUrl} 
          alt="Story" 
          className="w-full h-full object-contain"
        />
      </div>

      <button
        onClick={handlePrev} 
        disabled={currentUserIndex === 0 && currentStoryIndex === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full disabled:opacity-0"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        onClick={handleNext} 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
