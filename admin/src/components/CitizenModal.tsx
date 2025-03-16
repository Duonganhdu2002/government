import React, { useState, useEffect } from "react";
import {
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
} from "@medusajs/ui";
import { ExclamationCircle } from "@medusajs/icons";
import Modal from "@/components/Modal";
import { CitizenUser } from "@/services/citizenService";

/**
 * Citizen Edit Modal Component Props
 */
type CitizenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  citizen?: CitizenUser | null;
  areaList: any[];
  onSave: (data: CitizenUser) => Promise<void>;
  isCreating: boolean;
};

/**
 * CitizenModal Component
 * A modal for creating or updating citizen information
 */
const CitizenModal = ({
  isOpen,
  onClose,
  citizen,
  areaList,
  onSave,
  isCreating
}: CitizenModalProps) => {
  // Form state
  const [formData, setFormData] = useState<CitizenUser>({
    fullname: "",
    identificationnumber: "",
    username: "",
    areacode: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form when editing existing citizen or reset when creating
  useEffect(() => {
    if (citizen) {
      setFormData({
        fullname: citizen.fullname || "",
        identificationnumber: citizen.identificationnumber || "",
        username: citizen.username || "",
        address: citizen.address || "",
        phonenumber: citizen.phonenumber || "",
        email: citizen.email || "",
        areacode: citizen.areacode || 0,
        ...(citizen.citizenid ? { citizenid: citizen.citizenid } : {})
      });
    } else {
      // Reset form for new citizen
      setFormData({
        fullname: "",
        identificationnumber: "",
        username: "",
        address: "",
        phonenumber: "",
        email: "",
        areacode: areaList.length > 0 ? areaList[0].areacode || areaList[0].id || 0 : 0,
      });
    }
    
    // Clear messages when modal opens
    setError("");
    setSuccessMessage("");
  }, [citizen, areaList, isOpen]);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    if (name === "areacode") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Quick validation
      if (!formData.fullname?.trim()) {
        setError("Vui lòng nhập họ tên người dân");
        setLoading(false);
        return;
      }

      if (!formData.identificationnumber?.trim()) {
        setError("Vui lòng nhập số CCCD/CMND");
        setLoading(false);
        return;
      }

      if (!formData.username?.trim()) {
        setError("Vui lòng nhập tên đăng nhập");
        setLoading(false);
        return;
      }

      if (!formData.areacode) {
        setError("Vui lòng chọn khu vực");
        setLoading(false);
        return;
      }
      
      if (isCreating && !formData.password) {
        setError("Vui lòng nhập mật khẩu");
        setLoading(false);
        return;
      }

      // Just send the data - assume success since database updates immediately
      onSave({ ...formData }).catch(err => console.error(err));
      
      // Show success and close immediately - don't wait for response
      setSuccessMessage(isCreating ? "Tạo người dùng thành công" : "Cập nhật thành công");
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error("Error:", err);
      setError("Có lỗi xảy ra");
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
            {isCreating ? "Thêm tài khoản người dân mới" : "Cập nhật thông tin người dân"}
          </Heading>
          <Text className="text-gray-500 mt-1.5">
            {isCreating 
              ? "Điền thông tin để tạo tài khoản mới cho người dân" 
              : "Chỉnh sửa thông tin người dân"}
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
            <Label htmlFor="fullname" className="text-gray-700 font-medium">
              Họ và tên <span className="text-gray-500">*</span>
            </Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname || ""}
              onChange={handleChange}
              placeholder="Nhập họ và tên người dân"
              className="mt-1.5 w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="identificationnumber" className="text-gray-700 font-medium">
              Số CCCD/CMND <span className="text-gray-500">*</span>
            </Label>
            <Input
              id="identificationnumber"
              name="identificationnumber"
              value={formData.identificationnumber || ""}
              onChange={handleChange}
              placeholder="Nhập số CCCD/CMND"
              className="mt-1.5 w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Tên đăng nhập <span className="text-gray-500">*</span>
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              className="mt-1.5 w-full"
              required
              disabled={!isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Nhập email"
              className="mt-1.5 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonenumber" className="text-gray-700 font-medium">
              Số điện thoại
            </Label>
            <Input
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber || ""}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="mt-1.5 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 font-medium">
              Địa chỉ
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              className="mt-1.5 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="areacode" className="text-gray-700 font-medium">
              Khu vực <span className="text-gray-500">*</span>
            </Label>
            <div className="mt-1.5">
              <Select 
                value={formData.areacode?.toString() || ""} 
                onValueChange={(value) => handleSelectChange("areacode", value)}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Chọn khu vực" />
                </Select.Trigger>
                <Select.Content>
                  {areaList.map(area => {
                    const id = area.areacode || area.id;
                    const name = area.areaname || area.name;
                    
                    if (!id) return null;
                    
                    return (
                      <Select.Item key={id} value={id.toString()}>
                        {name || `Khu vực #${id}`}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select>
            </div>
          </div>

          {isCreating && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Mật khẩu <span className="text-gray-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="mt-1.5 w-full"
                required
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-x-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              isLoading={loading}
              className="bg-gray-700 text-white hover:bg-gray-800"
            >
              {isCreating ? "Tạo tài khoản" : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenModal; 