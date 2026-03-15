import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  requestsCount: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  requestsCount: 0,
  startLoading: () => set((state) => ({
    requestsCount: state.requestsCount + 1,
    isLoading: true
  })),
  stopLoading: () => set((state) => {
    const nextCount = Math.max(0, state.requestsCount - 1);
    return {
      requestsCount: nextCount,
      isLoading: nextCount > 0
    };
  }),
}));
