import { AppStore } from '@caretaker/caretaker-data';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { SidebarItem } from '@caretaker/caretaker-types';
import { observer } from 'mobx-react-lite';
import styles from './sidebar.module.scss';

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
      <ListItem key={item.id} className={styles.sidebarItem}>
        <ListItemButton
          className={styles.sidebarItemButton}
          onClick={() => handleItemClick(item)}
        >
          {renderListItemIcon(item)}
          <ListItemText primary={item.text} />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderSidebarItems = () => {
    return (
      <List>
        {appState.sidebarItems.map((item) => {
          return renderSidebarItem(item);
        })}
      </List>
    );
  };

  return (
    <Drawer
      open={appState.sidebarOpen}
      onClose={() => closeSidebar()}
      anchor={'left'}
    >
      <Box component={'div'} sx={{ width: 250, height: '100%' }}>
        {renderSidebarItems()}
      </Box>
    </Drawer>
  );
});
