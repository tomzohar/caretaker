import { render } from '@testing-library/react';
import { Sidebar } from './sidebar';
import { AppStore } from '@caretaker/caretaker-data';
import { SidebarItem } from '@caretaker/caretaker-types';

describe('Sidebar', () => {
  it('should render successfully', () => {
    const mockAppStore: Partial<AppStore> = {
      sidebarOpen: false,
      sidebarContent: [
        {
          id: 'main',
          title: 'Main',
          items: [] as SidebarItem[],
        },
      ],
      closeSidebar: () => void 0,
    };

    const { baseElement } = render(<Sidebar appState={mockAppStore as AppStore} />);
    expect(baseElement).toBeTruthy();
  });
});
