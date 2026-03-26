import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { MOCK_USER } from '../mocks/user.mock';

const STORAGE_KEY = 'bauconect-demo-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userSignal = signal<User | null>(this.readStoredUser());

  readonly user = computed(() => this.userSignal());

  login(): User {
    this.userSignal.set(MOCK_USER);
    this.persistUser(MOCK_USER);
    return MOCK_USER;
  }

  logout(): void {
    this.userSignal.set(null);
    this.clearStoredUser();
  }

  isAuthenticated(): boolean {
    return this.userSignal() !== null;
  }

  currentUser(): User | null {
    return this.userSignal();
  }

  private readStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const rawUser = localStorage.getItem(STORAGE_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private persistUser(user: User): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private clearStoredUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }
}
