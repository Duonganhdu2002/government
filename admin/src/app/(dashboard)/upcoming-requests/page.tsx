"use client";

import { Text, Table,  } from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import UpcomingDetailPopup from "@/components/common/UpcomingDetailPopup"

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

const upcomingRequests = [
  {
    id: "001",
    type: "Nghỉ phép",
    date: "01/03/2025",
    deadline: "06/03/2025",
    sender: "Nguyễn Văn B",
    content: "Xin nghỉ phép 3 ngày vì lý do cá nhân",
    image: "https://example.com/image1.jpg",
    video: "https://example.com/video1.mp4",
  },
  {
    id: "002",
    type: "Công tác",
    date: "02/03/2025",
    deadline: "06/03/2025",
    sender: "Trần Văn C",
    content: "Đi công tác tại Hà Nội 5 ngày",
    image: "https://example.com/image2.jpg",
    video: "https://example.com/video1.mp4",
  },
  {
    id: "003",
    type: "Khiếu nại",
    date: "03/03/2025", 
    deadline: "06/03/2025",
    sender: "Lê Thị D",
    content: "Khiếu nại về chế độ làm việc",
    image: "https://example.com/image2.jpg",
    video: "https://example.com/video2.mp4",
  },
];

const UpcomingRequestsPage = () => {
  const [selectedRequest, setSelectedRequest] = useState<null | typeof upcomingRequests[0]>(null);


  return (
    <div className="h-full p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm overflow-auto">
      <Text className="text-xl font-bold text-black mb-4">Yêu cầu sắp đến hạn</Text>
        <Text className="text-md font-semibold text-red-500 mb-2">
          Danh sách các yêu cầu sắp đến hạn
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
            {upcomingRequests.map((request) => (
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
          <UpcomingDetailPopup
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
    </div>
  );
};

export default UpcomingRequestsPage;
