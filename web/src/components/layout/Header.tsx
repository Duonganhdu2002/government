// File: src/components/layout/Header.tsx
// This component renders the header with a mobile hamburger menu,

"use client";

import { Button } from "@medusajs/ui";
import Image from "next/image";

type HeaderProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header = ({ setSidebarOpen }: HeaderProps) => (
  <header className="flex justify-between items-center bg-white shadow-sm p-4">
    {/* Left Section: Hamburger menu for mobile */}
    <div className="flex items-center">
      <button className="md:hidden mr-2" onClick={() => setSidebarOpen(true)}>
        <svg
          className="w-6 h-6 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    {/* Center Section: Notification icon and Create button */}
    <div className="flex items-center space-x-4">
      {/* Notification button with red dot indicator */}
      <div className="relative inline-block">
        <Image src="/bell.svg" alt="Notification Bell" width={24} height={24} />
        <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full" />
      </div>
      <Button>Create</Button>
    </div>
  </header>
);

export default Header;
