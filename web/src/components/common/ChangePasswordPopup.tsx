"use client";
import React, { useState } from "react";

type ChangePasswordPopupProps = {
  onClose: () => void;
};

const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setError("");
    console.log("Đổi mật khẩu thành công");
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="mb-4 text-xl font-semibold text-center">Đổi mật khẩu</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
            <input
              type="password"
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-black"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-black"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-300 text-black text-sm font-semibold rounded-md hover:bg-gray-400 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-900 transition"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;
