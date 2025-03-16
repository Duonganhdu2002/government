import React from 'react';
import { Text } from '@medusajs/ui';
import { CheckCircle, XMark, Clock } from '@medusajs/icons';

interface StatusData {
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * StatusPieChart component displays a simple pie chart of application statuses
 */
const StatusPieChart = ({ data }: { data: StatusData }) => {
  if (!data) return null;
  
  const total = data.pending + data.approved + data.rejected;
  if (total === 0) return null;
  
  const pendingPercent = Math.round((data.pending / total) * 100);
  const approvedPercent = Math.round((data.approved / total) * 100);
  const rejectedPercent = Math.round((data.rejected / total) * 100);
  
  // SVG pie chart dimensions
  const size = 120;
  const center = size / 2;
  const radius = center - 10;
  
  // Calculate the angles for each segment
  let startAngle = 0;
  
  // Calculate segment angles - we'll use these to draw the pie chart
  const pendingAngle = (data.pending / total) * 360;
  const approvedAngle = (data.approved / total) * 360;
  // No need to calculate rejectedAngle directly as it will be the remainder
  
  // Helper function to create SVG pie segments
  const createSegment = (startAngle: number, endAngle: number, color: string) => {
    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    // Calculate the SVG arc path
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    // Determine if the arc should take the long path (large-arc-flag)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    // Create the SVG path
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  return (
    <div className="p-4">
      <Text size="base" weight="plus" className="text-gray-800 mb-3">
        Tình trạng đơn
      </Text>
      
      <div className="flex items-center justify-around">
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Pending segment */}
            {data.pending > 0 && (
              <path 
                d={createSegment(startAngle, startAngle + pendingAngle, '#D1D5DB')} 
                fill="#D1D5DB" // gray-300
              />
            )}
            
            {/* Approved segment */}
            {data.approved > 0 && (
              <path 
                d={createSegment(startAngle + pendingAngle, startAngle + pendingAngle + approvedAngle, '#4B5563')} 
                fill="#4B5563" // gray-600
              />
            )}
            
            {/* Rejected segment */}
            {data.rejected > 0 && (
              <path 
                d={createSegment(startAngle + pendingAngle + approvedAngle, startAngle + 360, '#1F2937')} 
                fill="#1F2937" // gray-800
              />
            )}
            
            {/* Center circle (optional, for donut chart) */}
            <circle cx={center} cy={center} r={radius / 2} fill="white" />
          </svg>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <Text size="small">Đang xử lý</Text>
              </div>
              <Text size="small" className="ml-4 font-medium">{pendingPercent}%</Text>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-600 rounded-full mr-2"></div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-gray-500" />
                <Text size="small">Đã duyệt</Text>
              </div>
              <Text size="small" className="ml-4 font-medium">{approvedPercent}%</Text>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <XMark className="w-4 h-4 mr-1 text-gray-500" />
                <Text size="small">Từ chối</Text>
              </div>
              <Text size="small" className="ml-4 font-medium">{rejectedPercent}%</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPieChart; 