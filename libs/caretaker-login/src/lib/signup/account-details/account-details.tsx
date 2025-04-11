import {
  AppStore,
  useCreateAccount,
  useJoinAccount,
} from '@caretaker/caretaker-data';
import { AlertType } from '@caretaker/caretaker-types';
import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../shared-ui/page-layout/page-layout';
import { AccountNameInput } from './account-name-input';

export interface AccountDetailsFormValue {
  accountName: string;
}

export const AccountDetails = observer(
  ({ appState }: { appState: AppStore }) => {
    const [accountName, setAccountName] = useState('');
    const {
      createAccount,
      loading: createLoading,
      error: createError,
    } = useCreateAccount();
    const {
      joinAccount,
      loading: joinLoading,
      error: joinError,
    } = useJoinAccount();
    const navigate = useNavigate();

    if (createError) {
      appState.setAlert({
        type: AlertType.ERROR,
        message: createError.message,
      });
    }

    if (joinError) {
      appState.setAlert({
        type: AlertType.ERROR,
        message: joinError.message,
      });
    }

    const handleCreateAccount = async (accountName: string) => {
      const account = await createAccount({ name: accountName });
      if (account) {
        navigate('/');
      }
    };

    const handleJoinAccount = async (accountId: number) => {
      const account = await joinAccount(accountId);
      if (account) {
        navigate('/');
      }
    };

    const handleContinueWithNewAccount = (accountName: string) => {
      handleCreateAccount(accountName);
    };

    return (
      <PageLayout title={'Account Details'}>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <AccountNameInput
            onAccountNameChange={setAccountName}
            onExistingAccountSelect={handleJoinAccount}
            createAccount={handleContinueWithNewAccount}
          />
        </Box>
      </PageLayout>
    );
  }
);
