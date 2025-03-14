import { ButtonProps } from '@mui/material';

export enum FormItemType {
  TEXT = 'text',
  PASSWORD = 'password',
  EMAIL = 'email',
  NUMBER = 'number',
}

export interface FormItem<T> {
  id: T;
  type: FormItemType;
  label: string;
}

export interface Form<T extends Record<string, any>> {
  items: FormItem<keyof T>[];
  onSubmit: (formValue: T) => void;
  buttonsConfig: (ButtonProps & { text: string })[];
}
