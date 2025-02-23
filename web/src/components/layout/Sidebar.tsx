"use client";

import { useState } from "react";
import { Sun, Plus } from "@medusajs/icons";
import NavItem from "../common/NavItem";
import Link from "next/link";
import { Avatar } from "@medusajs/ui";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [sidebarWidenOpen, setSidebarWidenOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed z-50 top-0 left-0 h-full md:h-screen 
          ${
            sidebarWidenOpen ? "w-[200px]" : "w-[300px]"
          } bg-white shadow-md p-4 
          transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0`}
      >
        <nav className="space-y-2 p-4 bg-white w-64">
          <div className="flex items-center gap-x-3 mb-3">
            
              <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-300 flex items-center justify-center">
                <Avatar
                  src="https://images.pexels.com/photos/29914956/pexels-photo-29914956.jpeg"
                  fallback=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-lg font-medium">Ten</div>
          </div>
          <NavItem
            href="/"
            icon={<Sun className="w-5 h-5" />}
            label="Trang chủ"
          />
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
    </>
  );
};

export default Sidebar;
