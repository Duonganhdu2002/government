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
import { StaffMember } from "@/services/staffService";

/**
 * Staff Edit Modal Component Props
 */
type StaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffMember | null;
  agencyList: any[];
  onSave: (data: StaffMember) => Promise<void>;
  isCreating: boolean;
};

/**
 * StaffModal Component
 * A modal for creating or updating staff information
 */
const StaffModal = ({
  isOpen,
  onClose,
  staff,
  agencyList,
  onSave,
  isCreating
}: StaffModalProps) => {
  // Form state
  const [formData, setFormData] = useState<StaffMember>({
    fullname: "",
    role: "staff",
    agencyid: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form when editing existing staff or reset when creating
  useEffect(() => {
    if (staff) {
      setFormData({
        fullname: staff.fullname || "",
        role: staff.role || "staff",
        agencyid: staff.agencyid || 0,
        // For existing staff, include ID
        ...(staff.staffid ? { staffid: staff.staffid } : {})
      });
    } else {
      // Reset form for new staff
      setFormData({
        fullname: "",
        role: "staff",
        agencyid: agencyList.length > 0 ? agencyList[0].agencyid || agencyList[0].id || 0 : 0,
      });
    }
    
    // Clear messages when modal opens
    setError("");
    setSuccessMessage("");
  }, [staff, agencyList, isOpen]);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    if (name === "agencyid") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const roleOptions = [
    { value: "staff", label: "Cán bộ" },
    { value: "admin", label: "Quản trị viên" }
  ];

  // Form submission handler
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // Validate form
      if (!formData.fullname?.trim()) {
        setError("Vui lòng nhập họ tên cán bộ");
        setLoading(false);
        return;
      }

      if (!formData.agencyid) {
        setError("Vui lòng chọn cơ quan");
        setLoading(false);
        return;
      }
      
      // If creating new staff, validate password
      if (isCreating && !formData.password) {
        setError("Vui lòng nhập mật khẩu");
        setLoading(false);
        return;
      }

      // Prepare data for API - ensure all required fields have values
      const submitData: StaffMember = {
        ...formData,
        // Convert password to passwordhash for API
        ...(formData.password && { passwordhash: formData.password }),
      };

      // Remove password from the submission data as server expects passwordhash
      if (!isCreating) {
        delete submitData.password;
        // If updating and not changing passwordhash, don't send it
        if (!formData.password) {
          delete submitData.passwordhash;
        }
      }

      await onSave(submitData);
      setSuccessMessage(isCreating ? "Tạo tài khoản thành công" : "Cập nhật thành công");
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error("Error saving staff:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu thông tin cán bộ");
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
            {isCreating ? "Thêm tài khoản cán bộ mới" : "Cập nhật thông tin cán bộ"}
          </Heading>
          <Text className="text-gray-500 mt-1.5">
            {isCreating 
              ? "Điền thông tin để tạo tài khoản mới cho cán bộ" 
              : "Chỉnh sửa thông tin cán bộ"}
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
              placeholder="Nhập họ và tên cán bộ"
              className="mt-1.5 w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agencyid" className="text-gray-700 font-medium">
              Cơ quan <span className="text-gray-500">*</span>
            </Label>
            <div className="mt-1.5">
              <Select 
                value={formData.agencyid?.toString() || ""} 
                onValueChange={(value) => handleSelectChange("agencyid", value)}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Chọn cơ quan" />
                </Select.Trigger>
                <Select.Content>
                  {agencyList.map(agency => {
                    const id = agency.agencyid || agency.id;
                    const name = agency.agencyname || agency.name;
                    
                    if (!id) return null;
                    
                    return (
                      <Select.Item key={id} value={id.toString()}>
                        {name || `Cơ quan #${id}`}
                      </Select.Item>
                    );
                  })}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 font-medium">
              Vai trò <span className="text-gray-500">*</span>
            </Label>
            <div className="mt-1.5">
              <Select 
                value={formData.role || "staff"} 
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <Select.Trigger className="w-full">
                  <Select.Value placeholder="Chọn vai trò" />
                </Select.Trigger>
                <Select.Content>
                  {roleOptions.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              {isCreating ? (
                <>Mật khẩu <span className="text-gray-500">*</span></>
              ) : (
                "Mật khẩu mới (để trống nếu không thay đổi)"
              )}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder={isCreating ? "Nhập mật khẩu" : "Nhập mật khẩu mới (nếu muốn thay đổi)"}
              className="mt-1.5 w-full"
              required={isCreating}
            />
          </div>
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

export default StaffModal; 