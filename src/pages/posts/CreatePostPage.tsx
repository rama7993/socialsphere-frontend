import { CreatePost } from "../../components/feed/CreatePost";
import { useNavigate } from "react-router-dom";

export function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <CreatePost onPostCreated={() => navigate("/")} />
    </div>
  );
}
