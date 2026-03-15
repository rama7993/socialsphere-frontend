import { useLoadingStore } from "../../store/loadingStore";

export function GlobalLoader() {
  const isLoading = useLoadingStore((state: any) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-100 overflow-hidden">
      <div className="h-full bg-indigo-600 animate-loading-bar shadow-[0_0_10px_#4f46e5]"></div>
    </div>
  );
}
