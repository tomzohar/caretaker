import { render } from '@testing-library/react';

import CaretakerLayoutTypes from './caretaker-layout-types';

describe('CaretakerLayoutTypes', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CaretakerLayoutTypes />);
    expect(baseElement).toBeTruthy();
  });
});
