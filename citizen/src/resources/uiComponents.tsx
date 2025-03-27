"use client";

import React from 'react';
import { Text, Button } from '@medusajs/ui';

/**
 * src/resources/uiComponents.tsx
 * 
 * Tập hợp các component UI tái sử dụng được trong toàn bộ ứng dụng
 */

export const LoadingIndicators = {
  /**
   * Hiệu ứng đang tải dạng đơn giản
   */
  SimplePulse: () => (
    <div className="animate-pulse flex justify-center mb-2">
      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    </div>
  ),
  
  /**
   * Thông báo đang tải với văn bản
   */
  WithText: ({ text }: { text: string }) => (
    <div className="p-4 text-center">
      <LoadingIndicators.SimplePulse />
      <Text size="small">{text}</Text>
    </div>
  )
};

export const EmptyStates = {
  /**
   * Trạng thái không có dữ liệu với nút thử lại
   */
  NoDataWithRetry: ({ 
    text, 
    retryText, 
    onRetry 
  }: { 
    text: string; 
    retryText: string; 
    onRetry?: () => void 
  }) => (
    <div className="p-4 text-center text-ui-fg-subtle">
      <Text>{text}</Text>
      {onRetry && (
        <div className="mt-2">
          <Button
            size="small"
            variant="secondary"
            onClick={onRetry}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  )
};

export const ValidationMessages = {
  /**
   * Hiển thị thông báo lỗi
   */
  ErrorText: ({ message }: { message: string }) => (
    <Text className="text-red-500 text-sm mt-1">{message}</Text>
  ),
  
  /**
   * Hiển thị thông báo trường bắt buộc
   */
  RequiredField: ({ fieldLabel }: { fieldLabel: string }) => (
    <Text className="text-red-500 text-sm mt-1">Vui lòng chọn {fieldLabel.toLowerCase()}</Text>
  )
};

export const FormLabels = {
  /**
   * Nhãn bắt buộc
   */
  Required: ({ text }: { text: string }) => (
    <label className="block text-ui-fg-subtle mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  )
}; 