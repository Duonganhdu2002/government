"use client";
import React from "react";
import InfoBox from "@/components/layout/InfoBox";
import { useAppSelector } from "@/store/hooks";

const HomePage = () => {
  // Lấy thông tin user từ Redux store
  const user = useAppSelector((state) => state.auth.user);
  const userName = user ? (user.fullname || user.username) : "người dùng";

  return (
    <div className="h-full">
      <div className="p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-ms h-full">
        <div className="mb-6">
          <p className="text-xl text-black font-bold leading-relaxed mb-2">
            Chào buổi sáng, {userName}!
          </p>
          <p className="text-gray-600 leading-relaxed">
            Chào mừng bạn đến với Trang gửi yêu cầu đến cơ quan chức năng
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            title="Tin tức - Sự kiện"
            description="Tin tức nổi bật mới nhất trong ngày"
            link="#"
          />
          <InfoBox
            title="Cảnh báo lừa đảo"
            description="Cảnh báo lừa đảo mới nhất trong ngày"
            link="#"
          />
          <InfoBox
            title="Câu hỏi thường gặp"
            description="Những thắc mắc của người dùng về Ứng dụng VNeID"
            link="#"
          />
          <InfoBox
            title="Câu hỏi thường gặp"
            description="Những thắc mắc của người dùng về Ứng dụng VNeID"
            link="#"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
