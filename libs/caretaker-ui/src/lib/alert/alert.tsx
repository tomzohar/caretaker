import { PropsWithChildren, useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { AppStore } from '@caretaker/caretaker-data';
import { ALERTS_DEFAULT_TIME } from '@caretaker/caretaker-types';
import { Button } from '../button/button';
import IconButton from '../icon-button/icon-button';

export interface AlertProps {
  appState: AppStore;
}

export const AlertComponent = observer(
  ({ appState, children }: PropsWithChildren<AlertProps>) => {
    const [open, setOpen] = useState(false);

    const alert = appState.alert;

    useEffect(() => {
      console.log('alert open', Boolean(alert));
      setOpen(Boolean(alert));
    }, [alert]);

    const handleClose = () => {
      setOpen(false);
      appState.clearAlert();
      if (alert?.onClose) {
        alert.onClose();
      }
    };

    const renderAction = () => {
      if (!alert?.action) {
        return null;
      }
      const { action } = alert;

      return (
        <Button
            color={action.buttonConfig.color}
            size={action.buttonConfig.size}
            onClick={handleClose}
          >
            {action.text}
          </Button>
      );
    };

    const renderCloseButton = () => {
      return (
        <IconButton
          aria-label="close"
          color="inherit"
          sx={{ p: 0.5 }}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      );
    }

    return (
      <>
        {children}
        <Snackbar
          key={alert?.message}
          open={open}
          autoHideDuration={alert?.clearAfter || ALERTS_DEFAULT_TIME}
        >
          <Alert severity={alert?.type} variant={'filled'}>
            {alert?.message}
            {renderAction()}
            {renderCloseButton()}
          </Alert>
        </Snackbar>
      </>
    );
  }
);

export default AlertComponent;
