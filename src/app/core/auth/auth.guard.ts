import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    return this.checkAuth(route, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      // Store the attempted URL for redirecting after login
      localStorage.setItem('synergy_redirect_url', state.url);
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if token is expired
    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      return false;
    }

    // Check role-based access if specified in route data
    const requiredRole = route.data?.['requiredRole'];
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // Redirect to appropriate dashboard based on user role
      this.router.navigate([this.authService.getDashboardRoute()]);
      return false;
    }

    // Check resource-based access if specified in route data
    const requiredResource = route.data?.['requiredResource'];
    const requiredAction = route.data?.['requiredAction'] || 'read';
    if (requiredResource && !this.authService.canAccess(requiredResource, requiredAction)) {
      // Redirect to appropriate dashboard based on user role
      this.router.navigate([this.authService.getDashboardRoute()]);
      return false;
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data?.['requiredRole'];
    
    if (!requiredRole) {
      return true; // No role requirement
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (!this.authService.hasRole(requiredRole)) {
      // Redirect to appropriate dashboard based on user role
      this.router.navigate([this.authService.getDashboardRoute()]);
      return false;
    }

    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // User is already authenticated, redirect to appropriate dashboard
      this.router.navigate([this.authService.getDashboardRoute()]);
      return false;
    }
    
    return true;
  }
}
