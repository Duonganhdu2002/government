import React from 'react';
import { Text } from '@medusajs/ui';

interface ProcessingTimeData {
  type: string;
  avgTime: number;
}

/**
 * ProcessingAnalysis component provides a visual breakdown of processing times by application type
 */
const ProcessingAnalysis = ({ data }: { data: ProcessingTimeData[] }) => {
  if (!data || data.length === 0) return null;
  
  // Calculate important stats
  const avgProcessingTime = Math.round(data.reduce((sum, item) => sum + item.avgTime, 0) / data.length * 10) / 10;
  const maxProcessingType = data.reduce((max, item) => item.avgTime > max.avgTime ? item : max, data[0]);
  const minProcessingType = data.reduce((min, item) => item.avgTime < min.avgTime ? item : min, data[0]);
  
  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Phân tích thời gian xử lý
      </Text>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <Text size="small" className="text-gray-500">Thời gian xử lý trung bình</Text>
          <Text size="xlarge" weight="plus" className="text-gray-800">{avgProcessingTime} ngày</Text>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <Text size="small" className="text-gray-500">Loại đơn xử lý nhanh nhất</Text>
          <Text size="large" weight="plus" className="text-gray-800">{minProcessingType.type}</Text>
          <Text size="small" className="text-gray-600">{minProcessingType.avgTime} ngày</Text>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <Text size="small" className="text-gray-500">Loại đơn xử lý chậm nhất</Text>
          <Text size="large" weight="plus" className="text-gray-800">{maxProcessingType.type}</Text>
          <Text size="small" className="text-gray-600">{maxProcessingType.avgTime} ngày</Text>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <Text size="small" className="text-gray-600">{item.type}</Text>
              <Text size="small" className="text-gray-600 font-medium">{item.avgTime.toFixed(1)} ngày</Text>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  item.avgTime <= 5 ? 'bg-gray-400' : 
                  item.avgTime <= 10 ? 'bg-gray-500' : 'bg-gray-600'
                }`}
                style={{ width: `${(item.avgTime / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingAnalysis; 