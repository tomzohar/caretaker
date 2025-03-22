import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';
import { UserStore } from '@caretaker/caretaker-data';
import '@testing-library/jest-dom';
import { vi, expect } from 'vitest';

// Mock the AppLayout component since we're testing App's integration with it
vi.mock('@caretaker/caretaker-layout-features', () => ({
  AppLayout: ({ children, user }: { children: React.ReactNode; user: UserStore }) => (
    <div data-testid="mock-app-layout" data-user={JSON.stringify(user)}>
      {children}
    </div>
  ),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>,
  };
});

describe('App Component', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    account: {
      id: 1,
      name: 'Test Account',
      slug: 'test-account',
      users: []
    }
  };

  const mockUserStore = new UserStore();
  mockUserStore.set(mockUser);

  it('should render successfully', () => {
    render(
      <MemoryRouter>
        <App userStore={mockUserStore} />
      </MemoryRouter>
    );

    const appLayout = screen.getByTestId('mock-app-layout');
    expect(appLayout).toBeInTheDocument();
  });

  it('should pass userStore to AppLayout', () => {
    render(
      <MemoryRouter>
        <App userStore={mockUserStore} />
      </MemoryRouter>
    );

    const appLayout = screen.getByTestId('mock-app-layout');
    const passedUserStore = JSON.parse(appLayout.dataset.user || '{}');
    expect(passedUserStore.value).toEqual(mockUser);
  });

  it('should render Outlet content', () => {
    render(
      <MemoryRouter>
        <App userStore={mockUserStore} />
      </MemoryRouter>
    );

    const outlet = screen.getByTestId('mock-outlet');
    expect(outlet).toBeInTheDocument();
    expect(outlet.textContent).toBe('Outlet Content');
  });
});
