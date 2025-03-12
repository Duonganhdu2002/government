"use client";

import React, { useEffect, useState } from 'react';
import { Select, Text, Input } from '@medusajs/ui';
import { apiClient } from '@/lib/api';

interface Agency {
  agencyid: number;
  name: string;
}

interface AgencySelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  required?: boolean;
}

/**
 * Agency selector component that fetches all agencies from the API
 * and allows the user to select one. Falls back to manual input if agencies can't be loaded.
 */
export default function AgencySelector({ value, onChange, className = '', required = false }: AgencySelectorProps) {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);

  // Fetch agencies on component mount
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/agencies');
        
        // Check if response is directly an array
        if (Array.isArray(response)) {
          setAgencies(response);
          
          // If no agency is selected and we have agencies, select the first one
          if (!value && response.length > 0) {
            onChange(response[0].agencyid);
          }
        } 
        // Check if response has data property with array
        else if (response?.data && Array.isArray(response.data)) {
          setAgencies(response.data);
          
          // If no agency is selected and we have agencies, select the first one
          if (!value && response.data.length > 0) {
            onChange(response.data[0].agencyid);
          }
        } 
        // Handle case where response has status and array data
        else if (response?.status === 'success' && Array.isArray(response.data)) {
          setAgencies(response.data);
          
          // If no agency is selected and we have agencies, select the first one
          if (!value && response.data.length > 0) {
            onChange(response.data[0].agencyid);
          }
        } else {
          console.error('Unexpected API response format:', response);
          // Default to manual input if we can't load agencies
          setUseManualInput(true);
          setError('Không thể tải danh sách cơ quan. Vui lòng nhập mã cơ quan thủ công.');
        }
      } catch (err) {
        console.error('Error fetching agencies:', err);
        // Default to manual input if we can't load agencies
        setUseManualInput(true);
        setError('Đã xảy ra lỗi khi tải danh sách cơ quan. Vui lòng nhập mã cơ quan thủ công.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [onChange, value]);

  // Handle manual input for agency ID
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const agencyId = parseInt(e.target.value, 10);
    onChange(isNaN(agencyId) ? 0 : agencyId);
  };

  if (loading) {
    return <Text className="text-gray-500">Đang tải danh sách cơ quan...</Text>;
  }

  if (useManualInput || agencies.length === 0) {
    return (
      <div>
        {error && <Text className="text-orange-500 text-xs mb-2">{error}</Text>}
        <Input
          type="number"
          min="1"
          placeholder="Nhập mã cơ quan"
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
      value={value.toString()} 
      onValueChange={(value) => onChange(parseInt(value, 10))}
    >
      <Select.Trigger className="w-full">
        <Select.Value placeholder="Chọn cơ quan" />
      </Select.Trigger>
      <Select.Content>
        {agencies.map((agency) => (
          <Select.Item key={agency.agencyid} value={agency.agencyid.toString()}>
            {agency.name || `${agency.agencyid}`}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
} 