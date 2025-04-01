/**
 * Types related to UI components
 */

import React from 'react';

/**
 * Props for icon components
 */
export interface IconProps {
  className?: string;
}

/**
 * Props for card components
 */
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for card part components (Header, Content, Footer)
 */
export interface CardPartProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for spinner component
 */
export interface SpinnerProps {
  className?: string;
}

/**
 * Props for modal component
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for modal part components (Header, Body, Footer)
 */
export interface ModalPartProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for location selector component
 */
export interface LocationSelectorProps {
  /** Initial location values (optional) */
  initialLocation?: Partial<import('./location').LocationData>;
  /** Called when any location value changes */
  onChange: (location: import('./location').LocationData) => void;
  /** Whether the selector is disabled */
  isDisabled?: boolean;
  /** Additional class names for the container */
  className?: string;
  /** Whether to show validation errors */
  showValidation?: boolean;
} 