"use client";

import { Text, Table } from "@medusajs/ui";
import React from "react";

const ProcessingHistory = () => {
  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm overflow-auto">
      <div className="mb-6 text-center">
        <Text className="text-xl font-bold text-gray-800 pb-2">
          LỊCH SỬ XỬ LÝ
        </Text>
      </div>
      
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell className="font-semibold text-gray-600">Tổng số đơn đã xử lý:</Table.Cell>
              <Table.Cell className="text-blue-600 font-bold">120</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="font-semibold text-gray-600">Đơn quá hạn:</Table.Cell>
              <Table.Cell className="text-red-500 font-bold">5</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="font-semibold text-gray-600">Thời gian xử lý trung bình:</Table.Cell>
              <Table.Cell className="text-orange-500 font-bold">2 ngày</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default ProcessingHistory;
