import { Icon as MuiIcon } from '@mui/material';
import { IconOwnProps } from '@mui/material/Icon/Icon';

export function Icon(props: IconOwnProps) {
  return <MuiIcon {...props}>{props.children}</MuiIcon>;
}

export default Icon;
