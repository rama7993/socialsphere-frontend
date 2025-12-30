import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, LogOut, PlusSquare } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuthStore } from "../../store/authStore";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-4 md:px-6 flex items-center justify-between">
      <Link
        to="/"
        className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        SocialSphere
      </Link>

      <div className="flex items-center gap-1 md:gap-6">
        <Link
          to="/"
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            isActive("/")
              ? "bg-blue-50 text-blue-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Home size={24} />
        </Link>

        <button className="p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 md:hidden">
          <PlusSquare size={24} />
        </button>

        <Link
          to="/profile"
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            isActive("/profile")
              ? "bg-blue-50 text-blue-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <User size={24} />
        </Link>

        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
}
