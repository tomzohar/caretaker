import { AppStore } from '@caretaker/caretaker-data';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { SidebarItem, SidebarSection } from '@caretaker/caretaker-types';
import { observer } from 'mobx-react-lite';
import styles from './sidebar.module.scss';
import clsx from 'clsx';

export interface SidebarProps {
  appState: AppStore;
}

export const Sidebar = observer(({ appState }: SidebarProps) => {
  const closeSidebar = () => appState.closeSidebar();

  const renderListItemIcon = (item: SidebarItem) => {
    return item.icon ? (
      <div className={styles.sidebarItemIcon}>
        <item.icon fontSize={'medium'} />
      </div>
    ) : null;
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.action) {
      item.action();
    }

    closeSidebar();
  };

  const renderSidebarItem = (item: SidebarItem) => {
    return (
      <ListItem key={item.id} className={clsx(styles.sidebarItem, 'MuiListItem-root')}>
        <ListItemButton
          className={clsx(styles.sidebarItemButton, 'MuiListItemButton-root')}
          onClick={() => handleItemClick(item)}
        >
          {renderListItemIcon(item)}
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderSidebarSection = (section: SidebarSection, isLast: boolean) => {
    return (
      <Box key={section.id} className={clsx(styles.sidebarSection, 'MuiBox-root')}>
        {section.title && (
          <Typography variant="subtitle2" className={clsx(styles.sectionTitle, 'MuiTypography-root')}>
            {section.title}
          </Typography>
        )}
        <List>
          {section.items.map((item) => renderSidebarItem(item))}
        </List>
        {!isLast && section.title && <Divider />}
      </Box>
    );
  };

  const renderSidebarContent = () => {
    return (
      <Box className={clsx(styles.sidebarContent, 'MuiBox-root')}>
        {appState.sidebarContent.map((section, index) => 
          renderSidebarSection(section, index === appState.sidebarContent.length - 1)
        )}
      </Box>
    );
  };

  return (
    <Drawer
      open={appState.sidebarOpen}
      onClose={() => closeSidebar()}
      anchor={'left'}
    >
      <Box component={'div'} sx={{ width: 250, height: '100%' }}>
        {renderSidebarContent()}
      </Box>
    </Drawer>
  );
});
