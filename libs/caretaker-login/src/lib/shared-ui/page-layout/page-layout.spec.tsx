import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import PageLayout from './page-layout';

describe('PageLayout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageLayout title="Test Page" />);
    expect(baseElement).toBeTruthy();
  });

  it('should display the provided title', () => {
    const title = 'My Test Page';
    render(<PageLayout title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    const childText = 'Child Content';
    render(
      <PageLayout title="Test Page">
        <div data-testid="child">{childText}</div>
      </PageLayout>
    );
    
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent(childText);
  });

  it('should apply custom className', () => {
    const customClass = 'my-custom-class';
    render(<PageLayout title="Test Page" className={customClass} />);
    
    const card = screen.getByRole('heading', { level: 2 }).closest('.signupFormWrapper');
    expect(card).toHaveClass(customClass);
  });
});
