import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      {" "}
      Welcome to the dashboard page! <Outlet />
    </div>
  );
}
