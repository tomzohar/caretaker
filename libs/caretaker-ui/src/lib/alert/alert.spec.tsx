import { render } from '@testing-library/react';
import AlertComponent from './alert';
import { AppStore } from '@caretaker/caretaker-data';

describe('Alert', () => {
  it('should render successfully', () => {
    const mockAppStore: Partial<AppStore> = {
      alert: null,
      clearAlert: () => void 0,
    };

    const { baseElement } = render(<AlertComponent appState={mockAppStore as AppStore} />);
    expect(baseElement).toBeTruthy();
  });
});
