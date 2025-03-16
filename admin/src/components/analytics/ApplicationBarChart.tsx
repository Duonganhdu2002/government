import React from 'react';
import { Text } from '@medusajs/ui';

interface ApplicationType {
  type: string;
  count: number;
  percentage: number;
}

/**
 * ApplicationBarChart component displays application distribution by type
 */
const ApplicationBarChart = ({ data }: { data: ApplicationType[] }) => {
  if (!data || data.length === 0) return null;
  
  // Sort data in descending order by count
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  // Find the maximum count for scaling the bars
  const maxCount = Math.max(...sortedData.map(item => item.count));
  
  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Phân bố đơn theo loại
      </Text>
      
      <div className="space-y-4">
        {sortedData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <Text size="small" className="text-gray-600">{item.type}</Text>
              <div className="flex items-center">
                <Text size="small" className="text-gray-600 font-medium mr-2">{item.count}</Text>
                <Text size="small" className="text-gray-500">({item.percentage}%)</Text>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gray-700 h-2.5 rounded-full" 
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Text size="small" className="text-gray-500">
          Tổng số: {sortedData.reduce((total, item) => total + item.count, 0)} đơn
        </Text>
      </div>
    </div>
  );
};

export default ApplicationBarChart; 