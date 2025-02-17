"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItem = ({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-md text-gray-700 
        hover:bg-gray-100 ${isActive ? "bg-gray-100 font-semibold" : ""}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export default NavItem;
