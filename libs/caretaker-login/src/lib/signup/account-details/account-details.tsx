import PageLayout from '../../shared-ui/page-layout/page-layout';
import FormLayout from '../../shared-ui/form-layout/form-layout';
import { AlertType, Form, FormItemType } from '@caretaker/caretaker-types';
import { AppStore, useCreateAccount } from '@caretaker/caretaker-data';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

export interface AccountDetailsFormValue {
  accountName: string;
}

export const AccountDetails = observer(
  ({ appState }: { appState: AppStore }) => {
    const { createAccount, loading, error } = useCreateAccount();
    const navigate = useNavigate();

    if (error) {
      appState.setAlert({
        type: AlertType.ERROR,
        message: error.message,
      });
    }

    const handleSubmit = async (formValue: AccountDetailsFormValue) => {
      const account = await createAccount({ name: formValue.accountName });
      if (account) {
        navigate('/');
      }
    };

    const accountDetailsForm: Form<AccountDetailsFormValue> = {
      items: [
        {
          id: 'accountName',
          type: FormItemType.TEXT,
          label: 'Account name',
        },
      ],
      onSubmit: handleSubmit,
      buttonsConfig: [
        {
          text: 'Create account',
          type: 'submit',
          size: 'large',
          variant: 'contained',
          sx: { mt: 2 },
          fullWidth: true,
          disabled: loading,
        },
      ],
    };

    return (
      <PageLayout title={'Account Details'}>
        <FormLayout {...accountDetailsForm} />
      </PageLayout>
    );
  }
);
