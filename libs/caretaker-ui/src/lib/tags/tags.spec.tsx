import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tags } from './tags';

describe('Tags', () => {
  const mockTags = [
    { id: '1', label: 'Tag 1', color: '#ff0000' },
    { id: '2', label: 'Tag 2', color: '#00ff00' },
    { id: '3', label: 'Tag 3', color: '#0000ff' },
  ];

  it('should render tags', () => {
    render(<Tags tags={mockTags} />);
    mockTags.forEach((tag) => {
      expect(screen.getByText(tag.label)).toBeInTheDocument();
    });
  });

  it('should call onClick when tag is clicked', () => {
    const onClick = jest.fn();
    render(<Tags tags={mockTags} onClick={onClick} />);
    const tag = screen.getByText(mockTags[0].label);
    fireEvent.click(tag);
    expect(onClick).toHaveBeenCalledWith(mockTags[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<Tags tags={mockTags} onDelete={onDelete} />);
    
    // Find delete button using the CancelIcon data-testid
    const deleteButtons = screen.getAllByTestId('CancelIcon');
    fireEvent.click(deleteButtons[0]);
    
    expect(onDelete).toHaveBeenCalledWith(mockTags[0]);
  });

  it('should apply custom color to tag', () => {
    render(<Tags tags={mockTags} />);
    const tag = screen.getByText(mockTags[0].label).closest('.MuiChip-root');
    expect(tag).toHaveStyle({ backgroundColor: mockTags[0].color });
  });

  it('should apply size prop to all tags', () => {
    const { container } = render(<Tags tags={mockTags} size="medium" />);
    const tags = container.querySelectorAll('.MuiChip-root');
    tags.forEach((tag) => {
      expect(tag).toHaveClass('MuiChip-sizeMedium');
    });
  });

  it('should apply variant prop to all tags', () => {
    const { container } = render(<Tags tags={mockTags} variant="outlined" />);
    const tags = container.querySelectorAll('.MuiChip-root');
    tags.forEach((tag) => {
      expect(tag).toHaveClass('MuiChip-outlined');
    });
  });
}); 