"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Select,
  ProgressTabs,
  DatePicker
} from '@medusajs/ui';
import { Check, ChevronRight, X, Calendar, MapPin, Plus } from '@medusajs/icons';
import { NewApplicationModalProps } from '@/types/application';
import { useApplicationForm } from '@/hooks/useApplicationForm';
import LocationSelector, { LocationData } from '@/components/location/LocationSelector';

export default function NewApplicationModal({
  isOpen,
  onClose,
  onSuccess
}: NewApplicationModalProps) {
  const router = useRouter();
  
  const {
    // States
    applicationTypes,
    specialApplicationTypes,
    selectedType,
    selectedSpecialType,
    loadingTypes,
    loadingSpecialTypes,
    isSubmitting,
    error,
    formError,
    success,
    images,
    video,
    uploadErrors,
    selectedTypeId,
    selectedSpecialTypeId,
    title,
    description,
    hasAttachments,
    eventDate,
    location,
    activeStep,
    basicInfoStatus,
    detailInfoStatus,
    filesStatus,
    
    // Location states
    provinces,
    districts,
    wards,
    selectedProvinceCode,
    selectedDistrictCode,
    selectedWardCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    
    // Refs
    imageInputRef,
    videoInputRef,
    
    // Actions
    setSelectedTypeId,
    setSelectedSpecialTypeId,
    setTitle,
    setDescription,
    setHasAttachments,
    setEventDate,
    setLocation,
    setSelectedProvinceCode,
    setSelectedDistrictCode,
    setSelectedWardCode,
    handleFetchProvinces,
    handleFetchDistricts,
    handleFetchWards,
    handleFetchApplicationTypes,
    handleImageUpload,
    handleVideoUpload,
    removeImage,
    removeVideo,
    handleStepChange,
    handleSubmit,
    resetForm,
    validateBasicInfo,
    validateDetailInfo
  } = useApplicationForm(onSuccess, onClose);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Nếu modal không mở, không hiển thị gì
  if (!isOpen) return null;

  // UI component
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <Heading level="h2">Nộp hồ sơ mới</Heading>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X />
          </button>
        </div>
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {formError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Hồ sơ đã được nộp thành công! Chúng tôi sẽ xử lý hồ sơ của bạn trong thời gian sớm nhất.
            </div>
          )}

          {/* Progress Tabs */}
          <div className="mb-6">
            <ProgressTabs
              value={activeStep}
              onValueChange={handleStepChange}
            >
              <ProgressTabs.List>
                <ProgressTabs.Trigger
                  value="basic"
                  disabled={isSubmitting}
                >
                  Thông tin cơ bản
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  value="details"
                  disabled={isSubmitting || !validateBasicInfo()}
                >
                  Thông tin chi tiết
                </ProgressTabs.Trigger>
                <ProgressTabs.Trigger
                  value="files"
                  disabled={isSubmitting || !validateBasicInfo() || !validateDetailInfo()}
                >
                  Tài liệu đính kèm
                </ProgressTabs.Trigger>
              </ProgressTabs.List>
            </ProgressTabs>
          </div>
          
          {/* Step 1: Basic Info */}
          {activeStep === 'basic' && (
            <div className="space-y-6">
              {/* Loại hồ sơ */}
              <div className="mb-6">
                <label htmlFor="applicationType" className="block text-ui-fg-subtle mb-1">
                  Loại hồ sơ <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedTypeId.toString() || undefined}
                  onValueChange={(value: string) => setSelectedTypeId(value ? Number(value) : '')}
                  disabled={isSubmitting || loadingTypes}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Chọn loại hồ sơ" />
                  </Select.Trigger>
                  <Select.Content className="z-[1000]">
                    {applicationTypes.map(type => (
                      <Select.Item key={type.applicationtypeid} value={type.applicationtypeid.toString()}>
                        {type.typename}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                
                {selectedType && (
                  <Text size="small" className="text-ui-fg-subtle mt-2">
                    {selectedType.description}
                  </Text>
                )}
                
                {loadingTypes && (
                  <Text size="small" className="text-ui-fg-subtle mt-2">
                    Đang tải danh sách loại hồ sơ...
                  </Text>
                )}
                
                {error && (
                  <div className="mt-2 flex items-center">
                    <Text size="small" className="text-red-500 mr-2">
                      {error}
                    </Text>
                    <Button 
                      size="small" 
                      variant="secondary" 
                      onClick={handleFetchApplicationTypes}
                      disabled={loadingTypes}
                    >
                      Thử lại
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Loại hồ sơ đặc biệt - thêm mới */}
              {specialApplicationTypes.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="specialApplicationType" className="block text-ui-fg-subtle mb-1">
                    Loại hồ sơ đặc biệt <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedSpecialTypeId.toString() || undefined}
                    onValueChange={(value: string) => setSelectedSpecialTypeId(value ? Number(value) : '')}
                    disabled={isSubmitting || loadingSpecialTypes}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Chọn loại hồ sơ đặc biệt" />
                    </Select.Trigger>
                    <Select.Content className="z-[100]">
                      {specialApplicationTypes.map(type => (
                        <Select.Item key={type.specialapplicationtypeid} value={type.specialapplicationtypeid.toString()}>
                          {type.typename}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  
                  {selectedSpecialType && (
                    <div className="mt-2">
                      <Badge className="text-ui-fg-subtle mb-1">
                        Thời hạn xử lý: {selectedSpecialType.processingtimelimit} ngày
                      </Badge>
                    </div>
                  )}
                  
                  {loadingSpecialTypes && (
                    <Text size="small" className="text-ui-fg-subtle mt-2">
                      Đang tải danh sách loại hồ sơ đặc biệt...
                    </Text>
                  )}
                </div>
              )}
              
              {/* Tiêu đề hồ sơ */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-ui-fg-subtle mb-1">
                  Tiêu đề hồ sơ <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề hồ sơ"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              {/* Mô tả chi tiết */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-ui-fg-subtle mb-1">
                  Mô tả chi tiết
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về hồ sơ"
                  className="min-h-[120px]"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <Button 
                  variant="secondary"
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button 
                  type="button"
                  onClick={() => handleStepChange('details')}
                  disabled={!validateBasicInfo() || isSubmitting}
                >
                  Tiếp theo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Thông tin về ngày tháng và địa điểm */}
          {activeStep === 'details' && (
            <div className="space-y-6">
              {/* Ngày tháng */}
              <div className="mb-6">
                <label htmlFor="eventDate" className="flex items-center text-ui-fg-subtle mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Ngày diễn ra <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  isRequired
                  isDisabled={isSubmitting}
                  value={eventDate ? new Date(eventDate) : undefined}
                  onChange={(date) => date && setEventDate(date.toISOString().split('T')[0])}
                />
                <Text size="small" className="text-ui-fg-subtle mt-1">
                  Ngày diễn ra sự kiện hoặc ngày liên quan đến hồ sơ
                </Text>
              </div>

              {/* Địa điểm */}
              <div className="mb-6">
                <label htmlFor="location" className="flex items-center text-ui-fg-subtle mb-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                
                <LocationSelector
                  onChange={(locationData) => {
                    setSelectedProvinceCode(locationData.provinceCode);
                    setSelectedDistrictCode(locationData.districtCode);
                    setSelectedWardCode(locationData.wardCode);
                    setLocation(locationData.fullAddress);
                  }}
                  initialLocation={{
                    provinceCode: selectedProvinceCode,
                    districtCode: selectedDistrictCode,
                    wardCode: selectedWardCode
                  }}
                  isDisabled={isSubmitting}
                  showValidation={!location && activeStep === 'details'} 
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => handleStepChange('basic')}
                  disabled={isSubmitting}
                >
                  Quay lại
                </Button>
                <Button 
                  type="button"
                  onClick={() => handleStepChange('files')}
                  disabled={!validateDetailInfo() || isSubmitting}
                >
                  Tiếp theo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Upload files */}
          {activeStep === 'files' && (
            <div className="space-y-6">
              {/* Phần upload ảnh */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="images" className="block text-ui-fg-subtle">
                    Ảnh
                  </label>
                  {images.length > 0 && (
                    <Text size="small" className="text-ui-fg-subtle">
                      {images.length}/5 ảnh
                    </Text>
                  )}
                </div>
                
                {uploadErrors.images && (
                  <div className="mb-2 text-red-500 text-sm">
                    {uploadErrors.images}
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative border border-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={image.preview} 
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-32 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-1">Thêm ảnh</span>
                    </button>
                  )}
                </div>
                
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Phần upload video */}
              <div className="mb-6">
                <label htmlFor="video" className="block text-ui-fg-subtle mb-2">
                  Video
                </label>
                
                {uploadErrors.video && (
                  <div className="mb-2 text-red-500 text-sm">
                    {uploadErrors.video}
                  </div>
                )}
                
                {video ? (
                  <div className="mb-4">
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <video
                        src={video.preview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <Text size="small" className="text-ui-fg-subtle truncate max-w-xs">
                        {video.file.name}
                      </Text>
                      <button 
                        type="button"
                        onClick={removeVideo}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-20 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500 mt-1">Click để upload video</span>
                  </button>
                )}
                
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                <div className="mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={hasAttachments}
                      onChange={(e) => setHasAttachments(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Tôi sẽ cung cấp thêm giấy tờ, hồ sơ kèm theo khi được yêu cầu
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => handleStepChange('details')}
                  disabled={isSubmitting}
                >
                  Quay lại
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Đang nộp...' : 'Nộp hồ sơ'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 