"use client";

import { useState } from "react";
import { Sun } from "@medusajs/icons";
import NavItem from "../common/NavItem";
import { Avatar, Container } from "@medusajs/ui";
import NavItemAccount from "../common/NavItemAccount";
import ChangePasswordPopup from "../common/ChangePasswordPopup";
import LogoutConfirm from "../common/LogoutConfirm";


type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [sidebarWidenOpen, setSidebarWidenOpen] = useState(false);

  // Quản lý việc hiển thị Container trên hover
  const [showContainer, setShowContainer] = useState(false);

  // Quản lý hiển thị popup
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      {/* Overlay cho mobile */}
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
          {/* Avatar & Tên */}
          <div
            className="flex items-center gap-x-3 mb-3 relative"
            onMouseEnter={() => setShowContainer(true)}
            onMouseLeave={() => setShowContainer(false)}
          >
            <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-300 flex items-center justify-center">
              <Avatar
                src="https://images.pexels.com/photos/29914956/pexels-photo-29914956.jpeg"
                fallback=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-lg font-medium">Tên</div>

            {/* Hover vào Avatar để hiện Container */}
            {showContainer && (
              <div className="absolute top-full left-0">
                <Container className="shadow-md p-3 bg-gray-50 space-y-2">
                  <NavItemAccount
                    icon={<Sun className="w-5 h-5" />}
                    label="Đổi mật khẩu"
                    onClick={() => setShowChangePassword(true)}
                  />
                  <hr />
                  <NavItemAccount
                    icon={<Sun className="w-5 h-5" />}
                    label="Đăng xuất"
                    onClick={() => setShowLogout(true)}
                  />
                </Container>
              </div>
            )}
          </div>

          {/* Nav items */}
          <NavItem href="/" icon={<Sun className="w-5 h-5" />} label="Trang chủ" />
          <NavItem
            href="/submit-request"
            icon={<Sun className="w-5 h-5" />}
            label="Submit Request"
          />
          <NavItem
            href="/history"
            icon={<Sun className="w-5 h-5" />}
            label="History"
          />
        </nav>
      </aside>

      {/* Render popup đổi mật khẩu */}
      {showChangePassword && (
        <ChangePasswordPopup onClose={() => setShowChangePassword(false)} />
      )}
      {/* Render popup xác nhận đăng xuất */}
      {showLogout && (
        <LogoutConfirm
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            // Xử lý logic đăng xuất ở đây
            setShowLogout(false);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
