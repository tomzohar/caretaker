import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './modal';
import { AppStore } from '@caretaker/caretaker-data';
import { ModalConfig } from '@caretaker/caretaker-types';
import { DialogProps } from '@mui/material';
import { ReactNode } from 'react';

// Mock MUI Dialog
jest.mock('@mui/material', () => {
  const mockOnCloseFn = jest.fn();
  return {
    ...jest.requireActual('@mui/material'),
    Dialog: ({ children, onClose, maxWidth = 'sm' }: { children: ReactNode; onClose?: DialogProps['onClose']; maxWidth?: string }) => {
      mockOnCloseFn.mockImplementation(onClose);
      return (
        <div role="dialog" data-testid="mui-dialog" className={`MuiDialog-paperWidth${maxWidth.charAt(0).toUpperCase() + maxWidth.slice(1)}`}>
          <div data-testid="dialog-backdrop" onClick={() => mockOnCloseFn(null, 'backdropClick')}></div>
          {children}
        </div>
      );
    },
    DialogTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DialogActions: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    IconButton: ({ children, onClick, 'aria-label': ariaLabel, className }: any) => (
      <button onClick={onClick} aria-label={ariaLabel} className={className}>
        {children}
      </button>
    ),
    Button: ({ children, onClick, variant = 'text' }: any) => (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  };
});

jest.mock('@mui/icons-material', () => ({
  Close: () => 'CloseIcon'
}));

describe('Modal', () => {
  const mockCloseModal = jest.fn();
  
  const createMockAppStore = (config: ModalConfig | null = null): AppStore => ({
    modalConfig: config,
    closeModal: mockCloseModal,
  } as unknown as AppStore);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when modalConfig is null', () => {
    const mockAppStore = createMockAppStore(null);
    const { container } = render(<Modal appState={mockAppStore} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal with title and content', () => {
    const mockConfig: ModalConfig = {
      title: 'Test Title',
      content: <div>Test Content</div>
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render action buttons when provided', () => {
    const mockOnClick = jest.fn();
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      actions: [
        { text: 'Cancel', variant: 'text', onClick: mockOnClick },
        { text: 'Confirm', variant: 'contained', onClick: mockOnClick }
      ]
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should call onClose and closeModal when clicking action button', () => {
    const mockOnClick = jest.fn();
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      actions: [
        { text: 'Action', onClick: mockOnClick }
      ]
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);
    
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should call closeModal when clicking close button', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content'
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should respect disableCloseOnClickOutside option', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      disableCloseOnClickOutside: true
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);
    
    expect(mockCloseModal).not.toHaveBeenCalled();
  });

  it('should allow closing by backdrop click when disableCloseOnClickOutside is false', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      disableCloseOnClickOutside: false
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should handle optional onClick in actions', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      actions: [
        { text: 'Action without onClick' }
      ]
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const actionButton = screen.getByText('Action without onClick');
    fireEvent.click(actionButton);
    
    // Should not throw and should still close the modal
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should call onClose callback when provided', () => {
    const mockOnClose = jest.fn();
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      onClose: mockOnClose
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should use default maxWidth when not provided', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content'
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('MuiDialog-paperWidthSm');
  });

  it('should use provided maxWidth', () => {
    const mockConfig: ModalConfig = {
      title: 'Test',
      content: 'Content',
      maxWidth: 'md'
    };
    const mockAppStore = createMockAppStore(mockConfig);
    
    render(<Modal appState={mockAppStore} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('MuiDialog-paperWidthMd');
  });
}); 