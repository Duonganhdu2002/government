"use client";
import React from "react";

type ChangePasswordPopupProps = {
  onClose: () => void;
};

const ChangePasswordPopup = ({ onClose }: ChangePasswordPopupProps) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Đổi mật khẩu</h2>
        {/* Form đổi mật khẩu giả lập */}
        <form>
          <label className="block mb-2">Mật khẩu cũ</label>
          <input
            type="password"
            className="border p-2 w-full rounded-md mb-4"
          />
          <label className="block mb-2">Mật khẩu mới</label>
          <input
            type="password"
            className="border p-2 w-full rounded-md mb-4"
          />
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;
