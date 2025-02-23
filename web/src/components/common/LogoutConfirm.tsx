
"use client";
import React from "react";

type LogoutConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutConfirm = ({ onCancel, onConfirm }: LogoutConfirmProps) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-4 rounded-md shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Đăng xuất</h2>
        <p>Bạn chắc chắn muốn đăng xuất?</p>
        <div className="mt-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 py-2 px-4 rounded-md mr-2"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white py-2 px-4 rounded-md"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
