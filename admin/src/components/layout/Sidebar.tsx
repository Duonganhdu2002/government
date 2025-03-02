"use client";
import React, { useState } from "react";
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
import UserInformationPopup from "../common/UserInformationPopup";
import { useLogoutHandler } from "@/utils/logoutHandler";
import { useAppSelector } from "@/store/hooks";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  // State quản lý kích thước sidebar và hiển thị các popup
  const [sidebarWidenOpen, setSidebarWidenOpen] = useState(false);
  const [showContainer, setShowContainer] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showInformation, setShowInformation] = useState(false);

  const handleLogout = useLogoutHandler();

  // Lấy thông tin user từ Redux store
  const user = useAppSelector((state) => state.auth.user);

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
          {/* Avatar & Tên người dùng */}
          <div
            className="flex items-center gap-x-3 mb-3 relative"
            onMouseEnter={() => setShowContainer(true)}
            onMouseLeave={() => setShowContainer(false)}
          >
            <div className="flex items-center justify-center">
              <Avatar
                size="xlarge"
                src={user?.imagelink || "https://images.pexels.com/photos/29914956/pexels-photo-29914956.jpeg"}
                fallback={user ? user.fullname[0] : "T"}
                className="mr-3"
              />
              <Text size="large" className="font-medium">
                {user ? user.fullname : "Tên"}
              </Text>
            </div>

            {/* Các tùy chọn tài khoản hiển thị khi hover */}
            {showContainer && (
              <div className="absolute top-full left-0">
                <Container className="shadow-md p-3 bg-gray-50 space-y-2">
                  <NavItemAccount
                    icon={<UserMini className="w-5 h-5" />}
                    label="Thông tin"
                    onClick={() => setShowInformation(true)}
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

          {/* Các navigation item */}
          <NavItem href="/" icon={<House className="w-5 h-5" />} label="Trang chủ" />
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

      {/* Popup các chức năng */}
      {showChangePassword && (
        <ChangePasswordPopup onClose={() => setShowChangePassword(false)} />
      )}
      {showLogout && (
        <LogoutConfirm
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            handleLogout();
            setShowLogout(false);
          }}
        />
      )}
      {showInformation && (
        <UserInformationPopup onClose={() => setShowInformation(false)} />
      )}
    </>
  );
};

export default Sidebar;
