import { ButtonProps } from '@mui/material';

export enum FormItemType {
  TEXT = 'text',
  PASSWORD = 'password',
  EMAIL = 'email',
  NUMBER = 'number',
}

export interface FormItem<FormType> {
  id: keyof FormType;
  type: FormItemType;
  label: string;
  required?: boolean;
  validate?: (value: unknown, formState: FormType) => string;
  onChange?: (value: unknown, formState: FormType) => void;
}

export interface Form<T extends Record<string, unknown>> {
  items: FormItem<T>[];
  onSubmit: (formValue: T) => void;
  buttonsConfig: (ButtonProps & { text: string })[];
}
