import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { BrowserRouter, redirect, Route, Routes } from 'react-router-dom';
import { appStore, SessionService, userStore } from '@caretaker/caretaker-data';
import {
  AccountDetails,
  EmailPassword,
  Login,
  Signup,
} from '@caretaker/caretaker-login';
import { Home } from '@caretaker/home';
import { PatientsPage } from '@caretaker/patients-page';
import { autorun } from 'mobx';
import { AlertType, User } from '@caretaker/caretaker-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertComponent } from '@caretaker/caretaker-ui';

autorun(async () => {
  const pathname = window.location.pathname;
  const setPath = (url: string) => (window.location.pathname = url);

  if (!userStore.value) {
    console.log('validating session');
    const user: User | null = await SessionService.validateSession();
    userStore.set(user);

    if (!user && pathname !== '/login') {
      setPath('/login');
    }
  }
  if (
    !userStore.value?.account &&
    !['/signup', '/login'].some((p) => pathname.startsWith(p))
  ) {
    setPath('/signup/account-details');
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={new QueryClient()}>
        <AlertComponent appState={appStore}>
          <Routes>
            <Route path={'/'} element={<App userStore={userStore} />}>
              <Route index={true} path={'/'} element={<Home />} />
              <Route path={'/patients'} element={<PatientsPage />} />
            </Route>
            <Route path={'/login'} element={<Login userStore={userStore} />} />
            <Route path={'/signup'} element={<Signup />}>
              <Route
                index={true}
                path={'/signup'}
                element={<EmailPassword store={userStore} />}
              />
              <Route
                path={'/signup/account-details'}
                element={<AccountDetails appState={appStore} />}
              />
            </Route>
          </Routes>
        </AlertComponent>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
