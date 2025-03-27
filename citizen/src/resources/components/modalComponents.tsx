"use client";

import React from 'react';
import commonStrings from '../strings/commonStrings';

/**
 * src/resources/components/modalComponents.tsx
 * 
 * Tập hợp các component UI cho Modal
 */

export const ModalComponents = {
  /**
   * Overlay cho Modal với hiệu ứng mờ
   */
  Overlay: ({ 
    onClick, 
    children, 
    className = ""
  }: { 
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6 scrollbar-hide ${className}`}
      onClick={onClick}
      aria-label={commonStrings.a11y.modal.overlay}
    >
      {children}
    </div>
  ),
  
  /**
   * Container cho nội dung Modal
   */
  Container: ({ 
    onClick, 
    children, 
    className = ""
  }: { 
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div 
      className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col scrollbar-hide ${className}`}
      onClick={onClick}
      style={{ 
        maxWidth: 'calc(100vw - 48px)',
        height: 'calc(100vh - 96px)',
        maxHeight: 'calc(100vh - 96px)'
      }}
    >
      {children}
    </div>
  ),
  
  /**
   * Header của Modal
   */
  Header: ({ 
    children, 
    className = ""
  }: { 
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`px-6 py-4 border-b border-gray-200 rounded-t-xl ${className}`}>
      {children}
    </div>
  ),
  
  /**
   * Body của Modal - phần chính chứa nội dung
   */
  Body: ({ 
    children, 
    className = ""
  }: { 
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`flex-grow overflow-auto scrollbar-hide ${className}`}>
      {children}
    </div>
  ),
  
  /**
   * Footer của Modal
   */
  Footer: ({ 
    children, 
    className = ""
  }: { 
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`px-6 py-4 border-t border-gray-200 rounded-b-xl ${className}`}>
      {children}
    </div>
  )
}; 