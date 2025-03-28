import { FormItem } from '@caretaker/caretaker-types';

export function validateFormField<T extends Record<string, unknown>>(
  item: FormItem<T>,
  value: unknown,
  formState: T
): string {
  if (!value && item.required) {
    return `${item.label} is required`;
  }

  // Run custom validation if provided
  if (item.validate) {
    const customError = item.validate(value, formState);
    if (customError) {
      return customError;
    }
  }

  return '';
} 