import { ButtonProps } from '../buttons/button-props.type';

export enum AlertType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface AlertAction {
  text: string;
  buttonConfig: ButtonProps;
}

export interface Alert {
  message: string;
  type: AlertType;
  clearAfter?: number;
  onClose?: () => void;
  action?: AlertAction;
}
