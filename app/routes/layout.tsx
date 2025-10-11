import { Outlet, Link } from "react-router";

export default function PageLayout() {
  return (
    <div className="flex w-full items-center justify-center">
      Home
      {/* Page Content */}
      <main className="p-3">
        <Outlet />
      </main>
    </div>
  );
}
