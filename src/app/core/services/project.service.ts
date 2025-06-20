import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  code: string;
  address: string;
  coordinates: { lat: number; lng: number };
  structure_type: string;
  destination_use: string;
  construction_year: number;
  seismic_zone: number;
  estimated_value: number;
  average_occupants: number;
  floor_area: number;
  building_data: any;
  risk_class: string;
  comfort_score: number;
  risk_score: number;
  value_score: number;
  status: 'planning' | 'installation' | 'monitoring' | 'inactive';
  owner_id: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields
  total_sensors?: number;
  active_sensors?: number;
  alarms_count?: number;
  thumbnail?: string;
}

export interface ProjectUser {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  granted_by: string;
  granted_at: string;
}

export interface CreateProjectRequest {
  name: string;
  code?: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  structure_type: string;
  destination_use: string;
  construction_year: number;
  seismic_zone: number;
  estimated_value?: number;
  average_occupants?: number;
  floor_area: number;
  building_data: any;
  risk_class?: string;
  status?: string;
}

export interface ProjectFilters {
  status?: string[];
  structure_type?: string[];
  destination_use?: string[];
  risk_class?: string[];
  search?: string;
  owner_id?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = '/api/projects';
  
  // Reactive state
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  // Public observables
  projects$ = this.projectsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  
  // Signals for reactive components
  projects = signal<Project[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Sync observables with signals
    this.projects$.subscribe(projects => this.projects.set(projects));
    this.loading$.subscribe(loading => this.loading.set(loading));
    this.error$.subscribe(error => this.error.set(error));
  }

  /**
   * Get all projects with optional filters
   */
  getProjects(filters?: ProjectFilters): Observable<{ projects: Project[]; total: number; page: number; limit: number }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Simulate loading delay for realistic UX
    return new Observable(observer => {
      setTimeout(() => {
        const mockData = this.getMockProjects(filters);
        
        this.projectsSubject.next(mockData.projects);
        this.loadingSubject.next(false);
        
        observer.next(mockData);
        observer.complete();
      }, 800); // Realistic loading time
    });
  }

  /**
   * Get a single project by ID
   */
  getProject(id: string): Observable<Project> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Simulate loading delay for realistic UX
    return new Observable(observer => {
      setTimeout(() => {
        const project = this.getMockProject(id);
        this.loadingSubject.next(false);
        
        observer.next(project);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Create a new project
   */
  createProject(projectData: CreateProjectRequest): Observable<Project> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<Project>(this.apiUrl, projectData).pipe(
      map(project => {
        // Add to local state
        const currentProjects = this.projectsSubject.value;
        const enrichedProject = {
          ...project,
          thumbnail: this.generateThumbnail(project),
          total_sensors: 0,
          active_sensors: 0,
          alarms_count: 0
        };
        
        this.projectsSubject.next([enrichedProject, ...currentProjects]);
        this.loadingSubject.next(false);
        
        return enrichedProject;
      }),
      catchError(error => {
        console.error('Error creating project:', error);
        this.errorSubject.next('Errore nella creazione del progetto');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Update an existing project
   */
  updateProject(id: string, projectData: Partial<CreateProjectRequest>): Observable<Project> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<Project>(`${this.apiUrl}/${id}`, projectData).pipe(
      map(updatedProject => {
        // Update local state
        const currentProjects = this.projectsSubject.value;
        const index = currentProjects.findIndex(p => p.id === id);
        
        if (index !== -1) {
          const enrichedProject = {
            ...updatedProject,
            thumbnail: this.generateThumbnail(updatedProject),
            total_sensors: currentProjects[index].total_sensors,
            active_sensors: currentProjects[index].active_sensors,
            alarms_count: currentProjects[index].alarms_count
          };
          
          currentProjects[index] = enrichedProject;
          this.projectsSubject.next([...currentProjects]);
        }
        
        this.loadingSubject.next(false);
        return updatedProject;
      }),
      catchError(error => {
        console.error('Error updating project:', error);
        this.errorSubject.next('Errore nell\'aggiornamento del progetto');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        // Remove from local state
        const currentProjects = this.projectsSubject.value;
        const filteredProjects = currentProjects.filter(p => p.id !== id);
        this.projectsSubject.next(filteredProjects);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error deleting project:', error);
        this.errorSubject.next('Errore nell\'eliminazione del progetto');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Get project users
   */
  getProjectUsers(projectId: string): Observable<ProjectUser[]> {
    return this.http.get<ProjectUser[]>(`${this.apiUrl}/${projectId}/users`).pipe(
      catchError(error => {
        console.error('Error fetching project users:', error);
        return of([]);
      })
    );
  }

  /**
   * Add user to project
   */
  addProjectUser(projectId: string, userId: string, role: string): Observable<ProjectUser> {
    return this.http.post<ProjectUser>(`${this.apiUrl}/${projectId}/users`, {
      user_id: userId,
      role: role
    }).pipe(
      catchError(error => {
        console.error('Error adding project user:', error);
        throw error;
      })
    );
  }

  /**
   * Remove user from project
   */
  removeProjectUser(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/users/${userId}`).pipe(
      catchError(error => {
        console.error('Error removing project user:', error);
        throw error;
      })
    );
  }

  /**
   * Get projects statistics
   */
  getProjectsStats(): Observable<{
    total: number;
    by_status: { [key: string]: number };
    by_type: { [key: string]: number };
    by_risk_class: { [key: string]: number };
  }> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching projects stats:', error);
        return of({
          total: 10,
          by_status: { monitoring: 6, planning: 2, installation: 1, inactive: 1 },
          by_type: { 'Edificio in cemento armato': 5, 'Edificio in muratura': 2, 'Prefabbricato': 1, 'Ponte': 1, 'Edificio storico-monumentale': 1 },
          by_risk_class: { A: 4, B: 3, C: 2, D: 1 }
        });
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Refresh projects data
   */
  refreshProjects(filters?: ProjectFilters): void {
    this.getProjects(filters).subscribe();
  }

  /**
   * Generate thumbnail URL for project
   */
  private generateThumbnail(project: Project): string {
    const thumbnails = [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=200&fit=crop'
    ];
    
    // Use project ID to consistently select same thumbnail
    const index = parseInt(project.id.slice(-1), 16) % thumbnails.length;
    return thumbnails[index];
  }

  /**
   * Mock data fallback with filtering support - Based on database seed data
   */
  private getMockProjects(filters?: ProjectFilters): { projects: Project[]; total: number; page: number; limit: number } {
    const allProjects: Project[] = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Centro Storico Arezzo',
        code: 'L25-0005-xaef43',
        address: 'Piazza Grande, 52100 Arezzo (AR), Italia',
        coordinates: { lat: 43.4648, lng: 11.8846 },
        structure_type: 'Edificio in muratura',
        destination_use: 'Residenziale',
        construction_year: 1850,
        seismic_zone: 2,
        estimated_value: 1000000,
        average_occupants: 12,
        floor_area: 450.5,
        building_data: { floors: 4, height_per_floor: 3.2, wall_type: 'muratura_portante', roof_type: 'legno_coppi', foundation: 'pietra' },
        risk_class: 'C',
        comfort_score: 75.5,
        risk_score: 65.2,
        value_score: 85.0,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333333',
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=200&fit=crop',
        total_sensors: 3,
        active_sensors: 3,
        alarms_count: 2
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Condominio Verdi',
        code: 'L25-0006-d0323',
        address: 'Via Giotto, 15, 52100 Arezzo (AR), Italia',
        coordinates: { lat: 43.4598, lng: 11.8756 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Residenziale',
        construction_year: 1975,
        seismic_zone: 2,
        estimated_value: 400000,
        average_occupants: 24,
        floor_area: 800,
        building_data: { floors: 6, height_per_floor: 2.8, wall_type: 'ca_tamponature', roof_type: 'ca_piano', foundation: 'ca_plinti' },
        risk_class: 'B',
        comfort_score: 82.3,
        risk_score: 72.1,
        value_score: 78.5,
        status: 'planning',
        owner_id: '33333333-3333-3333-3333-333333333334',
        created_at: '2024-11-20T00:00:00Z',
        updated_at: '2024-11-20T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=200&fit=crop',
        total_sensors: 0,
        active_sensors: 0,
        alarms_count: 0
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Palazzo Uffici Milano',
        code: 'L25-0007-mi001',
        address: 'Via Brera, 10, 20121 Milano (MI), Italia',
        coordinates: { lat: 45.4719, lng: 9.1859 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Uffici',
        construction_year: 1985,
        seismic_zone: 3,
        estimated_value: 2500000,
        average_occupants: 150,
        floor_area: 1200,
        building_data: { floors: 8, height_per_floor: 3.5, wall_type: 'ca_curtain_wall', roof_type: 'ca_piano', foundation: 'ca_pali' },
        risk_class: 'A',
        comfort_score: 88.7,
        risk_score: 58.9,
        value_score: 92.3,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333333',
        created_at: '2024-11-15T00:00:00Z',
        updated_at: '2024-11-15T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop',
        total_sensors: 3,
        active_sensors: 3,
        alarms_count: 0
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Scuola Elementare Firenze',
        code: 'L25-0008-fi001',
        address: 'Via Dante Alighieri, 25, 50122 Firenze (FI), Italia',
        coordinates: { lat: 43.7696, lng: 11.2558 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Scolastico',
        construction_year: 1968,
        seismic_zone: 3,
        estimated_value: 800000,
        average_occupants: 300,
        floor_area: 1800,
        building_data: { floors: 3, height_per_floor: 3.8, wall_type: 'ca_tamponature', roof_type: 'ca_piano', foundation: 'ca_continue', seismic_upgrade: true },
        risk_class: 'B',
        comfort_score: 79.2,
        risk_score: 68.5,
        value_score: 75.8,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333335',
        created_at: '2024-10-10T00:00:00Z',
        updated_at: '2024-10-10T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=200&fit=crop',
        total_sensors: 8,
        active_sensors: 7,
        alarms_count: 1
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'Ospedale Regionale Siena',
        code: 'L25-0009-si001',
        address: 'Viale Mario Bracci, 16, 53100 Siena (SI), Italia',
        coordinates: { lat: 43.3188, lng: 11.3307 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Sanitario',
        construction_year: 1995,
        seismic_zone: 3,
        estimated_value: 15000000,
        average_occupants: 800,
        floor_area: 8500,
        building_data: { floors: 6, height_per_floor: 4.2, wall_type: 'ca_antisismico', roof_type: 'ca_piano', foundation: 'ca_pali', isolation_system: true },
        risk_class: 'A',
        comfort_score: 92.5,
        risk_score: 45.2,
        value_score: 98.7,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333336',
        created_at: '2024-09-15T00:00:00Z',
        updated_at: '2024-09-15T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=200&fit=crop',
        total_sensors: 15,
        active_sensors: 14,
        alarms_count: 0
      },
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Chiesa di San Miniato',
        code: 'L25-0010-sg001',
        address: 'Piazza del Duomo, 2, 53037 San Gimignano (SI), Italia',
        coordinates: { lat: 43.4674, lng: 11.0431 },
        structure_type: 'Edificio storico-monumentale',
        destination_use: 'Pubblico',
        construction_year: 1200,
        seismic_zone: 3,
        estimated_value: 5000000,
        average_occupants: 100,
        floor_area: 650,
        building_data: { floors: 1, height_per_floor: 12.0, wall_type: 'muratura_pietra', roof_type: 'legno_capriate', foundation: 'pietra', historical_value: 'alto' },
        risk_class: 'D',
        comfort_score: 65.8,
        risk_score: 85.3,
        value_score: 95.2,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333337',
        created_at: '2024-08-20T00:00:00Z',
        updated_at: '2024-08-20T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=200&fit=crop',
        total_sensors: 6,
        active_sensors: 5,
        alarms_count: 3
      },
      {
        id: 'gggggggg-gggg-gggg-gggg-gggggggggggg',
        name: 'Torre Uffici Roma',
        code: 'L25-0011-rm001',
        address: 'Via del Corso, 300, 00186 Roma (RM), Italia',
        coordinates: { lat: 41.9028, lng: 12.4814 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Uffici',
        construction_year: 2010,
        seismic_zone: 3,
        estimated_value: 8500000,
        average_occupants: 400,
        floor_area: 2200,
        building_data: { floors: 15, height_per_floor: 3.2, wall_type: 'ca_curtain_wall', roof_type: 'ca_piano', foundation: 'ca_pali', green_building: true },
        risk_class: 'A',
        comfort_score: 94.1,
        risk_score: 42.8,
        value_score: 96.5,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333338',
        created_at: '2024-07-10T00:00:00Z',
        updated_at: '2024-07-10T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop',
        total_sensors: 12,
        active_sensors: 12,
        alarms_count: 0
      },
      {
        id: 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        name: 'Stabilimento Industriale Prato',
        code: 'L25-0012-po001',
        address: 'Via dell\'Industria, 45, 59100 Prato (PO), Italia',
        coordinates: { lat: 43.8777, lng: 11.0948 },
        structure_type: 'Prefabbricato',
        destination_use: 'Industriale',
        construction_year: 1988,
        seismic_zone: 3,
        estimated_value: 1200000,
        average_occupants: 80,
        floor_area: 3500,
        building_data: { floors: 2, height_per_floor: 6.0, wall_type: 'prefabbricato_ca', roof_type: 'shed_industriale', foundation: 'ca_plinti', crane_capacity: '10t' },
        risk_class: 'C',
        comfort_score: 71.4,
        risk_score: 62.7,
        value_score: 68.9,
        status: 'installation',
        owner_id: '33333333-3333-3333-3333-333333333335',
        created_at: '2024-06-15T00:00:00Z',
        updated_at: '2024-06-15T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=200&fit=crop',
        total_sensors: 4,
        active_sensors: 2,
        alarms_count: 1
      },
      {
        id: 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
        name: 'Ponte Autostradale A1',
        code: 'L25-0013-a1001',
        address: 'Autostrada A1, km 285+400, Arezzo (AR), Italia',
        coordinates: { lat: 43.4123, lng: 11.8234 },
        structure_type: 'Ponte',
        destination_use: 'Pubblico',
        construction_year: 1975,
        seismic_zone: 2,
        estimated_value: 3500000,
        average_occupants: 0,
        floor_area: 1200,
        building_data: { spans: 3, total_length: 120.0, deck_type: 'ca_precompresso', pier_type: 'ca_pile', foundation: 'ca_pali', traffic_load: 'A1' },
        risk_class: 'B',
        comfort_score: 0.0,
        risk_score: 78.5,
        value_score: 82.3,
        status: 'monitoring',
        owner_id: '33333333-3333-3333-3333-333333333336',
        created_at: '2024-05-20T00:00:00Z',
        updated_at: '2024-05-20T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=200&fit=crop',
        total_sensors: 10,
        active_sensors: 9,
        alarms_count: 2
      },
      {
        id: 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
        name: 'Condominio Moderno Arezzo',
        code: 'L25-0014-ar002',
        address: 'Via Fiorentina, 88, 52100 Arezzo (AR), Italia',
        coordinates: { lat: 43.4512, lng: 11.8645 },
        structure_type: 'Edificio in cemento armato',
        destination_use: 'Residenziale',
        construction_year: 2005,
        seismic_zone: 2,
        estimated_value: 1800000,
        average_occupants: 45,
        floor_area: 1350,
        building_data: { floors: 5, height_per_floor: 3.0, wall_type: 'ca_isolamento', roof_type: 'ca_piano', foundation: 'ca_plinti', energy_class: 'A' },
        risk_class: 'A',
        comfort_score: 89.3,
        risk_score: 48.7,
        value_score: 87.6,
        status: 'planning',
        owner_id: '33333333-3333-3333-3333-333333333334',
        created_at: '2024-04-10T00:00:00Z',
        updated_at: '2024-04-10T00:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=200&fit=crop',
        total_sensors: 0,
        active_sensors: 0,
        alarms_count: 0
      }
    ];

    // Apply filters
    let filteredProjects = allProjects;

    if (filters) {
      if (filters.owner_id) {
        filteredProjects = filteredProjects.filter(p => p.owner_id === filters.owner_id);
      }
      
      if (filters.status?.length) {
        filteredProjects = filteredProjects.filter(p => filters.status!.includes(p.status));
      }
      
      if (filters.structure_type?.length) {
        filteredProjects = filteredProjects.filter(p => filters.structure_type!.includes(p.structure_type));
      }
      
      if (filters.destination_use?.length) {
        filteredProjects = filteredProjects.filter(p => filters.destination_use!.includes(p.destination_use));
      }
      
      if (filters.risk_class?.length) {
        filteredProjects = filteredProjects.filter(p => filters.risk_class!.includes(p.risk_class));
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower) ||
          p.code.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return {
      projects: paginatedProjects,
      total: filteredProjects.length,
      page: page,
      limit: limit
    };
  }

  private getMockProject(id: string): Project {
    const allProjects = this.getMockProjects().projects;
    return allProjects.find(p => p.id === id) || allProjects[0];
  }
}
