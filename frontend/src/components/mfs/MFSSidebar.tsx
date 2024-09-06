import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@components/ui/card";
import {
  Package2,
  Bell,
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";

export const MFS_SIDEBAR_LINKS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Orders",
    href: "/mfs/orders",
    icon: ShoppingCart,
  },
  {
    name: "Products",
    href: "/mfs/products",
    icon: Package,
  },
  {
    name: "Customers",
    href: "/mfs/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/mfs/customers",
    icon: LineChart,
  },
];

export default function MFSSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Acme Inc</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {MFS_SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card x-chunk="dashboard-02-chunk-0">
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>
                Unlock all features and get unlimited access to our support
                team.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
