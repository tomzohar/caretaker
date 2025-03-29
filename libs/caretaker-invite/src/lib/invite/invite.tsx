import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { Tags, type Tag } from '@caretaker/caretaker-ui';
import styles from './invite.module.scss';
import clsx from 'clsx';

export interface InviteFormData {
  emails: string[];
}

export interface InviteProps {
  onSubmit: (data: InviteFormData) => void;
  onCancel?: () => void;
  className?: string;
  isSubmitting?: boolean;
}

export function Invite({ onSubmit, onCancel, className, isSubmitting = false }: InviteProps) {
  const [currentEmail, setCurrentEmail] = useState('');
  const [emailTags, setEmailTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | undefined>();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    setCurrentEmail(email);
    setError(undefined);
  };

  const handleDeleteEmail = (tagToDelete: Tag) => {
    setEmailTags(emailTags.filter(tag => tag.id !== tagToDelete.id));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!currentEmail) return;
      
      if (!validateEmail(currentEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      if (emailTags.some(tag => tag.label === currentEmail)) {
        setError('This email has already been added');
        return;
      }

      setEmailTags([...emailTags, { id: currentEmail, label: currentEmail }]);
      setCurrentEmail('');
      setError(undefined);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (emailTags.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    onSubmit({ emails: emailTags.map(tag => tag.label) });
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      className={clsx(styles.inviteForm, 'MuiBox-root', className)}
    >
      <Typography variant="body1" gutterBottom>
        Invite users to join your organization. They will receive an email with instructions to set up their account.
      </Typography>

      <TextField
        fullWidth
        label="Email Address"
        value={currentEmail}
        onChange={handleEmailChange}
        onKeyDown={handleKeyDown}
        error={!!error}
        helperText={error}
        margin="normal"
        placeholder="Type an email and press Enter to add"
        className={clsx(styles.formField, 'MuiTextField-root')}
        disabled={isSubmitting}
      />

      {emailTags.length > 0 && (
        <Tags
          tags={emailTags}
          onDelete={handleDeleteEmail}
          variant="outlined"
          size="medium"
          className={styles.emailTags}
        />
      )}

      <Box className={styles.actions}>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="text"
            className={clsx(styles.cancelButton, 'MuiButton-root')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={emailTags.length === 0 || isSubmitting}
          className={clsx(styles.submitButton, 'MuiButton-root')}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {isSubmitting ? 'Sending...' : 'Send Invitations'}
        </Button>
      </Box>
    </Box>
  );
} 