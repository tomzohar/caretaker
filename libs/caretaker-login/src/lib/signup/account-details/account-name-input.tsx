import {
  AccountSearchResult,
  useCheckAccountExists,
} from '@caretaker/caretaker-data';
import { Form, FormItemType } from '@caretaker/caretaker-types';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import FormLayout from '../../shared-ui/form-layout/form-layout';

export interface AccountNameInputProps {
  onAccountNameChange: (name: string) => void;
  onExistingAccountSelect: (accountId: number) => void;
  onContinueWithNewAccount: () => void;
}

type AccountNameFormValue = {
  accountName: string;
};

export const AccountNameInput = ({
  onAccountNameChange,
  onExistingAccountSelect,
  onContinueWithNewAccount,
}: AccountNameInputProps) => {
  const [accountName, setAccountName] = useState('');
  const { checkAccountExists, loading } = useCheckAccountExists();
  const [account, setAccount] = useState<AccountSearchResult['account'] | null>(
    null
  );

  useEffect(() => {
    setAccount(null);
  }, [accountName]);

  const handleCheck = async (formValue: AccountNameFormValue) => {
    try {
      const searchResult = await checkAccountExists(formValue.accountName);
      onAccountNameChange(formValue.accountName);
      setAccount(searchResult.account);
    } catch (error) {
      console.error('Error checking account existence:', error);
    }
  };

  const handleJoinAccount = () => {
    if (account?.id) {
      onExistingAccountSelect(account.id);
    }
  };

  const accountNameForm: Form<AccountNameFormValue> = useMemo(() => {
    return {
      items: [
        {
          id: 'accountName',
          type: FormItemType.TEXT,
          label: 'Account name',
          required: true,
          onChange: (value: unknown) => {
            console.log('onChange', value);
            setAccountName(value as string);
          },
          validate: (value: unknown) => {
            if (typeof value !== 'string') {
              return 'Account name must be a string';
            }
            if (value.length < 3) {
              return 'Account name must be at least 3 characters long';
            }
            if (value.length > 50) {
              return 'Account name must be less than 50 characters long';
            }
            return '';
          },
        },
      ],
      onSubmit: handleCheck,
      buttonsConfig: account
        ? []
        : [
            {
              text: loading ? 'Checking...' : 'Check Account Name',
              type: 'submit',
              size: 'large',
              variant: 'contained',
              sx: { mt: 2 },
              fullWidth: true,
              disabled: loading,
            },
          ],
    };
  }, [account, accountName, loading]);

  return (
    <Box>
      <FormLayout {...accountNameForm} />

      {account && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="h6">Join {account.name}?</Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleJoinAccount}
            >
              Join Existing Account
            </Button>
            <Button variant="outlined" onClick={onContinueWithNewAccount}>
              Create New Account Instead
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
