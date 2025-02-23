import { render } from '@testing-library/react';
import { Topnav } from './topnav';

describe('Topnav', () => {
  it('should render successfully', () => {
    const {baseElement} = render(<Topnav />);
    expect(baseElement).toBeTruthy();
  })
})
