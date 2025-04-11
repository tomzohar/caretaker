import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccountDetails } from './account-details';
import { AppStore } from '@caretaker/caretaker-data';
import { BrowserRouter } from 'react-router-dom';
import { AlertType } from '@caretaker/caretaker-types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCreateAccount = jest.fn();
let mockError: Error | null = null;
const mockCheckAccountExists = jest.fn();

jest.mock('@caretaker/caretaker-data', () => ({
  ...jest.requireActual('@caretaker/caretaker-data'),
  useCreateAccount: () => ({
    createAccount: mockCreateAccount,
    loading: false,
    error: mockError,
  }),
  useCheckAccountExists: () => ({
    checkAccountExists: mockCheckAccountExists,
    loading: false,
  }),
  AppStore: jest.fn().mockImplementation(() => ({
    setAlert: jest.fn(),
  })),
}));

describe('AccountDetails', () => {
  let appState: AppStore;

  beforeEach(() => {
    appState = new AppStore();
    mockNavigate.mockClear();
    mockCreateAccount.mockClear();
    mockCheckAccountExists.mockClear();
    mockError = null;
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AccountDetails appState={appState} />
      </BrowserRouter>
    );
  };

  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
  });

  it('should display the account name input field', () => {
    renderComponent();
    expect(screen.getByLabelText('Account name *')).toBeInTheDocument();
  });

  it('should display the check account name button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Check Account Name/i })).toBeInTheDocument();
  });

  it('should validate account name length', async () => {
    renderComponent();
    const accountNameInput = screen.getByLabelText('Account name *');
    const submitButton = screen.getByRole('button', { name: /Check Account Name/i });

    // Test too short
    fireEvent.change(accountNameInput, { target: { value: 'ab' } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Account name must be at least 3 characters long')).toBeInTheDocument();
    });

    // Test too long
    fireEvent.change(accountNameInput, { target: { value: 'a'.repeat(51) } });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Account name must be less than 50 characters long')).toBeInTheDocument();
    });
  });

  it('should check if account exists when button is clicked', async () => {
    // Mock successful check
    mockCheckAccountExists.mockResolvedValueOnce({ accounts: [] });
    
    renderComponent();
    const accountNameInput = screen.getByLabelText('Account name *');
    const submitButton = screen.getByRole('button', { name: /Check Account Name/i });

    fireEvent.change(accountNameInput, { target: { value: 'Test Account' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCheckAccountExists).toHaveBeenCalledWith('Test Account');
    });
  });

  it('should show error alert when API call fails', async () => {
    mockError = new Error('API Error');
    const setAlertSpy = jest.spyOn(appState, 'setAlert');
    
    renderComponent();

    await waitFor(() => {
      expect(appState.setAlert).toHaveBeenCalledWith({
        type: AlertType.ERROR,
        message: mockError?.message,
      });
    });
  });
});
