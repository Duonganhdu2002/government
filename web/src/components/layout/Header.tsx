"use client";
import { BellAlert } from "@medusajs/icons"; // Import đúng icon từ thư viện

type HeaderProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header = ({ setSidebarOpen }: HeaderProps) => (
  <header className="flex justify-between items-center bg-white shadow-md p-4">
    {/* Left Section */}
    <div className="flex items-center">
      {/* Hamburger menu visible only on mobile */}
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

    {/* Center Section */}
    <div className="flex items-center space-x-4">
      {/* Nút thông báo */}
      <div className="relative flex items-center justify-center w-8 h-8 hover:bg-gray-300 cursor-pointer">
        <BellAlert className="w-4 h-4 text-gray-700" /> {/* Chuông căn giữa */}
        {/* Chấm đỏ thông báo */}
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      </div>

      {/* Nút Create */}
      <div className="bg-black text-white rounded-lg flex items-center justify-center px-6 py-2 cursor-pointer">
        Create
      </div>
    </div>
  </header>
);

export default Header;
