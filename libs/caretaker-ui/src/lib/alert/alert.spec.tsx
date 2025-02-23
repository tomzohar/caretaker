import { render } from '@testing-library/react';

import AlertComponent from './alert';

describe('Alert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AlertComponent />);
    expect(baseElement).toBeTruthy();
  });
});
