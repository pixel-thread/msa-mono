import { cn } from '@src/shared/lib/cn';
import React, { useRef, useState, useCallback } from 'react';
import { FlatList, Modal, Text, View, TouchableOpacity } from 'react-native';

export interface ISelectedOption {
  label: string;
  value: string | number;
}

export interface ISelectedOptionsArray {
  options?: ISelectedOption[];
}

export type ISelectedValue = string | number | undefined;

const convertToOptions = <T extends Record<string, any>>(
  data?: T[],
  labelKey?: keyof T,
  valueKey?: keyof T
): ISelectedOption[] => {
  if (!data || !labelKey || !valueKey) return [];
  return data.map((item) => ({
    label: String(item[labelKey]),
    value: item[valueKey],
  }));
};

export interface SelectProps {
  label?: string;
  labelClasses?: string;
  selectClasses?: string;
  options: any[];
  onSelect: (value: string | number) => void;
  selectedValue?: string | number;
  placeholder?: string;
  labelKey: string;
  valueKey: string;
  disabled?: boolean;
}

export const Select = ({
  label,
  labelClasses,
  selectClasses,
  options,
  onSelect,
  selectedValue,
  placeholder = 'Select an option',
  labelKey,
  valueKey,
  disabled = false,
}: SelectProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectButtonRef = useRef<TouchableOpacity>(null);

  const new_options = convertToOptions(options, labelKey, valueKey);

  const selectedLabel = selectedValue
    ? new_options.find((option) => option.value === selectedValue)?.label
    : null;

  const handleSelect = useCallback(
    (value: string | number) => {
      onSelect(value);
      setIsDropdownOpen(false);
    },
    [onSelect]
  );

  const openDropdown = () => {
    if (disabled) return;
    setIsDropdownOpen(true);
  };

  return (
    <View className={cn('flex flex-col gap-1.5')}>
      {label && <Text className={cn('text-base text-primary', labelClasses)}>{label}</Text>}
      <TouchableOpacity
        ref={selectButtonRef}
        className={cn(
          selectClasses,
          'border border-input bg-background px-4 py-2.5',
          disabled && 'opacity-50'
        )}
        onPress={openDropdown}
        disabled={disabled}
        activeOpacity={0.7}>
        <Text className={cn('text-foreground', !selectedLabel && 'text-muted-foreground')}>
          {selectedLabel ?? placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={isDropdownOpen} transparent animationType="fade" onRequestClose={() => setIsDropdownOpen(false)}>
        <TouchableOpacity
          className="flex-1 justify-center bg-black/40 px-4"
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}>
          <View className="mx-auto w-full max-h-64 bg-popover shadow-md">
            <FlatList
              data={new_options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className={cn(
                      'px-4 py-3 border-b border-border last:border-b-0',
                      isSelected && 'bg-accent'
                    )}
                    activeOpacity={0.6}>
                    <Text
                      className={cn(
                        'text-primary text-base',
                        isSelected && 'font-semibold text-accent-foreground'
                      )}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
