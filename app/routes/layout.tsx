// routes/layout.tsx
import { Outlet } from "react-router";
import Navbar from "./navbar";

export default function Layout() {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      {/* Main content fills remaining space */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
