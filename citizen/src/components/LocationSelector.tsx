"use client";

import { useState, useEffect } from 'react';
import {
  Select,
  Text,
  Button
} from '@medusajs/ui';
import {
  fetchProvinces,
  fetchDistrictsByProvince,
  fetchWardsByDistrict
} from '@/services/locationService';
import { Province, District, Ward, LocationData, LocationSelectorProps } from '@/types';

export const LocationSelector = ({
  initialLocation,
  onChange,
  isDisabled = false,
  className = '',
  showValidation = false
}: LocationSelectorProps) => {
  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  // Selected values
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>(initialLocation?.provinceCode || '');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>(initialLocation?.districtCode || '');
  const [selectedWardCode, setSelectedWardCode] = useState<string>(initialLocation?.wardCode || '');
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);
  
  // Error states
  const [provinceError, setProvinceError] = useState<string>('');
  const [districtError, setDistrictError] = useState<string>('');
  const [wardError, setWardError] = useState<string>('');

  // Helper functions to get selected entity names
  const getSelectedProvinceName = (): string => {
    return provinces.find(p => p.code === selectedProvinceCode)?.name_with_type || '';
  };
  
  const getSelectedDistrictName = (): string => {
    return districts.find(d => d.code === selectedDistrictCode)?.name_with_type || '';
  };
  
  const getSelectedWardName = (): string => {
    return wards.find(w => w.code === selectedWardCode)?.name_with_type || '';
  };
  
  // Construct full address
  const getFullAddress = (): string => {
    const parts = [
      getSelectedWardName(),
      getSelectedDistrictName(),
      getSelectedProvinceName()
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Load provinces on component mount
  useEffect(() => {
    handleFetchProvinces();
  }, []);
  
  // Load districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      handleFetchDistricts(selectedProvinceCode);
      // Clear district and ward when province changes
      if (initialLocation?.provinceCode !== selectedProvinceCode) {
        setSelectedDistrictCode('');
        setSelectedWardCode('');
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode]);
  
  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      handleFetchWards(selectedDistrictCode);
      // Clear ward when district changes
      if (initialLocation?.districtCode !== selectedDistrictCode) {
        setSelectedWardCode('');
      }
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);
  
  // Call onChange when selection changes
  useEffect(() => {
    if (selectedProvinceCode) {
      onChange({
        provinceCode: selectedProvinceCode,
        districtCode: selectedDistrictCode,
        wardCode: selectedWardCode,
        fullAddress: getFullAddress()
      });
    }
  }, [selectedProvinceCode, selectedDistrictCode, selectedWardCode]);

  // Fetch provinces from API
  const handleFetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      setProvinceError('');
      const data = await fetchProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setProvinceError('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingProvinces(false);
    }
  };
  
  // Fetch districts by province code
  const handleFetchDistricts = async (provinceCode: string) => {
    try {
      setLoadingDistricts(true);
      setDistrictError('');
      const data = await fetchDistrictsByProvince(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistrictError('Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };
  
  // Fetch wards by district code
  const handleFetchWards = async (districtCode: string) => {
    try {
      setLoadingWards(true);
      setWardError('');
      const data = await fetchWardsByDistrict(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWardError('Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block text-ui-fg-subtle mb-1">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedProvinceCode || undefined}
          onValueChange={(value: string) => setSelectedProvinceCode(value)}
          disabled={isDisabled || loadingProvinces}
        >
          <Select.Trigger>
            <Select.Value placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"} />
          </Select.Trigger>
          <Select.Content className="z-[100]">
            {loadingProvinces ? (
              <div className="p-4 text-center">
                <div className="animate-pulse flex justify-center mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <Text size="small">Đang tải danh sách tỉnh/thành phố...</Text>
              </div>
            ) : provinces.length === 0 ? (
              <div className="p-4 text-center text-ui-fg-subtle">
                <Text>Không tìm thấy dữ liệu</Text>
                <div className="mt-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleFetchProvinces()}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            ) : (
              provinces.map(province => (
                <Select.Item key={province.code} value={province.code}>
                  {province.name_with_type || province.name}
                </Select.Item>
              ))
            )}
          </Select.Content>
        </Select>
        {provinceError && <Text className="text-red-500 text-sm mt-1">{provinceError}</Text>}
        {showValidation && !selectedProvinceCode && (
          <Text className="text-red-500 text-sm mt-1">Vui lòng chọn tỉnh/thành phố</Text>
        )}
      </div>
      
      {/* Quận/Huyện */}
      {selectedProvinceCode && (
        <div>
          <label className="block text-ui-fg-subtle mb-1">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedDistrictCode || undefined}
            onValueChange={(value: string) => setSelectedDistrictCode(value)}
            disabled={isDisabled || loadingDistricts}
          >
            <Select.Trigger>
              <Select.Value placeholder={loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"} />
            </Select.Trigger>
            <Select.Content className="z-[100]">
              {loadingDistricts ? (
                <div className="p-4 text-center">
                  <div className="animate-pulse flex justify-center mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <Text size="small">Đang tải danh sách quận/huyện...</Text>
                </div>
              ) : districts.length === 0 ? (
                <div className="p-4 text-center text-ui-fg-subtle">
                  <Text>Không tìm thấy dữ liệu</Text>
                  <div className="mt-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleFetchDistricts(selectedProvinceCode)}
                    >
                      Thử lại
                    </Button>
                  </div>
                </div>
              ) : (
                districts.map(district => (
                  <Select.Item key={district.code} value={district.code}>
                    {district.name_with_type || district.name}
                  </Select.Item>
                ))
              )}
            </Select.Content>
          </Select>
          {districtError && <Text className="text-red-500 text-sm mt-1">{districtError}</Text>}
          {showValidation && !selectedDistrictCode && (
            <Text className="text-red-500 text-sm mt-1">Vui lòng chọn quận/huyện</Text>
          )}
        </div>
      )}
      
      {/* Phường/Xã */}
      {selectedDistrictCode && (
        <div>
          <label className="block text-ui-fg-subtle mb-1">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedWardCode || undefined}
            onValueChange={(value: string) => setSelectedWardCode(value)}
            disabled={isDisabled || loadingWards}
          >
            <Select.Trigger>
              <Select.Value placeholder={loadingWards ? "Đang tải..." : "Chọn Phường/Xã"} />
            </Select.Trigger>
            <Select.Content className="z-[100]">
              {loadingWards ? (
                <div className="p-4 text-center">
                  <div className="animate-pulse flex justify-center mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <Text size="small">Đang tải danh sách phường/xã...</Text>
                </div>
              ) : wards.length === 0 ? (
                <div className="p-4 text-center text-ui-fg-subtle">
                  <Text>Không tìm thấy dữ liệu</Text>
                  <div className="mt-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleFetchWards(selectedDistrictCode)}
                    >
                      Thử lại
                    </Button>
                  </div>
                </div>
              ) : (
                wards.map(ward => (
                  <Select.Item key={ward.code} value={ward.code}>
                    {ward.name_with_type || ward.name}
                  </Select.Item>
                ))
              )}
            </Select.Content>
          </Select>
          {wardError && <Text className="text-red-500 text-sm mt-1">{wardError}</Text>}
          {showValidation && !selectedWardCode && (
            <Text className="text-red-500 text-sm mt-1">Vui lòng chọn phường/xã</Text>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 