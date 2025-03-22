import { render } from '@testing-library/react';
import Login from './login';
import { UserStore } from '@caretaker/caretaker-data';

describe('Login', () => {
  it('should render successfully', () => {
    const mockUserStore: Partial<UserStore> = {
      set: () => void 0,
    };

    const { baseElement } = render(<Login userStore={mockUserStore as UserStore} />);
    expect(baseElement).toBeTruthy();
  });
});
