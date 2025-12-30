import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 px-4 md:px-0 max-w-2xl mx-auto pb-20">
        <Outlet />
      </main>
    </div>
  );
}
