'use client';

import React, { useEffect } from 'react';
import { ModalProps, ModalPartProps } from '@/types';

// Custom Modal component
const Modal = ({ isOpen, onClose, children, className = "" }: ModalProps) => {
  // Add keydown listener for Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Stop propagation to prevent closing when clicking inside the modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 scrollbar-hide"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col scrollbar-hide ${className}`}
        onClick={handleModalContentClick}
        style={{ 
          maxWidth: 'calc(100vw - 48px)',
          height: 'calc(100vh - 96px)',
          maxHeight: 'calc(100vh - 96px)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Modal parts
Modal.Header = ({ children, className = "" }: ModalPartProps) => (
  <div className={`px-6 py-4 border-b border-gray-200 rounded-t-xl ${className}`}>
    {children}
  </div>
);

Modal.Body = ({ children, className = "" }: ModalPartProps) => (
  <div className={`flex-grow overflow-auto scrollbar-hide ${className}`}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = "" }: ModalPartProps) => (
  <div className={`px-6 py-4 border-t border-gray-200 rounded-b-xl ${className}`}>
    {children}
  </div>
);

export default Modal; 