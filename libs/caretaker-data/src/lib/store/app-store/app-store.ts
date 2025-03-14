import { action, makeAutoObservable, observable, runInAction } from 'mobx';
import {
  Alert,
  ALERTS_DEFAULT_TIME,
  SidebarItem,
} from '@caretaker/caretaker-types';
import { debounce } from '@mui/material';

export class AppStore {
  sidebarOpen = false;
  sidebarItems: SidebarItem[] = [];
  alert: Alert | null = null;
  alertQueue = new Set<string>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    makeAutoObservable(this, {
      sidebarOpen: observable,
      openSidebar: action,
      closeSidebar: action,
      toggleSidebar: action,
      setSidebarItems: action,
      setAlert: action,
      alert: observable,
      alertQueue: false,
    });
  }

  openSidebar() {
    this.sidebarOpen = true;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setSidebarItems(items: SidebarItem[]) {
    this.sidebarItems = items;
  }

  setAlert(alert: Alert) {
    const debounced = debounce(() => {
      if (this.alert) {
        if (JSON.stringify(this.alert) !== JSON.stringify(alert)) {
          this.alertQueue.add(JSON.stringify(alert));
        }
        return;
      }
      runInAction(() => {
        this.alert = alert;
      });

      const cleanup = () => {
        runInAction(() => {
          this.alert = null;
        });
        const nextAlert = this.getNextAlert();
        if (nextAlert) {
          this.alertQueue.delete(JSON.stringify(nextAlert));
          if (JSON.stringify(nextAlert) !== JSON.stringify(alert)) {
            this.setAlert(nextAlert);
          }
        }
      };

      this.cleanupTimer = setTimeout(
        cleanup,
        alert.clearAfter || ALERTS_DEFAULT_TIME
      );
    }, 150);
    debounced();
  }

  private getNextAlert() {
    try {
      const pendingAlerts = Array.from(this.alertQueue.values());
      return JSON.parse(pendingAlerts[0]) as Alert;
    } catch (error) {
      return null;
    }
  }

  clearAlert() {
    this.alert = null;
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
    const nextAlert = this.getNextAlert();
    if (nextAlert) {
      this.alertQueue.delete(JSON.stringify(nextAlert));
      this.setAlert(nextAlert);
    }
  }
}

export const appStore = new AppStore();
