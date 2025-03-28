import { FormItem } from '@caretaker/caretaker-types';

export function validateFormField<T extends Record<string, unknown>>(
  item: FormItem<keyof T>,
  value: unknown
): string {
  if (!value && item.required) {
    return `${item.label} is required`;
  }

  // Run custom validation if provided
  if (item.validate) {
    const customError = item.validate(value);
    if (customError) {
      return customError;
    }
  }

  return '';
} 