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
        required: true
      },
      {
        id: 'password',
        label: 'Password',
        type: FormItemType.PASSWORD,
        required: true,
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return 'Password must be a string';
          }
          if (value.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return '';
        }
      },
      {
        id: 'confirm',
        label: 'Confirm password',
        type: FormItemType.PASSWORD,
        required: true,
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return 'Password must be a string';
          }
          if (value !== signupForm.items.find(item => item.id === 'password')?.value) {
            return 'Passwords do not match';
          }
          return '';
        }
      },
      {
        id: 'firstName',
        label: 'First name',
        type: FormItemType.TEXT,
        required: true
      },
      {
        id: 'lastName',
        label: 'Last name',
        type: FormItemType.TEXT,
        required: true
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
