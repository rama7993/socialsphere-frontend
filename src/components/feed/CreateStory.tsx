import { useEffect, useRef, useState } from "react";
import { Image, X, Upload } from "lucide-react";
import api from "../../lib/axios";

interface CreateStoryProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export function CreateStory({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryProps) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMediaUrl(""); // Clear URL input if file is selected
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
    if (!mediaUrl && !selectedFile) return;

    setLoading(true);
    try {
      let finalMediaUrl = mediaUrl;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalMediaUrl = uploadResponse.data.url;
      }

      await api.post("/stories", { mediaUrl: finalMediaUrl });
      onStoryCreated();
      onClose();
      setMediaUrl("");
      clearFile();
    } catch (error) {
      console.error("Failed to create story", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl transform transition-all">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Create Story</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Media
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Upload size={14} />
                Upload from device
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {!selectedFile ? (
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-sm"
              />
            ) : (
              <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <span className="text-sm text-blue-700 font-medium truncate">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="aspect-[9/16] w-full max-h-[320px] relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center group">
            {previewUrl || mediaUrl ? (
              <>
                <img
                  src={previewUrl || mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (!previewUrl) {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x711?text=Invalid+Image+URL";
                    }
                  }}
                />
                {!previewUrl && (
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                )}
              </>
            ) : (
              <div 
                className="flex flex-col items-center space-y-2 text-gray-400 text-center px-6 cursor-pointer hover:text-gray-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                  <Image size={32} />
                </div>
                <div>
                  <p className="font-semibold">Drop image or click</p>
                  <p className="text-xs text-gray-400">Your story will appear here</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!mediaUrl && !selectedFile)}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? "Sharing..." : "Share to Story"}
          </button>
        </form>
      </div>
    </div>
  );
}
