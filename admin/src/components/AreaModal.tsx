import React, { useState, useEffect } from 'react';
import { Heading, Text, Button, Input, Label } from "@medusajs/ui";
import { ExclamationCircle } from "@medusajs/icons";

// Assumed area type
export interface Area {
  id?: number;
  areacode?: number;
  name: string;
  level: 'province';
  parentId?: number | null;
}

interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (area: Area) => Promise<void>;
  selectedArea: Area | null;
  parentAreas: Area[];
  areaLevel: 'province';
}

const AreaModal = ({
  isOpen,
  onClose,
  onSave,
  selectedArea,
  parentAreas,
  areaLevel,
}: AreaModalProps) => {
  const [formData, setFormData] = useState<Area>({
    name: '',
    level: areaLevel,
    parentId: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (selectedArea) {
      setFormData({
        ...selectedArea,
      });
    } else {
      // Reset form for new area
      setFormData({
        name: '',
        level: areaLevel,
        parentId: null
      });
    }
    
    // Clear messages
    setError("");
    setSuccessMessage("");
  }, [selectedArea, areaLevel, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
  };

  const getAreaLevelName = () => {
    return 'Tỉnh/Thành phố';
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Validation
      if (!formData.name?.trim()) {
        setError(`Vui lòng nhập tên ${getAreaLevelName().toLowerCase()}`);
        setLoading(false);
        return;
      }

      if (!formData.areacode) {
        setError(`Vui lòng nhập mã khu vực`);
        setLoading(false);
        return;
      }

      await onSave(formData);
      
      setSuccessMessage(selectedArea ? "Cập nhật thành công" : "Tạo mới thành công");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

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
            {selectedArea ? `Chỉnh sửa ${getAreaLevelName().toLowerCase()}` : `Thêm ${getAreaLevelName().toLowerCase()} mới`}
          </Heading>
          <Text className="text-gray-500 mt-1.5">
            {selectedArea
              ? `Chỉnh sửa thông tin ${getAreaLevelName().toLowerCase()}`
              : `Điền thông tin để thêm ${getAreaLevelName().toLowerCase()} mới`}
          </Text>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {error && (
            <div className="p-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-md flex items-center">
              <ExclamationCircle className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="areacode" className="text-gray-700 font-medium">
              Mã khu vực <span className="text-gray-500">*</span>
            </Label>
            <Input
              id="areacode"
              name="areacode"
              type="number"
              value={formData.areacode || ""}
              onChange={handleNumberChange}
              placeholder="Nhập mã khu vực (số nguyên)"
              className="mt-1.5 w-full"
              required
              disabled={!!selectedArea}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Tên {getAreaLevelName().toLowerCase()} <span className="text-gray-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder={`Nhập tên ${getAreaLevelName().toLowerCase()}`}
              className="mt-1.5 w-full"
              required
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
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gray-700 text-white hover:bg-gray-800"
            >
              {loading ? "Đang xử lý..." : (selectedArea ? "Cập nhật" : "Thêm mới")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaModal; 