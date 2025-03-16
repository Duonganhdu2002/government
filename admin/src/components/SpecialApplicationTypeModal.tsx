import React from 'react';
import { Heading, Text, Button, Input, Select, Label } from "@medusajs/ui";
import { SpecialApplicationType, ApplicationType } from '@/types/application';

interface SpecialApplicationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSpecialAppType: SpecialApplicationType | null;
  formData: {
    applicationtypeid: number;
    typename: string;
    description: string;
    processingtimelimit: number;
  };
  applicationTypes: ApplicationType[];
  onChange: (field: string, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  safeToString: (value: any) => string;
}

const SpecialApplicationTypeModal = ({
  isOpen,
  onClose,
  selectedSpecialAppType,
  formData,
  applicationTypes,
  onChange,
  onSubmit,
  safeToString,
}: SpecialApplicationTypeModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay - darker background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-90" 
        onClick={onClose}
        style={{ backdropFilter: 'brightness(0.3)' }}
      ></div>
      
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto z-[1001] max-h-[90vh] overflow-y-auto relative">
        <div className="px-6 pt-6 pb-3">
          <Heading level="h3" className="font-medium">
            {selectedSpecialAppType ? "Chỉnh sửa hồ sơ đặc biệt" : "Thêm hồ sơ đặc biệt mới"}
          </Heading>
          <Text className="text-gray-500 mt-1.5">
            {selectedSpecialAppType
              ? "Chỉnh sửa thông tin hồ sơ đặc biệt"
              : "Điền thông tin để thêm hồ sơ đặc biệt mới"}
          </Text>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="px-6 py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="applicationtypeid" className="text-gray-700 font-medium">
                Thuộc hồ sơ <span className="text-gray-500">*</span>
              </Label>
              <div className="mt-1.5">
                <Select
                  onValueChange={(value) => onChange("applicationtypeid", parseInt(value))}
                  value={safeToString(formData.applicationtypeid)}
                  required
                >
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Chọn hồ sơ" />
                  </Select.Trigger>
                  <Select.Content>
                    {applicationTypes.map((appType) => (
                      <Select.Item 
                        key={appType.applicationtypeid} 
                        value={appType.applicationtypeid.toString()}
                      >
                        {appType.typename}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>

            {/* Hidden fields for typename and description to maintain data structure */}
            <input
              type="hidden"
              id="specialtypename"
              value={formData.typename}
              onChange={(e) => onChange("typename", e.target.value)}
            />
            
            <input
              type="hidden"
              id="specialdescription"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
            />

            <div className="space-y-2">
              <Label htmlFor="processingtimelimit" className="text-gray-700 font-medium">
                Thời hạn xử lý (ngày) <span className="text-gray-500">*</span>
              </Label>
              <Input
                id="processingtimelimit"
                type="number"
                min={1}
                max={365}
                required
                value={formData.processingtimelimit.toString()}
                onChange={(e) => onChange("processingtimelimit", parseInt(e.target.value))}
                className="mt-1.5 w-full"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
                className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="bg-gray-700 text-white hover:bg-gray-800"
              >
                {selectedSpecialAppType ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialApplicationTypeModal; 