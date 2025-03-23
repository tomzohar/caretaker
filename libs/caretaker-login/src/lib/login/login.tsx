import { Card, Typography } from '@mui/material';
import { SessionService, UserStore } from '@caretaker/caretaker-data';
import { Link, useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import { Form, FormItemType } from '@caretaker/caretaker-types';
import FormLayout from '../shared-ui/form-layout/form-layout';

type LoginForm = {
  email: string;
  password: string;
};

export function Login({ userStore }: { userStore: UserStore }) {
  const navigate = useNavigate();

  const handleSubmit = async (form: LoginForm) => {
    const user = await SessionService.createSession(form);
    if (!user) {
      // TODO: Add proper error handling through app state
      alert('Invalid email or password');
      return;
    }
    userStore.set(user);
    navigate('/');
  };

  const loginForm: Form<LoginForm> = {
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
        required: true
      }
    ],
    onSubmit: handleSubmit,
    buttonsConfig: [
      {
        type: 'submit',
        variant: 'contained',
        text: 'Login',
        size: 'large',
        fullWidth: true,
        sx: { mt: 2 }
      }
    ]
  };

  return (
    <div className={styles.loginPage}>
      <Card className={styles.loginWrapper}>
        <Typography variant={'h2'}>Caretaker</Typography>
        <FormLayout {...loginForm} />
        <Typography sx={{ mt: 1 }} variant={'body2'}>
          Don't have an account? <Link to={'/signup'}>Signup</Link>
        </Typography>
      </Card>
    </div>
  );
}

export default Login;
