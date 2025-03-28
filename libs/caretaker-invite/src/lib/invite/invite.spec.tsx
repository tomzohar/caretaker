import { render, screen, fireEvent } from '@testing-library/react';
import { Invite } from './invite';

describe('Invite', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    render(<Invite onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByText(/send invitation/i)).toBeInTheDocument();
  });

  it('should show validation error for invalid email', () => {
    render(<Invite onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('should not call onSubmit with invalid email', () => {
    render(<Invite onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByText(/send invitation/i);
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid data', () => {
    render(<Invite onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const roleSelect = screen.getByLabelText(/role/i);
    fireEvent.mouseDown(roleSelect);
    const adminOption = screen.getByText(/administrator/i);
    fireEvent.click(adminOption);
    
    const submitButton = screen.getByText(/send invitation/i);
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      role: 'admin'
    });
  });

  it('should render cancel button when onCancel is provided', () => {
    render(<Invite onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should not render cancel button when onCancel is not provided', () => {
    render(<Invite onSubmit={mockOnSubmit} />);
    
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
  });
}); 