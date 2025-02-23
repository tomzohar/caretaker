import { render } from '@testing-library/react';

import EmailPassword from './email-password';

describe('EmailPassword', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EmailPassword />);
    expect(baseElement).toBeTruthy();
  });
});
