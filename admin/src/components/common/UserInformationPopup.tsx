import React from "react";
import { Prompt, Avatar, Text, Label, Button } from "@medusajs/ui";

type UserInformationPopupProps = {
  onClose: () => void;
};

const UserInformationPopup: React.FC<UserInformationPopupProps> = ({ onClose }) => {
  // Dữ liệu mẫu của người dùng (sau này có thể được lấy từ API hoặc state)
  const user = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    employeeId: "CB123456",
    department: "Phòng Hành chính",
    avatar:
      "https://images.pexels.com/photos/29914956/pexels-photo-29914956.jpeg",
  };

  return (
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Thông tin cán bộ</Prompt.Title>
        </Prompt.Header>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar size="xlarge" src={user.avatar} fallback={user.name[0]} />
            <div>
              <Text size="large" className="font-medium">
                {user.name}
              </Text>
              <Text size="small" className="text-gray-500">
                {user.email}
              </Text>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <Label>Mã cán bộ:</Label>
              <Text>{user.employeeId}</Text>
            </div>
            <div>
              <Label>Đơn vị:</Label>
              <Text>{user.department}</Text>
            </div>
            <div>
              <Label>Email:</Label>
              <Text>{user.email}</Text>
            </div>
            <div>
              <Label>Số điện thoại:</Label>
              <Text>{user.phone}</Text>
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

