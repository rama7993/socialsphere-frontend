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
      clearFile();
      onPostCreated?.();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border-none resize-none focus:ring-0 text-gray-900 placeholder-gray-500 text-lg"
          placeholder="What's happening?"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
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

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
          <div>
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
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Image size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
