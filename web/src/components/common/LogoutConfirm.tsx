"use client";
import React from "react";

type LogoutConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutConfirm: React.FC<LogoutConfirmProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="mb-4 text-xl font-semibold text-center">Đăng xuất</h2>
        <p className="text-center text-gray-700">Bạn chắc chắn muốn đăng xuất?</p>
        <div className="mt-6 flex justify-between">
          <button
            onClick={onCancel}
            className="py-2 px-4 bg-gray-300 text-black text-sm font-semibold rounded-md hover:bg-gray-400 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-4 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
