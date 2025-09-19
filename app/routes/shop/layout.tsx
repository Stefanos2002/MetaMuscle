import { Outlet, Link } from "react-router";

export default function ShopLayout() {
  return (
    <div className="flex w-full items-center justify-center">
      filter
      {/* Page Content */}
      <main className="p-3">
        <Outlet />
      </main>
    </div>
  );
}
