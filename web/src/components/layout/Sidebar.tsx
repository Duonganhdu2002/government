// File: src/components/layout/Sidebar.tsx
// This component renders a responsive sidebar with navigation items, a user avatar,

"use client";

import { useState } from "react";
import {
  History,
  DocumentText,
  House,
  OpenRectArrowOut,
  Key,
  UserMini,
} from "@medusajs/icons";
import NavItem from "../common/NavItem";
import { Avatar, Container, Text } from "@medusajs/ui";
import NavItemAccount from "../common/NavItemAccount";
import ChangePasswordPopup from "../common/ChangePasswordPopup";
import LogoutConfirm from "../common/LogoutConfirm";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  // State to control sidebar width toggle
  const [sidebarWidenOpen, setSidebarWidenOpen] = useState(false);

  // State to manage the display of the account options container on hover
  const [showContainer, setShowContainer] = useState(false);

  // States to manage popup visibility for changing password and logging out
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      {/* Mobile overlay to close the sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside
        className={`fixed z-50 top-0 left-0 h-full md:h-screen
          ${sidebarWidenOpen ? "w-[200px]" : "w-[300px]"} 
          bg-white shadow-md p-4 transform transition-transform 
          duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }
          md:static md:translate-x-0
        `}
      >
        <nav className="space-y-2 p-4 bg-white w-64">
          {/* Avatar & User Name */}
          <div
            className="flex items-center gap-x-3 mb-3 relative"
            onMouseEnter={() => setShowContainer(true)}
            onMouseLeave={() => setShowContainer(false)}
          >
            <div className="flex items-center justify-center">
              <Avatar
                size="xlarge"
                src="https://images.pexels.com/photos/29914956/pexels-photo-29914956.jpeg"
                fallback=""
                className="mr-3"
              />
              <Text size="large" className="font-medium">
                Tên
              </Text>
            </div>

            {/* Display account options on hover */}
            {showContainer && (
              <div className="absolute top-full left-0">
                <Container className="shadow-md p-3 bg-gray-50 space-y-2">
                  <NavItemAccount
                    icon={<UserMini className="w-5 h-5" />}
                    label="Thông tin"
                    onClick={() => setShowChangePassword(true)}
                  />
                  <hr />
                  <NavItemAccount
                    icon={<Key className="w-5 h-5" />}
                    label="Đổi mật khẩu"
                    onClick={() => setShowChangePassword(true)}
                  />
                  <NavItemAccount
                    icon={<OpenRectArrowOut className="w-5 h-5" />}
                    label="Đăng xuất"
                    onClick={() => setShowLogout(true)}
                  />
                </Container>
              </div>
            )}
          </div>

          {/* Navigation items */}
          <NavItem
            href="/"
            icon={<House className="w-5 h-5" />}
            label="Trang chủ"
          />
          <NavItem
            href="/submit-request"
            icon={<DocumentText className="w-5 h-5" />}
            label="Yêu cầu"
          />
          <NavItem
            href="/history"
            icon={<History className="w-5 h-5" />}
            label="Lịch sử"
          />
        </nav>
      </aside>

      {/* Render Change Password popup */}
      {showChangePassword && (
        <ChangePasswordPopup onClose={() => setShowChangePassword(false)} />
      )}
      {/* Render Logout confirmation popup */}
      {showLogout && (
        <LogoutConfirm
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            // Handle logout logic here
            setShowLogout(false);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
