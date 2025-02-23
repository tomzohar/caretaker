import { render } from '@testing-library/react';

import PatientsPage from './patients-page';

describe('PatientsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PatientsPage />);
    expect(baseElement).toBeTruthy();
  });
});
