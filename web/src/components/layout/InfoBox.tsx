// File: src/components/layout/InfoBox.tsx
// This component displays an information box with a title, description, and a navigational link.

import React from "react";
import Link from "next/link";

interface InfoBoxProps {
  title: string;
  description: string;
  link: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, description, link }) => {
  return (
    <div className="flex flex-col h-full min-h-[200px] p-4 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-lg text-black font-semibold flex-grow">{title}</h3>
      <p className="text-gray-600 flex-grow">{description}</p>
      <Link href={link} className="text-red-500 font-bold">
        Xem ngay
      </Link>
    </div>
  );
};

export default InfoBox;
