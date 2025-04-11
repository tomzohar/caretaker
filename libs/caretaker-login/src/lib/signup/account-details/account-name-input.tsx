import {
  AccountSearchResult,
  useCheckAccountExists,
} from '@caretaker/caretaker-data';
import { Account, Form, FormItemType } from '@caretaker/caretaker-types';
import { Button } from '@caretaker/caretaker-ui';
import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import FormLayout from '../../shared-ui/form-layout/form-layout';

export interface AccountNameInputProps {
  onAccountNameChange: (name: string) => void;
  onExistingAccountSelect: (accountId: number) => void;
  createAccount: (name: string) => void;
}

type AccountNameFormValue = {
  accountName: string;
};

export const AccountNameInput = ({
  onAccountNameChange,
  onExistingAccountSelect,
  createAccount,
}: AccountNameInputProps) => {
  const [accountName, setAccountName] = useState('');
  const { checkAccountExists, loading } = useCheckAccountExists();
  const [accounts, setAccounts] = useState<
    AccountSearchResult['accounts'] | null
  >(null);

  const handleCheck = async (formValue: AccountNameFormValue) => {
    const { accountName } = formValue;
    if (accounts?.length && accountName === accounts[0].name) {
      createAccount(accountName);
    } else {
      try {
        const searchResult = await checkAccountExists(accountName);
        onAccountNameChange(accountName);
        setAccounts(searchResult.accounts);
        if (!searchResult.accounts?.length) {
          createAccount(accountName);
        }
      } catch (error) {
        console.error('Error checking account existence:', error);
      }
    }
  };

  const handleJoinAccount = (account: Account) => {
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
      buttonsConfig: [
        {
          text: loading
            ? 'Checking...'
            : accounts
            ? 'Create Account'
            : 'Check Account Name',
          type: 'submit',
          size: 'large',
          variant: 'contained',
          sx: { mt: 2 },
          fullWidth: true,
          disabled: loading,
        },
      ],
    };
  }, [accounts, accountName, loading]);

  const renderForm = () => {
    return <FormLayout {...accountNameForm} />;
  };

  const renderJoinAccountButton = () => {
    if (!accounts?.length) {
      return null;
    }
    return (
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5">Join an existing account</Typography>
        {accounts?.map((account) => {
          return (
            <Button
              key={account.id}
              variant="contained"
              color="secondary"
              onClick={() => handleJoinAccount(account)}
            >
              Join {account.slug} Account
            </Button>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      {renderForm()}
      {renderJoinAccountButton()}
    </Box>
  );
};
