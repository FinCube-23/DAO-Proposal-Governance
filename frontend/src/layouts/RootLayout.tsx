import { Outlet } from "react-router-dom";

export default function RootLayout() {
  
  return (
    <>
      <div>
        Header
        <Outlet />
      </div>
    </>
  );
}