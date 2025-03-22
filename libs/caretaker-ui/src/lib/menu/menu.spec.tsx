import { render } from '@testing-library/react';
import Menu, { MenuItem } from './menu';

describe('Menu', () => {
  it('should render successfully', () => {
    const mockItems: MenuItem[] = [
      {
        id: '1',
        text: 'Test Item',
      }
    ];

    const { baseElement } = render(<Menu items={mockItems} />);
    expect(baseElement).toBeTruthy();
  });
});
