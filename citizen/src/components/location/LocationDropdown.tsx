"use client";

import { Select } from '@medusajs/ui';
import { DropdownProps } from '@/types/location';
import { 
  locationStrings,
  FormLabels, 
  LoadingIndicators, 
  EmptyStates, 
  ValidationMessages 
} from '@/resources';

/**
 * Component hiển thị dropdown chọn đơn vị hành chính (tỉnh/huyện/xã)
 */
const LocationDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading,
  disabled = false,
  error,
  showValidation = false,
  onRetry
}: DropdownProps) => (
  <div>
    <FormLabels.Required text={label} />
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled || loading}
    >
      <Select.Trigger>
        <Select.Value placeholder={loading ? locationStrings.loading.dropdown : placeholder} />
      </Select.Trigger>
      <Select.Content className="z-[100]">
        {loading ? (
          <LoadingIndicators.WithText text={locationStrings.loading.data} />
        ) : options.length === 0 ? (
          <EmptyStates.NoDataWithRetry 
            text={locationStrings.errors.noData} 
            retryText={locationStrings.actions.retry}
            onRetry={onRetry} 
          />
        ) : (
          options.map(option => (
            <Select.Item key={option.code} value={option.code}>
              {option.name_with_type || option.name}
            </Select.Item>
          ))
        )}
      </Select.Content>
    </Select>
    {error && <ValidationMessages.ErrorText message={error} />}
    {showValidation && !value && (
      <ValidationMessages.RequiredField fieldLabel={label} />
    )}
  </div>
);

export default LocationDropdown; 