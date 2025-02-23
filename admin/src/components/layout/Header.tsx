"use client";

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
    <div className=" flex">
      <div className="flex-1 flex justify-center px-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        <div className="bg-black text-white rounded-lg text-center flex justify-center items-center px-6 py-2 cursor-pointer">
          Create
        </div>
      </div>
    </div>
  </header>
);

export default Header;
