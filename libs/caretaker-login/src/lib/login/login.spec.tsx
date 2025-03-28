import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './login';
import { SessionService, UserStore } from '@caretaker/caretaker-data';
import { BrowserRouter } from 'react-router-dom';

// Mock the SessionService
jest.mock('@caretaker/caretaker-data', () => ({
  SessionService: {
    createSession: jest.fn()
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

describe('Login', () => {
  const mockUserStore: Partial<UserStore> = {
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login userStore={mockUserStore as UserStore} />
      </BrowserRouter>
    );
  };

  it('should render successfully', () => {
    const { baseElement } = renderLogin();
    expect(baseElement).toBeTruthy();
  });

  it('should render login form with email and password fields', () => {
    renderLogin();
    
    // For Material-UI, we need to use the input's id
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should show signup link', () => {
    renderLogin();
    const signupLink = screen.getByRole('link', { name: /signup/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should validate password length', async () => {
    renderLogin();
    
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    const errorMessage = await screen.findByText('Password must be at least 8 characters long');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    (SessionService.createSession as jest.Mock).mockResolvedValueOnce(mockUser);
    
    renderLogin();
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(SessionService.createSession).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockUserStore.set).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle failed login', async () => {
    (SessionService.createSession as jest.Mock).mockResolvedValueOnce(null);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation((message) => {
      console.log(`Window alert: ${message}`);
    });
    
    renderLogin();
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Invalid email or password');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });
});
