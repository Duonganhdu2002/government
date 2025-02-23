"use client";

import React, { useState } from "react";

/**
 * Main page component
 */
const Page = () => {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const tabs = [
    "Tất cả",
    "Chờ gửi",
    "Đang kiểm tra",
    "Chờ xử lý",
    "Được tiếp nhận",
    "Đã phê duyệt",
    "Từ chối",
    "Chờ xác nhận ủy quyền",
  ];

  return (
    <div className="max-h-screen min-h-[600px] max-w-5xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-lg overflow-auto">
      <div>
        <div className="mb-6">
          <p className="text-xl text-black font-bold leading-relaxed mb-2">
            Lịch sử đăng ký định danh tổ chức
          </p>
        </div>

        {/* Thanh điều hướng trạng thái */}
        <div className="flex space-x-3 border-b pb-2 font-bold">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all 
                ${
                  activeTab === tab
                    ? "bg-red-600 text-white rounded-full px-5 py-2"
                    : "border-transparent text-black hover:text-red-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Hiển thị nếu không có dữ liệu */}
      <div className="flex justify-center items-center h-40 mt-6">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
            📄
          </div>
          Chưa có thông tin định danh tổ chức
        </div>
      </div>
    </div>
  );
};

export default Page;
