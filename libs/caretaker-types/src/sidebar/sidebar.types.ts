import { SvgIconComponent } from '@mui/icons-material';

export interface SidebarItem {
  id: string;
  text: string;
  icon?: SvgIconComponent;
  action?: () => void;
}
