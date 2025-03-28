import { SvgIconComponent } from '@mui/icons-material';

export interface SidebarItem {
  id: string;
  text: string;
  icon?: SvgIconComponent;
  action?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

export type SidebarContent = SidebarSection[];
