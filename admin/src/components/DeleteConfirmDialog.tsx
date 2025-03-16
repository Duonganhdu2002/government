import React, { useState, useEffect } from "react";
import { Heading, Text, Button } from "@medusajs/ui";
import { ExclamationCircle } from "@medusajs/icons";

/**
 * DeleteConfirmDialog Props
 */
type DeleteConfirmProps = {
  isOpen: boolean;
  onClose: () => void;
  citizenName: string;
  onConfirm: () => Promise<void>;
};

/**
 * DeleteConfirmDialog Component
 * A modal dialog to confirm citizen account deletion
 */
const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  citizenName,
  onConfirm
}: DeleteConfirmProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        await onConfirm();
        setSuccessMessage("Xóa tài khoản thành công");
        
        // Close after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (deleteError: any) {
        console.error("Error during delete operation:", deleteError);
        
        // Check for abort error
        if (deleteError.name === 'AbortError' || deleteError.message?.includes('aborted')) {
          // If it's an abort error but the operation might have succeeded
          setSuccessMessage("Đã xử lý yêu cầu xóa");
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        }
        
        throw deleteError; // Re-throw if it's not an abort error
      }
    } catch (err: any) {
      console.error("Error deleting citizen:", err);
      setError(err.message || "Có lỗi xảy ra khi xóa người dân");
      
      // If the error contains "signal is aborted" but data might be saved
      if (err.message?.includes('signal is aborted') || err.message?.includes('aborted without reason')) {
        setSuccessMessage("Yêu cầu xóa có thể đã được xử lý. Vui lòng kiểm tra lại.");
      }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto z-[1001] relative">
        <div className="px-6 pt-6 pb-3">
          <Heading level="h3" className="font-medium">
            Xác nhận xóa tài khoản người dân
          </Heading>
        </div>
        
        <div className="px-6 py-4">
          {error && (
            <div className="p-3 mb-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-md flex items-center">
              <ExclamationCircle className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          <Text className="text-gray-700">
            Bạn có chắc chắn muốn xóa tài khoản người dân <strong>{citizenName}</strong>? 
            Hành động này không thể hoàn tác.
          </Text>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-x-3">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              disabled={loading}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleDelete} 
              isLoading={loading}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog; 