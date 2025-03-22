import { render, screen } from '@testing-library/react';
import { Topnav } from './topnav';

describe('Topnav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Topnav />);
    expect(baseElement).toBeTruthy();
  });

  it('should render menu button', () => {
    render(<Topnav />);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeTruthy();
  });
});
