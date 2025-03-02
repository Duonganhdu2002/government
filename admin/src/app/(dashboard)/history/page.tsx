"use client";

import { Text, Tabs, Table, Select } from "@medusajs/ui";
import React, { useState, useEffect } from "react";
import HistoryPopup from "@/components/common/HistoryPopup";

// Hook kiểm tra màn hình có phải mobile không (breakpoint: 768px)
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

const requests = [
  {
    id: "001",
    type: "Nghỉ phép",
    date: "01/03/2025",
    approveDate: "06/03/2025",
    sender: "Nguyễn Văn B",
    approver: "Trần Nguyễn A",
    status: "Đã duyệt",
  },
  {
    id: "002",
    type: "Công tác",
    date: "02/03/2025",
    approveDate: "06/03/2025",
    sender: "Trần Văn C",
    approver: "Trần Nguyễn A",
    status: "Từ chối ",
  },
  {
    id: "003",
    type: "Khiếu nại",
    date: "03/03/2025", 
    approveDate: "06/03/2025",
    sender: "Lê Thị D",
    approver: "Trần Nguyễn A",
    status: "Đã duyệt",
  },
];

const Page = () => {
  const [selectedRequest, setSelectedRequest] = useState<null | typeof filteredRequests[0]>(null);

  const tabs = ["Tất cả", "Nghỉ phép", "Công tác", "Khiếu nại",];
  const [activeTab, setActiveTab] = useState("0");
  const isMobile = useIsMobile();

  const handleSelectChange = (value: string) => {
    setActiveTab(value);
  };

  // Lọc danh sách theo tab
  const filteredRequests =
    activeTab === "0"
      ? requests
      : requests.filter((r) => r.type === tabs[parseInt(activeTab)]);

  return (
    <div className="h-full p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm overflow-auto">
      <div>
        {/* Tiêu đề */}
        <div className="mb-6">
          <Text className="text-lg md:text-xl font-bold">
            Lịch sử tiếp nhận 
          </Text>
        </div>

        {/* Tabs hoặc Select cho mobile */}
        {isMobile ? (
          <Select value={activeTab} onValueChange={handleSelectChange}>
            <Select.Trigger className="mb-4">
              <Select.Value placeholder="Chọn trạng thái" />
            </Select.Trigger>
            <Select.Content>
              {tabs.map((tab, index) => (
                <Select.Item key={index} value={index.toString()}>
                  {tab}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="mb-6">
              {tabs.map((tab, index) => (
                <Tabs.Trigger key={index} value={index.toString()}>
                  {tab}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        )}

        {/* Bảng hiển thị dữ liệu */}
        <Table>
          <Table.Header>
            <Table.Row className="bg-gray-100">
              <Table.HeaderCell className=" font-bold">
                Mã yêu cầu
              </Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">
                Loại đơn
              </Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">
                Ngày duyệt
              </Table.HeaderCell>
              <Table.HeaderCell className=" font-bold">
                Hành động
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredRequests.map((request) => (
              <Table.Row key={request.id}>
                <Table.Cell >{request.id}</Table.Cell>
                <Table.Cell >
                  {request.type}
                </Table.Cell>
                <Table.Cell >{request.approveDate}</Table.Cell>
                <Table.Cell >
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
          <HistoryPopup
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
