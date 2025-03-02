"use client";

import { Text, Table,  } from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import OverdueDetailPopup from "@/components/common/OverdueDetailPopup"

// Hook để kiểm tra kích thước màn hình có phải mobile không (ở đây dùng breakpoint 768px)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

const overdueRequests = [
  {
    id: "001",
    type: "Nghỉ phép",
    date: "01/03/2025",
    deadline: "06/03/2025",
    sender: "Nguyễn Văn B",
    content: "Xin nghỉ phép 3 ngày vì lý do cá nhân",
    reason: "Thiếu giấy tờ cần thiết",
  },
  {
    id: "002",
    type: "Công tác",
    date: "02/03/2025",
    deadline: "06/03/2025",
    sender: "Trần Văn C",
    content: "Đi công tác tại Hà Nội 5 ngày",
    reason: "Thiếu giấy tờ cần thiết",
  },
  {
    id: "003",
    type: "Khiếu nại",
    date: "03/03/2025", 
    deadline: "06/03/2025",
    sender: "Lê Thị D",
    content: "Khiếu nại về chế độ làm việc",
    reason: "Thiếu giấy tờ cần thiết",
  },
];

const OverdueRequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState<null | typeof overdueRequests[0]>(null);

  
  return (
    <div className="h-full p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm overflow-auto">
      <Text className="text-xl font-bold text-black mb-4">Yêu cầu trễ hạn</Text>
        <Text className="text-md font-semibold text-red-500 mb-2">
          Danh sách các yêu cầu đã quá hạn
        </Text>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className=" font-bold">Mã yêu cầu</Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">Loại đơn</Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">Hạn xử lý</Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">Hành động</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {overdueRequests.map((request) => (
              <Table.Row key={request.id}>
                <Table.Cell>{request.id}</Table.Cell>
                <Table.Cell>{request.type}</Table.Cell>
                <Table.Cell>{request.deadline}</Table.Cell>
                <Table.Cell>
                <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-blue-500 hover:underline"
                  >
                    [Xem chi tiết]
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Hiển thị popup nếu selectedRequest không null */}
        {selectedRequest && (
          <OverdueDetailPopup
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
    </div>
  );
};

export default OverdueRequestsPage;
