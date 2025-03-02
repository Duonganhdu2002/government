"use client";

import { Text, Tabs, Table, Select } from "@medusajs/ui";
import React, { useState, useEffect } from "react";

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

const Page = () => {
  const tabs = [
    "Tất cả",
    "Chờ gửi",
    "Đang kiểm tra",
    "Chờ xử lý",
    "Được tiếp nhận",
    "Đã phê duyệt",
    "Từ chối",
    "Chờ xác nhận ủy quyền",
  ];

  // activeTab lưu giá trị dưới dạng chuỗi, khớp với value của Tabs hoặc Select.Item
  const [activeTab, setActiveTab] = useState("0");
  const isMobile = useIsMobile();

  const handleSelectChange = (value: React.SetStateAction<string>) => {
    setActiveTab(value);
  };

  return (
    <div className="h-full p-5 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm overflow-auto">
      <div>
        <div className="mb-6">
          <Text className="text-lg md:text-xl font-bold">
            Lịch sử đăng ký định danh tổ chức
          </Text>
        </div>

        {/* Hiển thị Select cho mobile, Tabs cho desktop */}
        {isMobile ? (
          <Select value={activeTab} onValueChange={handleSelectChange}>
            <Select.Trigger className=" mb-4">
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

        {/* Hiển thị nội dung theo activeTab */}
        {tabs.map((tab, index) => (
          <div key={index} className={activeTab === index.toString() ? "" : "hidden"}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.HeaderCell>Customer</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>Emil Larsson</Table.Cell>
                  <Table.Cell>emil2738@gmail.com</Table.Cell>
                </Table.Row>
                {/* Thêm các dòng dữ liệu khác nếu cần */}
              </Table.Body>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
