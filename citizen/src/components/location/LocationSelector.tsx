"use client";

import { useState, useEffect } from 'react';
import {
  Province, 
  District, 
  Ward,
  LocationSelectorProps
} from '@/types/location';
import { LocationDataHandler, LocationFetcher } from '@/utils/tools/locationTools';
import LocationDropdown from './LocationDropdown';
import { locationStrings } from '@/resources';

/**
 * Component cho phép chọn địa chỉ (tỉnh/thành, quận/huyện, phường/xã)
 */
export const LocationSelector = ({
  initialLocation,
  onChange,
  isDisabled = false,
  className = '',
  showValidation = false
}: LocationSelectorProps) => {
  // Location data states
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

  // Find selected entities
  const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
  const selectedDistrict = districts.find(d => d.code === selectedDistrictCode);
  const selectedWard = wards.find(w => w.code === selectedWardCode);
  
  // Load provinces on component mount
  useEffect(() => {
    handleFetchProvinces();
  }, []);
  
  // Load districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      handleFetchDistricts();
      // Reset district and ward selection if province changes from initial
      if (initialLocation?.provinceCode !== selectedProvinceCode) {
        setSelectedDistrictCode('');
        setSelectedWardCode('');
      }
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode('');
      setSelectedWardCode('');
    }
  }, [selectedProvinceCode]);
  
  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      handleFetchWards();
      // Reset ward selection if district changes from initial
      if (initialLocation?.districtCode !== selectedDistrictCode) {
        setSelectedWardCode('');
      }
    } else {
      setWards([]);
      setSelectedWardCode('');
    }
  }, [selectedDistrictCode]);
  
  // Update parent component when selection changes
  useEffect(() => {
    if (selectedProvinceCode) {
      const locationData = LocationDataHandler.createLocationData(
        selectedProvinceCode,
        selectedDistrictCode,
        selectedWardCode,
        selectedProvince,
        selectedDistrict,
        selectedWard
      );
      onChange(locationData);
    }
  }, [selectedProvinceCode, selectedDistrictCode, selectedWardCode, 
      selectedProvince, selectedDistrict, selectedWard]);

  // Fetch provinces handler
  const handleFetchProvinces = () => {
    LocationFetcher.fetchProvinces(
      setLoadingProvinces,
      setProvinceError,
      setProvinces
    );
  };
  
  // Fetch districts handler
  const handleFetchDistricts = () => {
    if (!selectedProvinceCode) return;
    
    LocationFetcher.fetchDistricts(
      selectedProvinceCode,
      setLoadingDistricts,
      setDistrictError,
      setDistricts
    );
  };
  
  // Fetch wards handler
  const handleFetchWards = () => {
    if (!selectedDistrictCode) return;
    
    LocationFetcher.fetchWards(
      selectedDistrictCode,
      setLoadingWards,
      setWardError,
      setWards
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Province dropdown */}
      <LocationDropdown
        label={locationStrings.labels.province}
        value={selectedProvinceCode}
        onChange={setSelectedProvinceCode}
        options={provinces}
        placeholder={locationStrings.placeholders.province}
        loading={loadingProvinces}
        disabled={isDisabled}
        error={provinceError}
        showValidation={showValidation}
        onRetry={handleFetchProvinces}
      />
      
      {/* District dropdown (shown only when province is selected) */}
      {selectedProvinceCode && (
        <LocationDropdown
          label={locationStrings.labels.district}
          value={selectedDistrictCode}
          onChange={setSelectedDistrictCode}
          options={districts}
          placeholder={locationStrings.placeholders.district}
          loading={loadingDistricts}
          disabled={isDisabled}
          error={districtError}
          showValidation={showValidation}
          onRetry={handleFetchDistricts}
        />
      )}
      
      {/* Ward dropdown (shown only when district is selected) */}
      {selectedDistrictCode && (
        <LocationDropdown
          label={locationStrings.labels.ward}
          value={selectedWardCode}
          onChange={setSelectedWardCode}
          options={wards}
          placeholder={locationStrings.placeholders.ward}
          loading={loadingWards}
          disabled={isDisabled}
          error={wardError}
          showValidation={showValidation}
          onRetry={handleFetchWards}
        />
      )}
    </div>
  );
};

export default LocationSelector; 