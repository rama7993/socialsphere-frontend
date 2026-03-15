import { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../../types";
import api from "../../lib/axios";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
        api.post("/notifications/read-all").catch(() => {});
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="text-red-500" size={18} fill="currentColor" />;
      case "comment":
        return <MessageCircle className="text-blue-500" size={18} fill="currentColor" />;
      case "follow":
        return <UserPlus className="text-purple-500" size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getMessage = (type: string) => {
    switch (type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      default:
        return "interacted with you";
    }
  };

  if (loading) return <div className="text-center py-20">Loading notifications...</div>;

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                n.isRead ? "bg-white border-gray-100" : "bg-blue-50 border-blue-100 shadow-sm"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {n.actor.avatarUrl ? (
                  <img src={n.actor.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                    {n.actor.firstName?.[0]}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-bold">{n.actor.firstName} {n.actor.lastName}</span>{" "}
                  {getMessage(n.type)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="flex-shrink-0">
                {getIcon(n.type)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
