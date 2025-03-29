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

    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByText(/send invitations/i)).toBeTruthy();
  });

  it('should show validation error for invalid email', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeTruthy();
  });

  it('should add valid email as a tag when pressing Enter', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    expect(screen.getByText('test@example.com')).toBeTruthy();
    expect((emailInput as HTMLInputElement).value).toBe('');
  });

  it('should not add duplicate emails', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    
    // Add first email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    // Try to add same email again
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    expect(screen.getAllByText('test@example.com')).toHaveLength(1);
    expect(screen.getByText(/this email has already been added/i)).toBeTruthy();
  });

  it('should remove email when delete button is clicked', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    const deleteButton = screen.getByTestId('CancelIcon');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('test@example.com')).toBeNull();
  });

  it('should call onSubmit with all added emails', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    
    // Add first email
    fireEvent.change(emailInput, { target: { value: 'test1@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    // Add second email
    fireEvent.change(emailInput, { target: { value: 'test2@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    const submitButton = screen.getByText(/send invitations/i);
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      emails: ['test1@example.com', 'test2@example.com'],
    });
  });

  it('should render cancel button when onCancel is provided', () => {
    render(<Invite onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeTruthy();

    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should not render cancel button when onCancel is not provided', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    expect(screen.queryByText(/cancel/i)).toBeNull();
  });

  it('should disable submit button when no emails are added', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText(/send invitations/i) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when emails are added', () => {
    render(<Invite onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(emailInput, { key: 'Enter' });

    const submitButton = screen.getByText(/send invitations/i) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });
});
