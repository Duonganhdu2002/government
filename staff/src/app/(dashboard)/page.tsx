// src/app/page.tsx
"use client";

import React from "react";
import InfoBox from "@/components/layout/InfoBox";

/**
 * Main page component
 */
const HomePage = () => {
  return (
    <div className=" h-full">
      <div className="p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-ms h-full">
        <div className="mb-6 ">
          <p className="text-xl text-black font-bold leading-relaxed mb-2">
            Chào buổi sáng, Cán bộ!
          </p>
          <p className="text-gray-600 leading-relaxed">
            Chào mừng bạn đến với Trang thông tin định danh điện tử
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            title="Tin tức - Sự kiện"
            description="Tin tức mới cần quan tâm"
            link="#"
          />
          <InfoBox
            title="Lịch trực"
            description="Lịch trực cần chú ý"
            link="#"
          />
          <InfoBox
            title="Lịch nghỉ"
            description="Lịch nghỉ lễ, nghỉ phép"
            link="#"
          />
          <InfoBox
            title="Thông báo"
            description="Thông báo quan trọng cần lưu ý"
            link="#"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
