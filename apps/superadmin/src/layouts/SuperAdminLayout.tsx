import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  LogOut,
  User,
  Server,
  FileText,
  Bus,
  Calendar,
  CreditCard,
  Ticket,
  Settings,
} from "lucide-react";
import ROUTES from "@/Routes/routes";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const navigationItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: ROUTES.AdminDashboard },
      { title: "User Management", icon: Users, url: ROUTES.UserManagement },
    ],
  },
  {
    title: "Fleet & Operations",
    items: [
      {
        title: "Fleet Management",
        icon: Bus,
        url: ROUTES.FleetManagement,
      },
      { title: "Bookings", icon: Calendar, url: ROUTES.BookingList },
      { title: "Payments", icon: CreditCard, url: ROUTES.PaymentHistory },
      { title: "Tickets", icon: Ticket, url: ROUTES.Tickets },
    ],
  },
  {
    title: "System",
    items: [
      { title: "System Health", icon: Server, url: ROUTES.SystemHealth },
      { title: "Reports", icon: FileText, url: ROUTES.Reports },
      { title: "System Logs", icon: FileText, url: ROUTES.SystemLogs },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      { title: "Profile", icon: User, url: ROUTES.Profile },
      { title: "Settings", icon: Settings, url: ROUTES.Profile }, // Using Profile for now, can be expanded later
    ],
  },
];

function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const location = useLocation();

  // Get admin initials for avatar
  const getAdminInitials = () => {
    if (!user?.name) return "AD";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-teal-100 bg-gradient-to-b from-white to-teal-50/30 shadow-xl p-4">
      <SidebarHeader className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-6 flex items-center justify-center min-h-[92px]">
        <SidebarMenu>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
              <Link
                to={ROUTES.AdminDashboard}
                className="flex items-center gap-4 group"
              >
                <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white">
                  <LayoutDashboard className="size-6" />
                </div>
                <div className="flex flex-col gap-1 leading-none">
                  <span className="font-extrabold text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
                    BusBooking Pro
                  </span>
                  <span className="text-xs text-purple-600 font-semibold tracking-wide">
                    Superadmin Portal
                  </span>
                </div>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1 gap-10">
          {navigationItems.map((section) => (
            <SidebarGroup
              key={section.title}
              className="mb-6 border-b last:border-b-0 border-teal-100 pb-4"
            >
              <SidebarGroupLabel className="text-teal-700 font-semibold hover:text-cyan-700 transition-colors cursor-pointer">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent className="rounded-xl shadow-sm bg-white">
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        asChild
                        className="group hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer py-3 px-4"
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 w-full h-full"
                        >
                          <item.icon
                            className={`size-4 ${location.pathname === item.url ? "text-teal-600" : "text-gray-600 group-hover:text-teal-600"} transition-colors`}
                          />
                          <span
                            className={`${location.pathname === item.url ? "text-teal-700 font-semibold" : "text-gray-700 group-hover:text-teal-700"} transition-colors`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 mt-8 py-4">
        <SidebarMenu>
          <SidebarMenuSubItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuSubButton className="data-[state=open]:bg-gradient-to-r data-[state=open]:from-teal-100 data-[state=open]:to-cyan-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200 py-3 px-4 rounded-xl shadow bg-white mb-4">
                  <Avatar className="h-9 w-9 rounded-xl border-2 border-teal-200">
                    <AvatarImage
                      src={
                        user?.profileImage ||
                        "/placeholder.svg?height=36&width=36"
                      }
                      alt="Admin"
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                      {getAdminInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-gray-800">
                      {user?.name || "Admin User"}
                    </span>
                    <span className="truncate text-xs text-teal-600">
                      {user?.phoneNumber || "admin@buscompany.com"}
                    </span>
                  </div>
                </SidebarMenuSubButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-teal-100 shadow-xl"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border border-teal-200">
                      <AvatarImage
                        src={
                          user?.profileImage ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt="Admin"
                      />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                        {getAdminInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || "Admin User"}
                      </span>
                      <span className="truncate text-xs text-teal-600">
                        {user?.phoneNumber || "admin@buscompany.com"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="hover:bg-teal-50">
                  <Link to={ROUTES.Profile} className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-teal-600" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-teal-50">
                  <Link to={ROUTES.Profile} className="flex items-center">
                    <Settings className="mr-2 h-4 w-4 text-teal-600" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="hover:bg-red-50 text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuSubItem>

          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg mt-8 shadow-lg text-lg py-3"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar onLogout={handleLogout} />
        <SidebarInset className="flex-1">
          {/* Header with quick access */}
          <header className="border-b border-teal-100 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-gray-800">
                  Superadmin Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={ROUTES.Profile}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to
              access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

export { AppSidebar };
