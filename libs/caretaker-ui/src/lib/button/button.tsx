import * as MuiButton from '@mui/material/Button';
import { ButtonProps } from '@caretaker/caretaker-types';

const MuiButtonComponent = MuiButton.default;

export function Button(props: ButtonProps) {
  return <MuiButtonComponent {...props}>{props.children}</MuiButtonComponent>;
}
