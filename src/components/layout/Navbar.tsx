import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, LogOut, PlusSquare, Bell } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../store/authStore";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications/unread-count").then((res) => {
      setUnreadCount(res.data.count);
    });
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-4 md:px-6 flex items-center justify-between shadow-sm">
      <Link
        to="/"
        className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter"
      >
        SocialSphere
      </Link>

      <div className="flex items-center gap-1 md:gap-6">
        <Link
          to="/"
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            isActive("/")
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Home size={22} />
        </Link>

        <Link
          to="/notifications"
          className={cn(
            "p-3 rounded-xl transition-all duration-200 relative",
            isActive("/notifications")
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link 
          to="/create"
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            isActive("/create")
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <PlusSquare size={22} />
        </Link>

        <Link
          to="/profile"
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            isActive("/profile")
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <User size={22} />
        </Link>

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
}
