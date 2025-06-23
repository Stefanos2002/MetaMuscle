import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      {" "}
      <div className="bg-black h-12">MAIN MENU</div>
      <Outlet />
    </div>
  );
}
