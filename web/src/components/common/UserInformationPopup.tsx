"use client";
import React from "react";
import { Prompt, Avatar, Text, Label, Button } from "@medusajs/ui";
import { useAppSelector } from "@/store/hooks";

// Nếu interface DecodedUser chưa được định nghĩa ở nơi khác,
// bạn có thể định nghĩa lại (hoặc import từ nơi lưu trữ) như sau:
export interface DecodedUser {
  id: number;
  fullname: string;
  identificationnumber: string;
  address: string;
  phonenumber: string;
  email: string;
  username: string;
  areacode: number;
  imagelink?: string; // Trường này có thể có hoặc không có
  iat: number;
  exp: number;
}

type UserInformationPopupProps = {
  onClose: () => void;
};

const UserInformationPopup: React.FC<UserInformationPopupProps> = ({
  onClose,
}) => {
  // Lấy thông tin người dùng từ Redux store
  const user = useAppSelector((state) => state.auth.user) as DecodedUser | null;

  // Nếu không có thông tin, hiển thị thông báo
  if (!user) {
    return (
      <Prompt open>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Thông tin người dùng</Prompt.Title>
          </Prompt.Header>
          <div className="p-4">
            <Text>Không có thông tin người dùng.</Text>
          </div>
          <Prompt.Footer className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-black text-white hover:bg-black/80 py-2 px-4 rounded"
            >
              Đóng
            </Button>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    );
  }

  return (
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Thông tin người dùng</Prompt.Title>
        </Prompt.Header>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              size="xlarge"
              src={user.imagelink || ""}
              fallback={user.fullname ? user.fullname[0] : user.username[0]}
            />
            <div>
              <Text size="large" className="font-medium">
                {user.fullname ? user.fullname : user.username}
              </Text>
              <Text size="small" className="text-gray-500">
                {user.email || "Không có email"}
              </Text>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <Label>Email:</Label>
              <Text>{user.email || "Không có thông tin"}</Text>
            </div>
            <div>
              <Label>Số điện thoại:</Label>
              <Text>{user.phonenumber || "Không có thông tin"}</Text>
            </div>
            <div>
              <Label>Địa chỉ:</Label>
              <Text>{user.address || "Không có thông tin"}</Text>
            </div>
          </div>
        </div>
        <Prompt.Footer className="flex justify-end">
          <Button
            onClick={onClose}
            className="bg-black text-white hover:bg-black/80 py-2 px-4 rounded"
          >
            Đóng
          </Button>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

export default UserInformationPopup;
