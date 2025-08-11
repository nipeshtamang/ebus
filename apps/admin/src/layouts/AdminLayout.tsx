// import type { ReactNode } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarInset,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
// } from "@/components/ui/sidebar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   User,
//   LogOut,
//   Bus,
//   Home,
//   Ticket,
//   Route,
//   Users,
//   Download,
// } from "lucide-react";
// import ROUTES from "@/Routes/routes";
// import { useAuth } from "@/context/AuthContext";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useState } from "react";

// const navigationItems = [
//   {
//     title: "Main",
//     items: [
//       { title: "Dashboard", icon: Home, url: ROUTES.AdminDashboard },
//       { title: "New Booking", icon: Ticket, url: ROUTES.BookingForm },
//       { title: "All Bookings", icon: Users, url: ROUTES.BookingList },
//     ],
//   },
//   {
//     title: "Management",
//     items: [
//       { title: "Schedules", icon: Route, url: ROUTES.ScheduleList },
//       { title: "Payments", icon: Download, url: ROUTES.PaymentHistory },
//     ],
//   },
//   {
//     title: "Account",
//     items: [{ title: "Profile", icon: User, url: ROUTES.Profile }],
//   },
// ];

// function AppSidebar({ onLogout }: { onLogout: () => void }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const handleNavigation = (url: string) => {
//     if (url !== "#") {
//       navigate(url);
//     }
//   };

//   const isActiveRoute = (url: string) => {
//     return location.pathname === url;
//   };

//   // Get admin initials for avatar
//   const getAdminInitials = () => {
//     if (!user?.name) return "AD";
//     return user.name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <Sidebar className="border-r border-teal-100 bg-gradient-to-b from-white to-teal-50/30">
//       <SidebarHeader className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <a href="#" className="flex items-center gap-3 group">
//                 <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
//                   <Bus className="size-5" />
//                 </div>
//                 <div className="flex flex-col gap-0.5 leading-none">
//                   <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
//                     BusBooking Pro
//                   </span>
//                   <span className="text-xs text-teal-600 font-medium">
//                     Admin Portal
//                   </span>
//                 </div>
//               </a>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <ScrollArea className="flex-1">
//           {navigationItems.map((section) => (
//             <SidebarGroup key={section.title}>
//               <SidebarGroupLabel className="text-teal-700 font-semibold">
//                 {section.title}
//               </SidebarGroupLabel>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   {section.items.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton
//                         onClick={() => handleNavigation(item.url)}
//                         isActive={isActiveRoute(item.url)}
//                         className="group hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer"
//                       >
//                         <div className="flex items-center gap-3">
//                           <item.icon
//                             className={`size-4 ${isActiveRoute(item.url) ? "text-teal-600" : "text-gray-600 group-hover:text-teal-600"} transition-colors`}
//                           />
//                           <span
//                             className={`${isActiveRoute(item.url) ? "text-teal-700 font-semibold" : "text-gray-700 group-hover:text-teal-700"} transition-colors`}
//                           >
//                             {item.title}
//                           </span>
//                         </div>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           ))}
//         </ScrollArea>
//       </SidebarContent>
//       <SidebarFooter className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton
//                   size="lg"
//                   className="data-[state=open]:bg-gradient-to-r data-[state=open]:from-teal-100 data-[state=open]:to-cyan-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200"
//                 >
//                   <Avatar className="h-9 w-9 rounded-xl border-2 border-teal-200">
//                     <AvatarImage
//                       src={
//                         user?.profileImage ||
//                         "/placeholder.svg?height=36&width=36"
//                       }
//                       alt="Admin"
//                     />
//                     <AvatarFallback className="rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
//                       {getAdminInitials()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="grid flex-1 text-left text-sm leading-tight">
//                     <span className="truncate font-semibold text-gray-800">
//                       {user?.name || "Admin User"}
//                     </span>
//                     <span className="truncate text-xs text-teal-600">
//                       {user?.phoneNumber || "admin@buscompany.com"}
//                     </span>
//                   </div>
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-teal-100 shadow-xl"
//                 side="bottom"
//                 align="end"
//                 sideOffset={4}
//               >
//                 <DropdownMenuLabel className="p-0 font-normal">
//                   <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//                     <Avatar className="h-8 w-8 rounded-lg border border-teal-200">
//                       <AvatarImage
//                         src={
//                           user?.profileImage ||
//                           "/placeholder.svg?height=32&width=32"
//                         }
//                         alt="Admin"
//                       />
//                       <AvatarFallback className="rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
//                         {getAdminInitials()}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="grid flex-1 text-left text-sm leading-tight">
//                       <span className="truncate font-semibold">
//                         {user?.name || "Admin User"}
//                       </span>
//                       <span className="truncate text-xs text-teal-600">
//                         {user?.phoneNumber || "admin@buscompany.com"}
//                       </span>
//                     </div>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={() => handleNavigation(ROUTES.Profile)}
//                   className="hover:bg-teal-50"
//                 >
//                   <User className="mr-2 h-4 w-4 text-teal-600" />
//                   Profile
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={onLogout}
//                   className="hover:bg-red-50 text-red-600 focus:text-red-600"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>

//           <SidebarMenuItem>
//             <SidebarMenuButton
//               onClick={onLogout}
//               className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg mt-4 shadow"
//             >
//               <LogOut className="mr-3 h-4 w-4" />
//               Logout
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

// export function AdminLayout({ children }: { children: ReactNode }) {
//   const { logout } = useAuth();
//   const [showLogoutDialog, setShowLogoutDialog] = useState(false);

//   const handleLogout = () => {
//     setShowLogoutDialog(true);
//   };

//   const confirmLogout = () => {
//     logout();
//     setShowLogoutDialog(false);
//   };

//   return (
//     <SidebarProvider>
//       <div className="flex h-screen w-full">
//         <AppSidebar onLogout={handleLogout} />
//         <SidebarInset className="flex-1">
//           <main className="flex-1 overflow-auto">{children}</main>
//         </SidebarInset>
//       </div>

//       {/* Logout Confirmation Dialog */}
//       <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to logout? You will need to login again to
//               access the admin panel.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmLogout}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               Logout
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </SidebarProvider>
//   );
// }

// export { AppSidebar };
"use client";

import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  LogOut,
  Bus,
  Home,
  Ticket,
  Route,
  Users,
  Download,
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
import { useState } from "react";

const navigationItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", icon: Home, url: ROUTES.AdminDashboard },
      { title: "New Booking", icon: Ticket, url: ROUTES.BookingForm },
      { title: "All Bookings", icon: Users, url: ROUTES.BookingList },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Schedules", icon: Route, url: ROUTES.ScheduleList },
      { title: "Payments", icon: Download, url: ROUTES.PaymentHistory },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Profile", icon: User, url: ROUTES.Profile }],
  },
];

function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { state } = useSidebar();

  const handleNavigation = (url: string) => {
    if (url !== "#") {
      navigate(url);
    }
  };

  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  // Get admin initials for avatar
  const getAdminInitials = () => {
    if (!user?.name) return "AD";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className="border-r border-teal-100 bg-gradient-to-b from-white to-teal-50/30"
      >
        <SidebarHeader className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#" className="flex items-center gap-3 group">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Bus className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      BusBooking Pro
                    </span>
                    <span className="text-xs text-teal-600 font-medium">
                      Admin Portal
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="flex-1">
            {navigationItems.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel className="text-teal-700 font-semibold group-data-[collapsible=icon]:hidden">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => handleNavigation(item.url)}
                              isActive={isActiveRoute(item.url)}
                              className="group hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200 cursor-pointer"
                              tooltip={
                                state === "collapsed" ? item.title : undefined
                              }
                            >
                              <item.icon
                                className={`size-4 ${
                                  isActiveRoute(item.url)
                                    ? "text-teal-600"
                                    : "text-gray-600 group-hover:text-teal-600"
                                } transition-colors`}
                              />
                              <span
                                className={`${
                                  isActiveRoute(item.url)
                                    ? "text-teal-700 font-semibold"
                                    : "text-gray-700 group-hover:text-teal-700"
                                } transition-colors group-data-[collapsible=icon]:hidden`}
                              >
                                {item.title}
                              </span>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {state === "collapsed" && (
                            <TooltipContent
                              side="right"
                              className="font-medium"
                            >
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="border-t border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-gradient-to-r data-[state=open]:from-teal-100 data-[state=open]:to-cyan-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-200"
                      >
                        <Avatar className="h-9 w-9 rounded-xl border-2 border-teal-200">
                          <AvatarImage
                            src={
                              user?.profileImage ||
                              "/placeholder.svg?height=36&width=36" ||
                              "/placeholder.svg"
                            }
                            alt="Admin"
                          />
                          <AvatarFallback className="rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                            {getAdminInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                          <span className="truncate font-semibold text-gray-800">
                            {user?.name || "Admin User"}
                          </span>
                          <span className="truncate text-xs text-teal-600">
                            {user?.phoneNumber || "admin@buscompany.com"}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {state === "collapsed" && (
                    <TooltipContent side="right" className="font-medium">
                      {user?.name || "Admin User"}
                    </TooltipContent>
                  )}
                </Tooltip>
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
                            "/placeholder.svg?height=32&width=32" ||
                            "/placeholder.svg"
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
                  <DropdownMenuItem
                    onClick={() => handleNavigation(ROUTES.Profile)}
                    className="hover:bg-teal-50"
                  >
                    <User className="mr-2 h-4 w-4 text-teal-600" />
                    Profile
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
            </SidebarMenuItem>

            {/* Logout button - only show when expanded */}
            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
              <SidebarMenuButton
                onClick={onLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg mt-4 shadow"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <AppSidebar onLogout={handleLogout} />
        <SidebarInset className="flex-1">
          {/* Header with sidebar trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="text-teal-600 hover:bg-teal-50" />
            <div className="h-4 w-px bg-teal-200" />
            <h1 className="font-semibold text-gray-800">Admin Dashboard</h1>
          </header>

          <main className="flex-1 overflow-auto p-4">{children}</main>
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
