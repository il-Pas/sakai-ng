import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService, User } from '../auth/auth.service';

export interface Project {
  id: string;
  name: string;
  code: string;
  address: string;
  coordinates: { lat: number; lng: number };
  structureType: string;
  status: 'planning' | 'installation' | 'monitoring' | 'inactive';
  estimatedValue: number;
  sensorCount: number;
  ownerId: string;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeProjects: number;
  totalSensors: number;
  pendingInvitations: number;
}

export interface UserWithProjects extends User {
  projects: Project[];
  lastAccess: string;
  status: 'active' | 'inactive' | 'pending';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';
  
  // Reactive state
  private usersState = signal<UserWithProjects[]>([]);
  private projectsState = signal<Project[]>([]);
  private statsState = signal<UserStats>({ totalUsers: 0, activeProjects: 0, totalSensors: 0, pendingInvitations: 0 });

  // Public computed signals
  public readonly users = computed(() => this.usersState());
  public readonly projects = computed(() => this.projectsState());
  public readonly stats = computed(() => this.statsState());

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadMockData();
  }

  /**
   * Get users filtered by current user role
   */
  getUsersForCurrentRole(): Observable<UserWithProjects[]> {
    const currentUser = this.authService.user();
    if (!currentUser) return of([]);

    return this.getAllUsers().pipe(
      map(users => this.filterUsersByRole(users, currentUser))
    );
  }

  /**
   * Get projects filtered by current user role
   */
  getProjectsForCurrentRole(): Observable<Project[]> {
    const currentUser = this.authService.user();
    if (!currentUser) return of([]);

    return this.getAllProjects().pipe(
      map(projects => this.filterProjectsByRole(projects, currentUser))
    );
  }

  /**
   * Get statistics for current user role
   */
  getStatsForCurrentRole(): Observable<UserStats> {
    const currentUser = this.authService.user();
    if (!currentUser) return of({ totalUsers: 0, activeProjects: 0, totalSensors: 0, pendingInvitations: 0 });

    return this.getUsersForCurrentRole().pipe(
      map(users => this.calculateStats(users, currentUser))
    );
  }

  /**
   * Filter users based on role hierarchy
   */
  private filterUsersByRole(users: UserWithProjects[], currentUser: User): UserWithProjects[] {
    switch (currentUser.roleLevel) {
      case 1: // Super Admin - sees all users
        return users;
      
      case 2: // Admin - sees users in their organization
        return users.filter(user => 
          user.parentUserId === currentUser.id || 
          user.id === currentUser.id ||
          this.isInSameOrganization(user, currentUser)
        );
      
      case 3: // User+ - sees collaborators in their projects
        return users.filter(user => 
          user.parentUserId === currentUser.id ||
          user.id === currentUser.id ||
          this.hasSharedProjects(user, currentUser)
        );
      
      case 4: // User - sees only themselves
        return users.filter(user => user.id === currentUser.id);
      
      default:
        return [];
    }
  }

  /**
   * Filter projects based on role hierarchy
   */
  private filterProjectsByRole(projects: Project[], currentUser: User): Project[] {
    switch (currentUser.roleLevel) {
      case 1: // Super Admin - sees all projects
        return projects;
      
      case 2: // Admin - sees projects in their organization
        return projects.filter(project => 
          this.isProjectInOrganization(project, currentUser)
        );
      
      case 3: // User+ - sees their own projects
        return projects.filter(project => project.ownerId === currentUser.id);
      
      case 4: // User - sees projects they have access to
        return projects.filter(project => 
          this.hasProjectAccess(project, currentUser)
        );
      
      default:
        return [];
    }
  }

  /**
   * Calculate statistics based on filtered data
   */
  private calculateStats(users: UserWithProjects[], currentUser: User): UserStats {
    const projects = this.projectsState();
    const filteredProjects = this.filterProjectsByRole(projects, currentUser);
    
    return {
      totalUsers: users.length,
      activeProjects: filteredProjects.filter(p => p.status === 'monitoring').length,
      totalSensors: filteredProjects.reduce((sum, p) => sum + p.sensorCount, 0),
      pendingInvitations: users.filter(u => u.status === 'pending').length
    };
  }

  /**
   * Helper methods for role-based filtering
   */
  private isInSameOrganization(user: User, currentUser: User): boolean {
    // Simplified - in real implementation, check organization membership
    return user.parentUserId === currentUser.parentUserId;
  }

  private hasSharedProjects(user: User, currentUser: User): boolean {
    // Simplified - in real implementation, check project collaborations
    return user.roleLevel >= 3;
  }

  private isProjectInOrganization(project: Project, currentUser: User): boolean {
    // Simplified - in real implementation, check organization ownership
    return true;
  }

  private hasProjectAccess(project: Project, currentUser: User): boolean {
    // Simplified - in real implementation, check project permissions
    return project.ownerId === currentUser.id;
  }

  /**
   * API methods (currently mock)
   */
  private getAllUsers(): Observable<UserWithProjects[]> {
    return of(this.usersState());
  }

  private getAllProjects(): Observable<Project[]> {
    return of(this.projectsState());
  }

  /**
   * Load mock data for development
   */
  private loadMockData(): void {
    // Mock projects data
    const mockProjects: Project[] = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Centro Storico Arezzo',
        code: 'L25-0005-xaef43',
        address: 'Piazza Grande, 52100 Arezzo (AR), Italia',
        coordinates: { lat: 43.4648, lng: 11.8846 },
        structureType: 'Edificio in muratura',
        status: 'monitoring',
        estimatedValue: 1000000,
        sensorCount: 15,
        ownerId: '33333333-3333-3333-3333-333333333333',
        createdAt: '2024-12-01T00:00:00Z'
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Condominio Verdi',
        code: 'L25-0006-d0323',
        address: 'Via Giotto, 15, 52100 Arezzo (AR), Italia',
        coordinates: { lat: 43.4598, lng: 11.8756 },
        structureType: 'Edificio in cemento armato',
        status: 'planning',
        estimatedValue: 400000,
        sensorCount: 8,
        ownerId: '33333333-3333-3333-3333-333333333334',
        createdAt: '2024-11-15T00:00:00Z'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Palazzo Uffici Milano',
        code: 'L25-0007-mi001',
        address: 'Via Brera, 10, 20121 Milano (MI), Italia',
        coordinates: { lat: 45.4719, lng: 9.1859 },
        structureType: 'Edificio in cemento armato',
        status: 'monitoring',
        estimatedValue: 2500000,
        sensorCount: 22,
        ownerId: '33333333-3333-3333-3333-333333333333',
        createdAt: '2024-10-01T00:00:00Z'
      }
    ];

    // Mock users data
    const mockUsers: UserWithProjects[] = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@logicatre.it',
        firstName: 'Super',
        lastName: 'Admin',
        roleLevel: 1,
        subscriptionType: 'business',
        isActive: true,
        projects: mockProjects,
        lastAccess: '2024-12-18T16:30:00Z',
        status: 'active'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'admin@whitelabel.com',
        firstName: 'Marco',
        lastName: 'Bianchi',
        roleLevel: 2,
        subscriptionType: 'business',
        parentUserId: '11111111-1111-1111-1111-111111111111',
        isActive: true,
        projects: mockProjects.slice(0, 2),
        lastAccess: '2024-12-18T15:45:00Z',
        status: 'active'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'progettista@studio.it',
        firstName: 'Giovanni',
        lastName: 'Rossi',
        roleLevel: 3,
        subscriptionType: 'plus',
        parentUserId: '22222222-2222-2222-2222-222222222222',
        isActive: true,
        projects: [mockProjects[0], mockProjects[2]],
        lastAccess: '2024-12-18T14:20:00Z',
        status: 'active'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'condominio@email.it',
        firstName: 'Mario',
        lastName: 'Conti',
        roleLevel: 4,
        subscriptionType: 'freemium',
        parentUserId: '33333333-3333-3333-3333-333333333333',
        isActive: true,
        projects: [mockProjects[0]],
        lastAccess: '2024-12-17T10:15:00Z',
        status: 'active'
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        email: 'collaboratore@test.it',
        firstName: 'Alessandro',
        lastName: 'Bianchi',
        roleLevel: 4,
        subscriptionType: 'base',
        parentUserId: '33333333-3333-3333-3333-333333333333',
        isActive: true,
        projects: [mockProjects[1]],
        lastAccess: '2024-12-16T09:30:00Z',
        status: 'pending'
      }
    ];

    this.projectsState.set(mockProjects);
    this.usersState.set(mockUsers);
  }

  /**
   * CRUD operations (mock implementations)
   */
  inviteUser(email: string, roleLevel: number, projectId?: string): Observable<any> {
    // Mock implementation
    console.log('Inviting user:', { email, roleLevel, projectId });
    return of({ success: true, message: 'Invito inviato con successo' });
  }

  updateUserRole(userId: string, newRoleLevel: number): Observable<any> {
    // Mock implementation
    console.log('Updating user role:', { userId, newRoleLevel });
    return of({ success: true, message: 'Ruolo aggiornato con successo' });
  }

  removeUser(userId: string): Observable<any> {
    // Mock implementation
    console.log('Removing user:', userId);
    return of({ success: true, message: 'Utente rimosso con successo' });
  }

  updateUserProjects(userId: string, projectIds: string[]): Observable<any> {
    // Mock implementation
    console.log('Updating user projects:', { userId, projectIds });
    return of({ success: true, message: 'Progetti aggiornati con successo' });
  }
}
