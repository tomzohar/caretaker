import React, { PropsWithChildren } from 'react';
import { Topnav } from '../topnav/topnav';
import { observer } from 'mobx-react-lite';
import { appStore, UserStore } from '@caretaker/caretaker-data';
import { Sidebar } from '@caretaker/caretaker-ui';

function AppLayout(props: PropsWithChildren & { user: UserStore }) {
  if (!props.user.value) {
    return props.children;
  }
  return (
    <React.Fragment>
      <Topnav />
      <Sidebar appState={appStore} />
      {props.children}
    </React.Fragment>
  );
}

export default observer(AppLayout);
