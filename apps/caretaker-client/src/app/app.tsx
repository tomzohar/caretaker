import { Outlet } from 'react-router-dom';
import { AppLayout } from '@caretaker/caretaker-layout-features';
import { observer } from 'mobx-react-lite';
import { UserStore } from '@caretaker/caretaker-data';

function App({ userStore }: { userStore: UserStore }) {
  return (
    <AppLayout user={userStore}>
      <Outlet />
    </AppLayout>
  );
}

export default observer(App);
