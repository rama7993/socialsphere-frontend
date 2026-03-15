import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X, Camera } from "lucide-react";
import api from "../../lib/axios";
import type { User } from "../../types";

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

type AvatarMode = "url" | "file";

export function EditProfileModal({ user, isOpen, onClose, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatarUrl: user.avatarUrl || "",
  });
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("url");
  const [previewUrl, setPreviewUrl] = useState<string>(user.avatarUrl || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({ ...prev, avatarUrl: data.url }));
      setPreviewUrl(data.url);
    } catch {
      setPreviewUrl(formData.avatarUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch("/users/profile", formData);
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all focus:bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <X size={20} />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Edit profile</h2>
          <button
            form="edit-profile-form"
            type="submit"
            disabled={loading || uploading}
            className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>

        <form
          id="edit-profile-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[75vh] custom-scrollbar"
        >
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-3 px-5 py-6 bg-gray-50 border-b border-gray-100">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-gray-200 bg-gray-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-2xl font-bold uppercase">
                    {user.username?.[0] || "?"}
                  </div>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900">Profile photo</p>

            {/* Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAvatarMode("file")}
                className={`flex items-center gap-1.5 px-4 py-2 transition-all ${
                  avatarMode === "file" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Upload size={13} /> Upload file
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode("url")}
                className={`flex items-center gap-1.5 px-4 py-2 transition-all ${
                  avatarMode === "url" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LinkIcon size={13} /> Paste URL
              </button>
            </div>

            {avatarMode === "file" ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  <Camera size={15} />
                  {uploading ? "Uploading…" : "Choose photo"}
                </button>
              </>
            ) : (
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, avatarUrl: e.target.value }));
                  setPreviewUrl(e.target.value);
                }}
                className={`${inputClass} w-full`}
                placeholder="https://example.com/avatar.jpg"
              />
            )}
          </div>

          {/* Fields */}
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={`${inputClass} min-h-[88px] resize-none`}
                placeholder="Tell people about yourself…"
                maxLength={160}
              />
              <p className="text-right text-xs text-gray-400">{formData.bio.length}/160</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={inputClass}
                placeholder="yourwebsite.com"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
