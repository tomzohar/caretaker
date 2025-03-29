import {
  appStore,
  InviteApiService,
  SessionService,
  userStore,
} from '@caretaker/caretaker-data';
import { AlertType } from '@caretaker/caretaker-types';
import { IconButton, Menu, MenuItem } from '@caretaker/caretaker-ui';
import { Invite, InviteFormData } from '@caretaker/invite';
import { AccountCircle, Logout } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import Person2Icon from '@mui/icons-material/Person2';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSidebarConfig } from './sidebar-config';
import styles from './topnav.module.scss';

export function Topnav() {
  const navigate = useNavigate();

  const onLogout = () => {
    SessionService.logout();
    userStore.set(null);
    navigate('/login');
  };

  const handleInviteSubmit = async (data: InviteFormData) => {
    try {
      await InviteApiService.inviteToAccount({ emails: data.emails });
      appStore.closeModal();
      appStore.setAlert({
        message: `Invitation${
          data.emails.length > 1 ? 's' : ''
        } sent to ${data.emails.join(', ')}`,
        type: 'success' as AlertType,
      });
    } catch (err) {
      console.error('Failed to send invitations:', err);
      appStore.setAlert({
        message: 'Failed to send invitations. Please try again.',
        type: AlertType.ERROR,
      });
    }
  };

  const openInviteDialog = () => {
    appStore.openModal({
      title: 'Invite User',
      content: (
        <Invite
          onSubmit={handleInviteSubmit}
          onCancel={() => appStore.closeModal()}
        />
      ),
      disableCloseOnClickOutside: true,
    });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      text: 'Profile',
      icon: Person2Icon,
      action: () => {
        navigate('/profile');
      },
    },
    {
      id: 'logout',
      text: 'Logout',
      icon: Logout,
      action: onLogout,
    },
  ];

  const toggleSidebar = () => {
    appStore.setSidebarContent(
      getSidebarConfig(openInviteDialog, () => navigate('/patients'))
    );
    appStore.toggleSidebar();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar className={styles.topnav}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Caretaker
          </Typography>
          <Menu id={styles.topnavMenu} items={menuItems}>
            <AccountCircle htmlColor={'white'}></AccountCircle>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
