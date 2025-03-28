export interface ModalAction {
  text: string;
  variant?: 'text' | 'outlined' | 'contained';
  onClick: () => void;
}

export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  actions?: ModalAction[];
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} 