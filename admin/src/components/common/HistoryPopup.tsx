"use client";

import React from "react";
import { Prompt, Text, Label, Button } from "@medusajs/ui";

type HistoryPopupProps = {
  request: {
    id: string;
    type: string;
    date: string;
    sender: string;
    approveDate: string;
    approver: string;
    status: string;
  };
  onClose: () => void;
};

const HistoryPopup: React.FC<HistoryPopupProps> = ({ request, onClose }) => {
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
            <Label className="font-semibold">Ngày duyệt:</Label>
            <Text>{request.approveDate}</Text>
          </div>
          <div>
            <Label className="font-semibold">Người gửi:</Label>
            <Text>{request.sender}</Text>
          </div>
          <div>
            <Label className="font-semibold">Người duyệt:</Label>
            <Text>{request.approver}</Text>
          </div>
          <div>
            <Label className="font-semibold">Trạng thái:</Label>
            <Text>{request.status}</Text>
          </div>
        </div>

        <Prompt.Footer className="flex justify-end gap-3">
          <Button variant="primary">Tải xuống</Button>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

export default HistoryPopup;
