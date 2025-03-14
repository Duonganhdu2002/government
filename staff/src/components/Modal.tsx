'use client';

import React, { useEffect } from 'react';

// Custom Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

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
      className="fixed inset-0 flex items-center justify-center p-6 scrollbar-hide z-[60]"
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col scrollbar-hide z-[70] relative ${className}`}
        onClick={handleModalContentClick}
        style={{ 
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 96px)',
          height: 'auto',
          pointerEvents: 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Modal parts
Modal.Header = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 rounded-t-xl ${className}`}>
    {children}
  </div>
);

Modal.Body = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex-grow overflow-auto scrollbar-hide ${className}`} style={{ minHeight: "200px" }}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-200 rounded-b-xl ${className}`}>
    {children}
  </div>
);

export default Modal; 