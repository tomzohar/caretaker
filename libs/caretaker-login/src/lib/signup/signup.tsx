import { Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

export function Signup() {
  return <Outlet />;
}

export default observer(Signup);
