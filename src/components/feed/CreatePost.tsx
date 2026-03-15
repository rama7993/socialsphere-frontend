import { useRef, useState } from "react";
import { Image, X } from "lucide-react";
import api from "../../lib/axios";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      setIsSubmitting(true);
      let imageUrl = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadResponse.data.url;
      }

      await api.post("/posts", {
        title: "New Post",
        content,
        imageUrl: imageUrl || undefined,
      });

      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = '100px';
      }
      clearFile();
      onPostCreated?.();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-6 mb-8 shadow-sm">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="w-full border-none resize-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-[17px] leading-relaxed mb-4 min-h-[100px] overflow-y-auto"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            // Auto-expand logic
            e.target.style.height = 'auto';
            const newHeight = Math.min(e.target.scrollHeight, 240); // ~6 lines (approx 40px per line)
            e.target.style.height = `${newHeight}px`;
          }}
        />

        {previewUrl && (
          <div className="relative mt-2 mb-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-60 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 focus:outline-none"
            >
              <Image size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shadow-indigo-100 focus:outline-none text-[13px]"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
