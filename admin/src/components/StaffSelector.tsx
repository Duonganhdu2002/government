"use client";

import React, { useEffect, useState } from 'react';
import { Select, Text, Input } from '@medusajs/ui';
import { fetchStaffList } from '@/services/applicationService';

interface Staff {
  staffid: number;
  fullname: string;
  agencyid: number;
  role: string;
}

interface StaffSelectorProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
  includeAllOption?: boolean;
}

/**
 * Staff selector component that fetches all staff members from the API
 * and allows the user to select one. Falls back to manual input if staff list can't be loaded.
 */
export default function StaffSelector({ 
  value, 
  onChange, 
  className = '', 
  required = false,
  placeholder = "Chọn nhân viên",
  includeAllOption = false
}: StaffSelectorProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);

  // Fetch staff members on component mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await fetchStaffList();
        
        // Ensure we have an array of staff members
        if (Array.isArray(data)) {
          setStaffList(data);
          
          // If no staff is selected and we have staff, select the first one
          if ((!value || value === null) && data.length > 0 && !includeAllOption) {
            onChange(data[0].staffid);
          }
        } else {
          console.error('Unexpected API response format:', data);
          setUseManualInput(true);
          setError('Không thể tải danh sách nhân viên. Vui lòng nhập mã nhân viên thủ công.');
          setStaffList([]);
        }
      } catch (err) {
        console.error('Error fetching staff:', err);
        setUseManualInput(true);
        setError('Đã xảy ra lỗi khi tải danh sách nhân viên. Vui lòng nhập mã nhân viên thủ công.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [onChange, value, includeAllOption]);

  // Handle manual input for staff ID
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const staffId = parseInt(e.target.value, 10);
    onChange(isNaN(staffId) ? null : staffId);
  };

  if (loading) {
    return <Text className="text-gray-500">Đang tải danh sách nhân viên...</Text>;
  }

  if (useManualInput || staffList.length === 0) {
    return (
      <div>
        {error && <Text className="text-orange-500 text-xs mb-2">{error}</Text>}
        <Input
          type="number"
          min="1"
          placeholder="Nhập mã nhân viên"
          value={value || ''}
          onChange={handleManualInput}
          required={required}
          className="w-full"
          style={{ borderColor: '#e5e7eb' }}
        />
      </div>
    );
  }

  return (
    <Select 
      value={value?.toString() || ''} 
      onValueChange={(value) => {
        if (value === 'all') {
          onChange(null);
        } else {
          onChange(parseInt(value, 10));
        }
      }}
    >
      <Select.Trigger className={`w-full ${className}`}>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Content className='z-50'>
        {includeAllOption && (
          <Select.Item key="all" value="all">
            Tất cả nhân viên
          </Select.Item>
        )}
        {staffList.map((staff) => (
          <Select.Item key={staff.staffid} value={staff.staffid.toString()}>
            {staff.fullname || `Nhân viên #${staff.staffid}`}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
} 