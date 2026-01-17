import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    roles?: string[];
    name?: string;
    lastname?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'app_auth_token';
  private userKey = 'app_auth_user';
  private authState$ = new BehaviorSubject<boolean>(this.hasToken());

  login(payload: { username: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/user/login`, payload)
      .pipe(
        tap((res) => {
          this.setSession(res);
          this.authState$.next(true);
        }),
        map(() => void 0)
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState$.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  authChanges() {
    return this.authState$.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
