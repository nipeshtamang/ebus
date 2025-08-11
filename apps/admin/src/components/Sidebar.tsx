import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  Ticket,
  CreditCard,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onLogout: () => void;
  adminName?: string;
  adminImage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onLogout,
  adminName,
  adminImage,
}) => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/AdminDashboard",
    },
    {
      title: "Search Buses",
      icon: Search,
      href: "/bus-search",
    },
    {
      title: "Schedules",
      icon: Bus,
      href: "/schedules",
    },
    {
      title: "Bookings",
      icon: Ticket,
      href: "/bookings",
    },
    {
      title: "Create Booking",
      icon: Plus,
      href: "/bookings/new",
    },
    {
      title: "Payments",
      icon: CreditCard,
      href: "/payments",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Admin Info */}
      {adminName && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <Avatar className="h-10 w-10 border-2 border-gray-700">
            <AvatarImage
              src={adminImage || "/placeholder.svg?height=40&width=40"}
              alt="Admin"
            />
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              {getInitials(adminName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{adminName}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
