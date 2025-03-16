import React from 'react';
import { Text } from '@medusajs/ui';
import { CheckCircle, XMark, Clock } from '@medusajs/icons';

interface StaffMember {
  name: string;
  processedCount: number;
  approvalRate: number;
  avgProcessingTime: number;
}

/**
 * StaffPerformance component displays a table of staff performance metrics
 */
const StaffPerformance = ({ data }: { data: StaffMember[] }) => {
  if (!data || data.length === 0) return null;
  
  // Sort staff by processed count (descending)
  const sortedStaff = [...data].sort((a, b) => b.processedCount - a.processedCount);
  
  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Hiệu suất nhân viên
      </Text>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Tên nhân viên</th>
              <th scope="col" className="px-6 py-3">Đơn đã xử lý</th>
              <th scope="col" className="px-6 py-3">Tỷ lệ duyệt</th>
              <th scope="col" className="px-6 py-3">Thời gian TB</th>
              <th scope="col" className="px-6 py-3">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {sortedStaff.map((staff, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {staff.name}
                </td>
                <td className="px-6 py-4">
                  {staff.processedCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: `${staff.approvalRate}%` }}></div>
                    </div>
                    <span>{staff.approvalRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{staff.avgProcessingTime.toFixed(1)} ngày</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getPerformanceIndicator(staff.processedCount, staff.avgProcessingTime)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function to determine staff performance level
function getPerformanceIndicator(processedCount: number, avgTime: number): JSX.Element {
  // Simple performance evaluation logic
  if (processedCount > 20 && avgTime < 5) {
    return (
      <div className="flex items-center text-gray-700">
        <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
        <span>Xuất sắc</span>
      </div>
    );
  } else if (processedCount > 10 || avgTime < 7) {
    return (
      <div className="flex items-center text-gray-700">
        <Clock className="w-5 h-5 mr-1 text-blue-500" />
        <span>Đạt</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-700">
        <XMark className="w-5 h-5 mr-1 text-red-500" />
        <span>Cần cải thiện</span>
      </div>
    );
  }
}

export default StaffPerformance; 