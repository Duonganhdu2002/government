// File: src/components/common/NavItemAccount.tsx
// This component represents a navigation item for user account actions.
// It displays an icon and a label, and triggers an optional click handler.

"use client";

import { Text } from "@medusajs/ui";
import React from "react";

type NavItemAccountProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
};

const NavItemAccount: React.FC<NavItemAccountProps> = ({ icon, label, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 cursor-pointer"
    >
      <span className="mr-3 mt-1">{icon}</span>
      <Text weight="plus">{label}</Text>
    </div>
  );
};

export default NavItemAccount;
