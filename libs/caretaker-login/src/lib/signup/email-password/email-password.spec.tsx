import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { UserApiService, UserStore } from '@caretaker/caretaker-data';
import EmailPassword from './email-password';

// Mock UserApiService
jest.mock('@caretaker/caretaker-data', () => ({
  UserApiService: {
    signup: jest.fn()
  },
  // Keep the UserStore as is since we're using it in our tests
  UserStore: jest.requireActual('@caretaker/caretaker-data').UserStore
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('EmailPassword', () => {
  const mockUserStore: Partial<UserStore> = {
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderEmailPassword = () => {
    return render(
      <BrowserRouter>
        <EmailPassword store={mockUserStore as UserStore} />
      </BrowserRouter>
    );
  };

  it('should render successfully', () => {
    const { baseElement } = renderEmailPassword();
    expect(baseElement).toBeTruthy();
  });

  it('should render signup form with all required fields', () => {
    renderEmailPassword();
    
    // Check for all form fields
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
    const submitButton = screen.getByRole('button', { name: /signup/i });
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should show login link', () => {
    renderEmailPassword();
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should validate password length', async () => {
    renderEmailPassword();
    
    const passwordInput = screen.getByLabelText('Password *');
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    const errorMessage = await screen.findByText('Password must be at least 8 characters long');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should validate password confirmation match', async () => {
    renderEmailPassword();
    
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.blur(confirmPasswordInput);

    const errorMessage = await screen.findByText('Passwords do not match');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should handle successful signup', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (UserApiService.signup as jest.Mock).mockResolvedValueOnce(mockUser);
    
    renderEmailPassword();
    
    // Fill out the form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
    const submitButton = screen.getByRole('button', { name: /signup/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(UserApiService.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirm: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(mockUserStore.set).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/signup/account-details');
    });
  });

  it('should handle failed signup', async () => {
    (UserApiService.signup as jest.Mock).mockResolvedValueOnce(null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderEmailPassword();
    
    // Fill out the form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText('Confirm password *');
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
    const submitButton = screen.getByRole('button', { name: /signup/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid email or password, try signup');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
