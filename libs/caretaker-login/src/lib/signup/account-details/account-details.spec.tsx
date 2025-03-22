import { render } from '@testing-library/react';
import { AccountDetails } from './account-details';
import { AppStore } from '@caretaker/caretaker-data';

jest.mock('@caretaker/caretaker-data', () => ({
  ...jest.requireActual('@caretaker/caretaker-data'),
  useCreateAccount: () => ({
    createAccount: jest.fn(),
    loading: false,
    error: null
  })
}));

describe('AccountDetails', () => {
  it('should render successfully', () => {
    const mockAppStore: Partial<AppStore> = {
      setAlert: jest.fn(),
    };

    const { baseElement } = render(<AccountDetails appState={mockAppStore as AppStore} />);
    expect(baseElement).toBeTruthy();
  });
});
