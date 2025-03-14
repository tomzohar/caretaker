import { Link, useNavigate } from 'react-router-dom';
import { UserApiService, UserStore } from '@caretaker/caretaker-data';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import PageLayout from '../../shared-ui/page-layout/page-layout';
import styles from './email-password.module.scss';
import { Form, FormItemType } from '@caretaker/caretaker-types';
import FormLayout from '../../shared-ui/form-layout/form-layout';

type SignupForm = {
  email: string;
  password: string;
  confirm: string;
  firstName: string;
  lastName: string;
};

export function EmailPassword({ store }: { store: UserStore }) {
  const navigate = useNavigate();

  const handleSubmit = async (form: SignupForm) => {
    const user = await UserApiService.signup(form);

    if (!user) {
      alert('Invalid email or password, try signup');
      return;
    }

    store.set(user);
    navigate('/signup/account-details');
  };

  const signupForm: Form<SignupForm> = {
    items: [
      {
        id: 'email',
        label: 'Email',
        type: FormItemType.EMAIL,
      },
      {
        id: 'password',
        label: 'Password',
        type: FormItemType.PASSWORD,
      },
      {
        id: 'confirm',
        label: 'Confirm password',
        type: FormItemType.PASSWORD,
      },
      {
        id: 'firstName',
        label: 'First name',
        type: FormItemType.TEXT,
      },
      {
        id: 'lastName',
        label: 'Last name',
        type: FormItemType.TEXT,
      }
    ],
    onSubmit: handleSubmit,
    buttonsConfig: [
      {
        type: 'submit',
        variant: 'contained',
        text: 'Signup',
        size: 'large',
        fullWidth: true,
        sx: {mt: 2},
      }
    ]
  };

  return (
    <PageLayout title={'Caretaker'} className={styles.signupLayout}>
      <FormLayout {...signupForm} />
      <Typography
        variant={'body2'}
        sx={{
          mt: 1,
          fontWeight: 'bold',
          marginBottom: 3,
          display: 'flex',
          justifySelf: 'center',
        }}
      >
        Already have an account?&nbsp; <Link to={'/login'}>Login</Link>
      </Typography>
    </PageLayout>
  );
}

export default observer(EmailPassword);
