import { render } from '@testing-library/react';
import EmailPassword from './email-password';
import { UserStore } from '@caretaker/caretaker-data';

describe('EmailPassword', () => {
  it('should render successfully', () => {
    const mockUserStore: Partial<UserStore> = {
      set: () => void 0,
    };

    const { baseElement } = render(<EmailPassword store={mockUserStore as UserStore} />);
    expect(baseElement).toBeTruthy();
  });
});
