import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleLevel: number; // 1=Super Admin, 2=Admin, 3=User+, 4=User
  subscriptionType: string;
  parentUserId?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api'; // Backend API URL
  private readonly TOKEN_KEY = 'synergy_token';
  private readonly REFRESH_TOKEN_KEY = 'synergy_refresh_token';
  private readonly USER_KEY = 'synergy_user';

  // Reactive state management
  private authState = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  // Public computed signals
  public readonly user = computed(() => this.authState().user);
  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly isLoading = computed(() => this.authState().isLoading);
  public readonly userRole = computed(() => this.authState().user?.roleLevel || 0);
  public readonly isSuperAdmin = computed(() => this.userRole() === 1);
  public readonly isAdmin = computed(() => this.userRole() === 2);
  public readonly isUserPlus = computed(() => this.userRole() === 3);
  public readonly isUser = computed(() => this.userRole() === 4);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState.update(state => ({
          ...state,
          user,
          token,
          isAuthenticated: true
        }));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authState.update(state => ({ ...state, isLoading: true }));

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.authState.update(state => ({
            ...state,
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          }));
        }),
        catchError(error => {
          this.authState.update(state => ({ ...state, isLoading: false }));
          throw error;
        })
      );
  }

  /**
   * Logout user and clear all auth data
   */
  logout(): void {
    // Call backend logout endpoint if needed
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe();
    
    this.clearAuthData();
    this.authState.update(state => ({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    }));
    
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      this.logout();
      return of();
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.authState.update(state => ({
            ...state,
            user: response.user,
            token: response.token
          }));
        }),
        catchError(error => {
          this.logout();
          throw error;
        })
      );
  }

  /**
   * Check if user has required role level or higher
   */
  hasRole(requiredLevel: number): boolean {
    const userLevel = this.userRole();
    return userLevel > 0 && userLevel <= requiredLevel;
  }

  /**
   * Check if user can access specific resource
   */
  canAccess(resource: string, action: 'read' | 'write' | 'admin' = 'read'): boolean {
    const user = this.user();
    if (!user) return false;

    // Super Admin can access everything
    if (user.roleLevel === 1) return true;

    // Add specific permission logic here based on your requirements
    // This is a simplified version - you might want to implement more granular permissions
    switch (resource) {
      case 'projects':
        return user.roleLevel <= 3; // User+ and above can access projects
      case 'sensors':
        return user.roleLevel <= 3; // User+ and above can manage sensors
      case 'algorithms':
        return user.roleLevel <= 3; // User+ and above can use algorithms
      case 'users':
        return user.roleLevel <= 2; // Admin and above can manage users
      case 'system':
        return user.roleLevel === 1; // Only Super Admin can access system settings
      default:
        return user.roleLevel <= 4; // Basic access for all authenticated users
    }
  }

  /**
   * Get dashboard route based on user role
   */
  getDashboardRoute(): string {
    const roleLevel = this.userRole();
    
    // Tutti gli utenti autenticati vanno alla nuova dashboard
    if (roleLevel >= 1 && roleLevel <= 4) {
      return '/dashboard';
    }
    
    return '/auth/login';
  }

  /**
   * Store authentication data in localStorage
   */
  private setAuthData(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.authState().token || localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Mock login for development (remove in production)
   */
  mockLogin(email: string): Observable<LoginResponse> {
    // Mock users based on our seed data
    const mockUsers: { [key: string]: User } = {
      'admin@logicatre.it': {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@logicatre.it',
        firstName: 'Super',
        lastName: 'Admin',
        roleLevel: 1,
        subscriptionType: 'business',
        isActive: true
      },
      'admin@whitelabel.com': {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'admin@whitelabel.com',
        firstName: 'Marco',
        lastName: 'Bianchi',
        roleLevel: 2,
        subscriptionType: 'business',
        parentUserId: '11111111-1111-1111-1111-111111111111',
        isActive: true
      },
      'progettista@studio.it': {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'progettista@studio.it',
        firstName: 'Giovanni',
        lastName: 'Rossi',
        roleLevel: 3,
        subscriptionType: 'plus',
        parentUserId: '22222222-2222-2222-2222-222222222222',
        isActive: true
      },
      'condominio@email.it': {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'condominio@email.it',
        firstName: 'Mario',
        lastName: 'Conti',
        roleLevel: 4,
        subscriptionType: 'freemium',
        parentUserId: '33333333-3333-3333-3333-333333333333',
        isActive: true
      }
    };

    const user = mockUsers[email];
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const mockResponse: LoginResponse = {
      user,
      token: this.generateMockToken(user),
      refreshToken: 'mock_refresh_token',
      expiresIn: 3600
    };

    this.setAuthData(mockResponse);
    this.authState.update(state => ({
      ...state,
      user: mockResponse.user,
      token: mockResponse.token,
      isAuthenticated: true,
      isLoading: false
    }));

    return of(mockResponse);
  }

  /**
   * Generate mock JWT token for development
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.roleLevel,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }
}
