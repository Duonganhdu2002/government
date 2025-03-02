"use client";

import React from "react";
import { Prompt, Text, Label, Button } from "@medusajs/ui";

type OverdueDetailPopupProps = {
  request: {
    id: string;
    type: string;
    date: string;
    sender: string;
    content: string;
    deadline: string;
    reason: string;
  };
  onClose: () => void;
};

const OverdueDetailPopup: React.FC<OverdueDetailPopupProps> = ({ request, onClose }) => {
  return (
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header className="flex justify-center">
          <Prompt.Title className="text-center w-full">
            Chi tiết yêu cầu
          </Prompt.Title>
        </Prompt.Header>

        <div className="p-4 space-y-3">
          <div>
            <Label className="font-semibold">Mã yêu cầu:</Label>
            <Text>{request.id}</Text>
          </div>
          <div>
            <Label className="font-semibold">Loại đơn:</Label>
            <Text>{request.type}</Text>
          </div>
          <div>
            <Label className="font-semibold">Ngày nộp:</Label>
            <Text>{request.date}</Text>
          </div>
          <div>
            <Label className="font-semibold">Hạn xử lý:</Label>
            <Text>{request.deadline}</Text>
          </div>
          <div>
            <Label className="font-semibold">Người gửi:</Label>
            <Text>{request.sender}</Text>
          </div>
          <div>
            <Label className="font-semibold">Nội dung:</Label>
            <Text>{request.content}</Text>
          </div>
          <div>
            <Label className="font-semibold">Lý do quá hạn:</Label>
            <Text>{request.reason}</Text>
          </div>
        </div>

        <Prompt.Footer className="flex justify-end gap-3">
          <Button variant="danger">Xử lý Khẩn</Button>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

export default OverdueDetailPopup;
