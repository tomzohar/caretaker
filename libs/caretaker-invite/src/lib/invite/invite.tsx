import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Button,
} from '@mui/material';
import styles from './invite.module.scss';
import clsx from 'clsx';

export interface InviteFormData {
  email: string;
  role: string;
}

export interface InviteProps {
  onSubmit: (data: InviteFormData) => void;
  onCancel?: () => void;
  className?: string;
}

export function Invite({ onSubmit, onCancel, className }: InviteProps) {
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'user'
  });

  const [errors, setErrors] = useState<Partial<InviteFormData>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    setFormData(prev => ({ ...prev, email }));
    setErrors(prev => ({
      ...prev,
      email: validateEmail(email) ? undefined : 'Please enter a valid email address'
    }));
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const role = event.target.value;
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      className={clsx(styles.inviteForm, 'MuiBox-root', className)}
    >
      <Typography variant="body1" gutterBottom>
        Invite a new user to join your organization. They will receive an email with instructions to set up their account.
      </Typography>

      <TextField
        fullWidth
        label="Email Address"
        value={formData.email}
        onChange={handleEmailChange}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
        className={clsx(styles.formField, 'MuiTextField-root')}
      />

      <FormControl 
        fullWidth 
        margin="normal"
        className={clsx(styles.formField, 'MuiFormControl-root')}
      >
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          value={formData.role}
          label="Role"
          onChange={handleRoleChange}
        >
          <MenuItem value="admin">Administrator</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </Select>
      </FormControl>

      <Box className={styles.actions}>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="text"
            className={clsx(styles.cancelButton, 'MuiButton-root')}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={clsx(styles.submitButton, 'MuiButton-root')}
        >
          Send Invitation
        </Button>
      </Box>
    </Box>
  );
} 