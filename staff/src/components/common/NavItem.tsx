// File: src/components/common/NavItem.tsx
// This component represents a navigation link with an active state indication.
// It uses Next.js' Link and usePathname for navigation and active style.
"use client";

import { Text } from "@medusajs/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 ${
        isActive ? "bg-gray-100 font-semibold" : ""
      }`}
    >
      <span className="mr-3 mt-1">{icon}</span>
      <Text weight="plus">{label}</Text>
    </Link>
  );
};

export default NavItem;
