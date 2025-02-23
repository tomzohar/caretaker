import { Card, TextField, Typography } from '@mui/material';
import { Button } from '@caretaker/caretaker-ui';
import { FormEventHandler, useState } from 'react';
import { SessionService, UserStore } from '@caretaker/caretaker-data';
import { Link, useNavigate } from 'react-router-dom';
import styles from './login.module.scss';

export function Login({ userStore }: { userStore: UserStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const user = await SessionService.createSession({ email, password });
    if (!user) {
      alert('Invalid email or password, try signup');
      return;
    }
    userStore.set(user);
    navigate('/');
  };

  return (
    <div className={styles.loginPage}>
      <Card className={styles.loginWrapper}>
        <Typography variant={'h2'}>Caretaker</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            className={styles.loginFormItem}
            label={'Email'}
            type={'email'}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            className={styles.loginFormItem}
            label={'Password'}
            type={'password'}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className={styles.loginFormButton}
            type={'submit'}
            variant={'contained'}
            size={'large'}
          >
            Login
          </Button>
        </form>
        <Typography sx={{ mt: 1 }} variant={'body2'}>
          Don't have an account? <Link to={'/signup'}>Signup</Link>
        </Typography>
      </Card>
    </div>
  );
}

export default Login;
