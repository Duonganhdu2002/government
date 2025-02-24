import React, { useState } from "react";
import { Prompt, Label, Text } from "@medusajs/ui";

type ChangePasswordPopupProps = {
  onClose: () => void;
};

const ChangePasswordPopup: React.FC<ChangePasswordPopupProps> = ({
  onClose,
}) => {
  // State lưu trữ thông tin form và lỗi
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // Xử lý submit form với validation cơ bản
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
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>
            <Text weight="plus" size="xlarge" className=" text-gray-800">
              Đổi mật khẩu
            </Text>
          </Prompt.Title>
        </Prompt.Header>
        {error && (
          <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 mt-3">
          <div>
            <Label className=" text-gray-700 font-medium">Mật khẩu cũ</Label>
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
            <Label className=" text-gray-700 font-medium">Mật khẩu mới</Label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border p-2 w-full rounded-md border-solid mt-1 text-sm"
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
