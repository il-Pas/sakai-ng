import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard, NoAuthGuard } from './app/core/auth/auth.guard';

export const appRoutes: Routes = [
    // Redirect root to dashboard (will redirect to login if not authenticated)
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    
    // Protected routes with authentication
    {
        path: 'dashboard',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
                data: { requiredRole: 4 } // All authenticated users can access basic dashboard
            }
        ]
    },

    // Projects routes
    {
        path: 'projects',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/projects/projects.component').then(m => m.ProjectsComponent),
                data: { requiredRole: 4 } // All authenticated users can view projects
            },
            { 
                path: ':id/building', 
                loadComponent: () => import('./app/pages/building-detail/building-detail.component').then(m => m.BuildingDetailComponent),
                data: { requiredRole: 4 } // All authenticated users can view building details
            },
            { 
                path: 'new', 
                loadComponent: () => import('./app/pages/project-registration/project-registration-wizard.component').then(m => m.ProjectRegistrationWizardComponent),
                data: { requiredRole: 3 } // User+ and above can create projects
            }
        ]
    },

    // Tools routes
    {
        path: 'tools',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/tools/tools.component').then(m => m.ToolsComponent),
                data: { requiredRole: 3 } // User+ and above
            }
        ]
    },

    // Reports routes
    {
        path: 'reports',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/reports/reports.component').then(m => m.ReportsComponent),
                data: { requiredRole: 4 } // All authenticated users
            }
        ]
    },

    // Analytics routes
    {
        path: 'analytics',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
                data: { requiredRole: 4 } // All authenticated users
            }
        ]
    },
    
    // User Management routes
    {
        path: 'user-management',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: '', 
                loadComponent: () => import('./app/pages/user-management/user-management.component').then(m => m.UserManagementComponent),
                data: { requiredRole: 3 } // User+ and above
            }
        ]
    },

    // Settings routes
    {
        path: 'settings',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: 'profile', 
                loadComponent: () => import('./app/pages/dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
                data: { requiredRole: 4 } // All authenticated users
            },
            { 
                path: 'preferences', 
                loadComponent: () => import('./app/pages/dashboard/project-dashboard.component').then(m => m.ProjectDashboardComponent),
                data: { requiredRole: 4 } // All authenticated users
            }
        ]
    },
    
    // Admin routes
    {
        path: 'admin',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: 'dashboard', 
                component: Dashboard,
                data: { requiredRole: 1 } // Super Admin only
            },
            { 
                path: 'projects', 
                component: Dashboard,
                data: { requiredRole: 2 } // Admin and above
            }
        ]
    },
    
    // Other protected routes
    {
        path: 'app',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { 
                path: 'uikit', 
                loadChildren: () => import('./app/pages/uikit/uikit.routes'),
                data: { requiredRole: 3 } // User+ and above
            },
            { 
                path: 'documentation', 
                component: Documentation,
                data: { requiredRole: 4 } // All authenticated users
            },
            { 
                path: 'pages', 
                loadChildren: () => import('./app/pages/pages.routes'),
                data: { requiredRole: 3 } // User+ and above
            }
        ]
    },
    
    // Public routes
    { 
        path: 'landing', 
        component: Landing 
    },
    
    // Auth routes (only accessible when not authenticated)
    { 
        path: 'auth', 
        loadChildren: () => import('./app/pages/auth/auth.routes'),
        canActivate: [NoAuthGuard]
    },
    
    // Error routes
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
