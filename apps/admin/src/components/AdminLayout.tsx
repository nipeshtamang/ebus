import React from "react";
import Sidebar from "./Sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  adminName?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  onLogout,
  adminName,
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={onLogout} adminName={adminName} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
