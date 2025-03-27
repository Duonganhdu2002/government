'use client';

import React, { useEffect } from 'react';
import { ModalComponents, commonStrings } from '@/resources';

/**
 * Custom Modal component
 */
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
    
    // Log modal open state for debugging
    console.log(commonStrings.logs.modal.opened);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
      
      // Log modal closed state for debugging
      console.log(commonStrings.logs.modal.closed);
    };
  }, [isOpen, onClose]);

  // Stop propagation to prevent closing when clicking inside the modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  if (!isOpen) return null;

  return (
    <ModalComponents.Overlay onClick={onClose}>
      <ModalComponents.Container 
        onClick={handleModalContentClick}
        className={className}
      >
        {children}
      </ModalComponents.Container>
    </ModalComponents.Overlay>
  );
};

// Modal parts
Modal.Header = ModalComponents.Header;
Modal.Body = ModalComponents.Body;
Modal.Footer = ModalComponents.Footer;

export default Modal; 