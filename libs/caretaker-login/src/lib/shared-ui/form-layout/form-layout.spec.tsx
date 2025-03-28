import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormLayout from './form-layout';
import { Form, FormItemType } from '@caretaker/caretaker-types';

type TestFormValue = Record<string, unknown> & {
  testField: string;
};

describe('FormLayout', () => {
  const createMockForm = (overrides?: Partial<Form<TestFormValue>>): Form<TestFormValue> => ({
    items: [
      {
        id: 'testField',
        type: FormItemType.TEXT,
        label: 'Test Field',
        required: true
      }
    ],
    buttonsConfig: [
      {
        text: 'Submit',
        type: 'submit'
      }
    ],
    onSubmit: jest.fn(),
    ...overrides
  });

  it('should render successfully', () => {
    const mockForm = createMockForm();
    const { baseElement } = render(<FormLayout {...mockForm} />);
    expect(baseElement).toBeTruthy();
  });

  it('should render form items with labels', () => {
    const mockForm = createMockForm();
    render(<FormLayout {...mockForm} />);
    
    // Material-UI TextField uses aria-labelledby
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'testField');
    
    const label = screen.getByText('Test Field');
    expect(label).toBeInTheDocument();
  });

  it('should show validation error when submitting empty required field', async () => {
    const mockForm = createMockForm();
    const { container } = render(<FormLayout {...mockForm} />);
    
    // Find and submit the form
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    // Wait for validation state to be updated
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'testField-helper-text');
    });
    
    // Helper text should show the error
    const helperText = screen.getByText('Test Field is required');
    expect(helperText).toBeInTheDocument();
    
    // Verify onSubmit was not called
    expect(mockForm.onSubmit).not.toHaveBeenCalled();
  });
});
