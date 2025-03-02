"use client";
import React, { useState } from "react";
import { Prompt, Label, Text, Alert } from "@medusajs/ui";
import { useAppSelector } from "@/store/hooks";
import { changePasswordAPI } from "@/services/authService";

type ChangePasswordPopupProps = {
  onClose: () => void;
};

const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
  onClose,
}) => {
  // State quản lý thông tin form, lỗi và trạng thái thành công
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Lấy thông tin người dùng từ Redux store (để lấy citizenid)
  const user = useAppSelector((state) => state.auth.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!user || !user.id) {
      setError("Không xác định được người dùng");
      return;
    }

    setError("");
    try {
      await changePasswordAPI({
        citizenid: user.id,
        oldPassword,
        newPassword,
      });
      setSuccess(true);
      // Tự động đóng popup sau 3 giây
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>
            <Text weight="plus" size="xlarge" className="text-gray-800">
              Đổi mật khẩu
            </Text>
          </Prompt.Title>
        </Prompt.Header>

        {error && (
          <div className="px-6 mt-3">
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          </div>
        )}
        {success && (
          <div className=" px-6 mt-3">
            <Alert variant="success" className="mb-4">
              Đổi mật khẩu thành công. Vui lòng đăng nhập lại!
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-6 mt-3">
          <div>
            <Label className="text-gray-700 font-medium">Mật khẩu cũ</Label>
            <input
              type="password"
              placeholder="Nhập mật khẩu cũ"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="border p-2 w-full border-solid rounded-md mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-gray-700 font-medium">Mật khẩu mới</Label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border p-2 w-full border-solid rounded-md mt-1 text-sm"
            />
          </div>
          <Prompt.Footer className="flex justify-between">
            <Prompt.Cancel
              onClick={onClose}
              className="bg-black text-white hover:bg-black/80 py-2 px-4 rounded"
            >
              Hủy
            </Prompt.Cancel>
            <Prompt.Action
              type="submit"
              className="bg-black text-white hover:bg-black/80 py-2 px-4 rounded border-none"
            >
              Xác nhận
            </Prompt.Action>
          </Prompt.Footer>
        </form>
      </Prompt.Content>
    </Prompt>
  );
};

export default ChangePasswordPopup;
