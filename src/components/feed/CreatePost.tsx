import { useRef, useState } from "react";
import { Image, X, Sparkles, Loader2 } from "lucide-react";
import api from "../../lib/axios";
import { toast } from "sonner";

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
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

  const handleAISuggest = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first for AI suggestions!");
      return;
    }

    try {
      setIsGeneratingAI(true);

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
      const imageBase64 = await base64Promise;

      const response = await api.post("/ai/caption", { imageBase64 });

      if (response.data.suggestion) {
        setContent(response.data.suggestion);
        // Trigger auto-expand
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
        toast.success("AI suggested a caption!");
      }
    } catch (error) {
      console.error("AI Suggestion failed", error);
      toast.error("Failed to get AI suggestions");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      setIsSubmitting(true);

      // OPTIONAL: Moderation check before posting
      // const modCheck = await api.post("/ai/moderate", { content });
      // if (modCheck.data.status.includes("FLAGGED")) {
      //   toast.error("Content flagged by moderation: " + modCheck.data.status);
      //   return;
      // }

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
        textareaRef.current.style.height = "100px";
      }
      clearFile();
      onPostCreated?.();
      toast.success("Post shared successfully!");
    } catch (error) {
      console.error("Failed to create post", error);
      toast.error("Failed to share post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100/80 rounded-2xl p-6 mb-8 shadow-sm">
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="w-full border-none resize-none focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-400 text-[17px] leading-relaxed mb-4 min-h-[100px] overflow-y-auto transition-all"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            // Auto-expand logic
            e.target.style.height = "auto";
            const newHeight = Math.min(e.target.scrollHeight, 240); // ~6 lines
            e.target.style.height = `${newHeight}px`;
          }}
        />

        {previewUrl && (
          <div className="relative mt-2 mb-4 group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-60 object-cover rounded-lg border border-gray-100"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              title="Add Image"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 focus:outline-none"
            >
              <Image size={20} />
            </button>

            <button
              type="button"
              title="AI Suggest Caption"
              disabled={!selectedFile || isGeneratingAI}
              onClick={handleAISuggest}
              className={`p-2.5 rounded-xl transition-all active:scale-95 focus:outline-none ${
                selectedFile
                  ? "text-amber-500 hover:bg-amber-50"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              {isGeneratingAI ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={
              (!content.trim() && !selectedFile) ||
              isSubmitting ||
              isGeneratingAI
            }
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm shadow-indigo-100 focus:outline-none text-[13px]"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
