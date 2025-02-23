import { IconButton as MuiIconButton } from '@mui/material';
import { IconButtonOwnProps } from '@mui/material/IconButton/IconButton';
import { ComponentProps } from 'react';
import styles from './icon-button.module.scss';

export type IconButtonProps = IconButtonOwnProps & ComponentProps<'button'>;

export function IconButton(props: IconButtonProps) {
  return <MuiIconButton {...props}>{props.children}</MuiIconButton>;
}

export default IconButton;
