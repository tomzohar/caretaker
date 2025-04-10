import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountNameInput } from './account-name-input';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

// Mock the useCheckAccountExists hook
jest.mock('@caretaker/caretaker-data', () => ({
  useCheckAccountExists: () => ({
    checkAccountExists: jest.fn().mockImplementation((name) => {
      if (name === 'Existing Account') {
        return Promise.resolve({
          exists: true,
          account: {
            id: 1,
            name: 'Existing Account',
            slug: 'existing-account',
            usersCount: 2
          }
        });
      }
      return Promise.resolve({ exists: false, account: null });
    }),
    loading: false,
    result: {
      exists: true,
      account: {
        id: 1,
        name: 'Existing Account',
        slug: 'existing-account',
        usersCount: 2
      }
    }
  }),
}));

describe('AccountNameInput', () => {
  const mockOnAccountNameChange = jest.fn();
  const mockOnExistingAccountSelect = jest.fn();
  const mockOnContinueWithNewAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders successfully', () => {
    const { baseElement } = render(
      <AccountNameInput
        onAccountNameChange={mockOnAccountNameChange}
        onExistingAccountSelect={mockOnExistingAccountSelect}
        onContinueWithNewAccount={mockOnContinueWithNewAccount}
      />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should display account name form', () => {
    render(
      <AccountNameInput
        onAccountNameChange={mockOnAccountNameChange}
        onExistingAccountSelect={mockOnExistingAccountSelect}
        onContinueWithNewAccount={mockOnContinueWithNewAccount}
      />
    );
    expect(screen.getByLabelText(/Account name \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check Account Name/i })).toBeInTheDocument();
  });

  it('shows join account options when an existing account is found', async () => {
    render(
      <AccountNameInput
        onAccountNameChange={mockOnAccountNameChange}
        onExistingAccountSelect={mockOnExistingAccountSelect}
        onContinueWithNewAccount={mockOnContinueWithNewAccount}
      />
    );

    // Fill in an existing account name
    const accountNameInput = screen.getByLabelText(/Account name \*/i);
    fireEvent.change(accountNameInput, { target: { value: 'Existing Account' } });

    // Submit the form
    const checkButton = screen.getByRole('button', { name: /Check Account Name/i });
    await act(async () => {
      fireEvent.click(checkButton);
    });

    // Check that the options are displayed
    await waitFor(() => {
      expect(screen.getByText(/Account already exists/i)).toBeInTheDocument();
      expect(screen.getByText(/An account with name "Existing Account" already exists with 2 user\(s\)./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Join Existing Account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create New Account Instead/i })).toBeInTheDocument();
    });
  });

  it('calls onExistingAccountSelect when join account button is clicked', async () => {
    render(
      <AccountNameInput
        onAccountNameChange={mockOnAccountNameChange}
        onExistingAccountSelect={mockOnExistingAccountSelect}
        onContinueWithNewAccount={mockOnContinueWithNewAccount}
      />
    );

    // Fill in an existing account name and submit
    const accountNameInput = screen.getByLabelText(/Account name \*/i);
    fireEvent.change(accountNameInput, { target: { value: 'Existing Account' } });
    const checkButton = screen.getByRole('button', { name: /Check Account Name/i });
    
    await act(async () => {
      fireEvent.click(checkButton);
    });

    // Click join account button
    await waitFor(() => {
      const joinButton = screen.getByRole('button', { name: /Join Existing Account/i });
      fireEvent.click(joinButton);
    });

    expect(mockOnExistingAccountSelect).toHaveBeenCalledWith(1);
  });

  it('calls onContinueWithNewAccount when create new account button is clicked', async () => {
    render(
      <AccountNameInput
        onAccountNameChange={mockOnAccountNameChange}
        onExistingAccountSelect={mockOnExistingAccountSelect}
        onContinueWithNewAccount={mockOnContinueWithNewAccount}
      />
    );

    // Fill in an existing account name and submit
    const accountNameInput = screen.getByLabelText(/Account name \*/i);
    fireEvent.change(accountNameInput, { target: { value: 'Existing Account' } });
    const checkButton = screen.getByRole('button', { name: /Check Account Name/i });
    
    await act(async () => {
      fireEvent.click(checkButton);
    });

    // Click create new account button
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /Create New Account Instead/i });
      fireEvent.click(createButton);
    });

    expect(mockOnContinueWithNewAccount).toHaveBeenCalled();
  });
}); 