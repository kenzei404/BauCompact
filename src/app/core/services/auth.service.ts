import { computed, inject, Injectable, Signal } from '@angular/core';
import { APP_DATA_SOURCE } from '../firebase/firebase.config';
import { User } from '../models/user.model';
import { MockAuthStoreService } from './mock-auth-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly dataSource = inject(APP_DATA_SOURCE);
  private readonly mockStore = inject(MockAuthStoreService);
  private readonly source = this.resolveSource();

  readonly user: Signal<User | null> = computed(() => this.source.user());

  login(): User {
    return this.source.login();
  }

  logout(): void {
    this.source.logout();
  }

  isAuthenticated(): boolean {
    return this.source.isAuthenticated();
  }

  currentUser(): User | null {
    return this.source.currentUser();
  }

  private resolveSource(): MockAuthStoreService {
    if (this.dataSource === 'firebase') {
      return this.mockStore;
    }

    return this.mockStore;
  }
}
