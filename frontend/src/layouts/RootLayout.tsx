import Header from "@components/Header";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Toaster richColors />
    </>
  );
}
