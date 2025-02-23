"use client";

import React from "react";

const NavItemAccount = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void; // <-- Thêm prop onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-200 cursor-pointer"
    >
      <span className="mr-3">{icon}</span>
      {label}
    </div>
  );
};

export default NavItemAccount;
