import React from 'react';
import { Heading, Text, Button } from "@medusajs/ui";
import { ExclamationCircle } from "@medusajs/icons";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName?: string;
  description: string;
  onConfirm: () => void;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  title,
  itemName,
  description,
  onConfirm,
}: DeleteConfirmationModalProps) => {
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
          <Heading level="h3" className="font-medium">{title}</Heading>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 bg-red-50 p-2 rounded-full">
              <ExclamationCircle className="w-5 h-5 text-red-500" />
            </div>
            <Text className="text-gray-700">
              Bạn có chắc chắn muốn xóa {itemName ? <>"{<strong>{itemName}</strong>}"</> : "mục này"}?
            </Text>
          </div>
          <Text className="text-gray-500 text-sm">
            {description}
          </Text>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 