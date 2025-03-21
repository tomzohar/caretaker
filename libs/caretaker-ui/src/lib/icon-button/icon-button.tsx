import { IconButton as MuiIconButton } from '@mui/material';
import { IconButtonOwnProps } from '@mui/material/IconButton/IconButton';
import { ComponentProps } from 'react';

export type IconButtonProps = IconButtonOwnProps & ComponentProps<'button'>;

export function IconButton(props: IconButtonProps) {
  return <MuiIconButton {...props}>{props.children}</MuiIconButton>;
}

export default IconButton;
