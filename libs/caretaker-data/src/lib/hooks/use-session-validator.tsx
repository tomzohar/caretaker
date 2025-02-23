import { useMemo } from 'react';
import { SessionService } from '../services/session.service';
import { UserStore } from '../store/user-store/user-store';
import { useNavigate } from 'react-router-dom';
import { autorun } from 'mobx';

export const useSession = (userStore: UserStore) => {
  const navigate = useNavigate();

  // useMemo(async () => {
  //   if (!userStore.value) {
  //     console.log('validating session');
  //     const user = await SessionService.validateSession();
  //     userStore.set(user);
  //     navigate(user ? window.location.pathname : '/login');
  //   }
  //   return;
  // }, [userStore, navigate]);
};
