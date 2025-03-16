import React from 'react';
import { Text } from '@medusajs/ui';

interface TrendData {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
}

/**
 * TrendLineChart component displays application trends over time
 */
const TrendLineChart = ({ data }: { data: TrendData[] }) => {
  if (!data || data.length === 0) return null;
  
  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map(day => Math.max(day.submitted, day.approved, day.rejected))
  );
  
  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Xu hướng 7 ngày qua
      </Text>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Ngày</th>
              <th scope="col" className="px-4 py-3">Nộp đơn</th>
              <th scope="col" className="px-4 py-3">Đã duyệt</th>
              <th scope="col" className="px-4 py-3">Từ chối</th>
              <th scope="col" className="px-4 py-3">Biểu đồ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day, index) => (
              <tr key={index} className="bg-white border-b">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {day.date}
                </td>
                <td className="px-4 py-3">
                  {day.submitted}
                </td>
                <td className="px-4 py-3">
                  {day.approved}
                </td>
                <td className="px-4 py-3">
                  {day.rejected}
                </td>
                <td className="px-4 py-3 w-44">
                  <div className="flex items-center h-6">
                    {/* Submitted bar */}
                    {day.submitted > 0 && (
                      <div 
                        className="h-4 bg-gray-300"
                        style={{ 
                          width: `${(day.submitted / maxValue) * 100}%`,
                          maxWidth: '40%'
                        }}
                      ></div>
                    )}
                    {/* Approved bar */}
                    {day.approved > 0 && (
                      <div 
                        className="h-4 bg-gray-600"
                        style={{ 
                          width: `${(day.approved / maxValue) * 100}%`,
                          maxWidth: '40%'
                        }}
                      ></div>
                    )}
                    {/* Rejected bar */}
                    {day.rejected > 0 && (
                      <div 
                        className="h-4 bg-gray-800"
                        style={{ 
                          width: `${(day.rejected / maxValue) * 100}%`,
                          maxWidth: '40%'
                        }}
                      ></div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-end mt-3 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded-sm mr-2"></div>
          <Text size="small" className="text-gray-600">Nộp đơn</Text>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-600 rounded-sm mr-2"></div>
          <Text size="small" className="text-gray-600">Đã duyệt</Text>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-800 rounded-sm mr-2"></div>
          <Text size="small" className="text-gray-600">Từ chối</Text>
        </div>
      </div>
    </div>
  );
};

export default TrendLineChart; 