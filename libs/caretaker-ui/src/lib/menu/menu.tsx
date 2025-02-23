import {
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  MenuItemProps,
  MenuProps as MuiMenuProps,
} from '@mui/material';
import { Menu as MenuIcon, SvgIconComponent } from '@mui/icons-material';
import React, { MouseEventHandler, useState } from 'react';
import IconButton from '../icon-button/icon-button';
import styles from './menu.module.scss';

export interface MenuItem {
  id: string;
  text: string;
  icon?: SvgIconComponent;
  action?: () => void;
  props?: MenuItemProps;
}

export interface MenuProps {
  items: MenuItem[];
}

export function Menu(props: Omit<MuiMenuProps, 'open'> & MenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen: MouseEventHandler = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = (item: MenuItem) => {
    setAnchorEl(null);
    if (item.action) {
      item.action();
    }
  };

  const renderMenuButton = () => {
    return props.children || <MenuIcon />;
  };

  const renderMenuItemContent = (item: MenuItem) => {
    const renderIcon = () =>
      item.icon ? (
        <div className={styles.menuItemIcon}>
          {item.icon ? <item.icon fontSize={'small'} /> : null}
        </div>
      ) : null;

    const renderText = () => (
      <div className={styles.menuItemText}>{item.text}</div>
    );

    return (
      <div className={styles.menuItem}>
        {renderIcon()}
        {renderText()}
      </div>
    );
  };

  return (
    <>
      <IconButton color={'inherit'} onClick={handleOpen}>
        {renderMenuButton()}
      </IconButton>
      <MuiMenu {...props} anchorEl={anchorEl} open={open} onClose={handleClose}>
        {props.items.map((item) => {
          return (
            <MuiMenuItem key={item.id} onClick={() => handleClose(item)}>
              {renderMenuItemContent(item)}
            </MuiMenuItem>
          );
        })}
      </MuiMenu>
    </>
  );
}

export default Menu;
