import { render } from '@testing-library/react';

import App from './app';
import { AppStore, UserStore } from '@caretaker/caretaker-data';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App userStore={new UserStore()}/>);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(<App userStore={new UserStore()}/>);
    expect(
      getByText(new RegExp('Welcome caretaker-client', 'gi'))
    ).toBeTruthy();
  });
});
