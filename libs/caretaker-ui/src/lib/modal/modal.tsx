import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AppStore } from '@caretaker/caretaker-data';
import { observer } from 'mobx-react-lite';
import styles from './modal.module.scss';

export interface ModalProps {
  appState: AppStore;
}

export const Modal = observer(({ appState }: ModalProps) => {
  const { modalConfig } = appState;

  if (!modalConfig) {
    return null;
  }

  const handleClose = (reason?: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && modalConfig.disableCloseOnClickOutside) {
      return;
    }
    if (modalConfig.onClose) {
      modalConfig.onClose();
    }
    appState.closeModal();
  };

  return (
    <Dialog
      open={true}
      onClose={(_, reason) => handleClose(reason)}
      maxWidth={modalConfig.maxWidth || 'sm'}
      fullWidth
    >
      <DialogTitle className={styles.modalTitle}>
        {modalConfig.title}
        <IconButton
          aria-label="close"
          onClick={() => handleClose()}
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{modalConfig.content}</DialogContent>
      {modalConfig.actions && (
        <DialogActions>
          {modalConfig.actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => {
                action.onClick?.();
                handleClose();
              }}
              variant={action.variant || 'text'}
            >
              {action.text}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
}); 