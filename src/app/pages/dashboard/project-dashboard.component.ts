import { Component, OnInit, signal, computed, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

// Services
import { AuthService } from '../../core/auth/auth.service';
import { UserService, Project, UserStats } from '../../core/services/user.service';
import { MessageService } from 'primeng/api';

// Leaflet for map
declare var L: any;

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ChartModule,
    ProgressBarModule,
    MenuModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <!-- Page Header -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="text-2xl font-semibold text-900 mb-2">{{ getDashboardTitle() }}</h2>
              <p class="text-600 text-lg m-0">{{ getDashboardDescription() }}</p>
            </div>
            @if (canCreateProject()) {
              <p-button 
                label="Nuovo Progetto" 
                icon="pi pi-plus" 
                (onClick)="createProject()">
              </p-button>
            }
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">{{ getProjectsLabel() }}</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().activeProjects }}</div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-building text-blue-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">{{ getProjectsGrowth() }} </span>
          <span class="text-muted-color">rispetto al mese scorso</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Sensori Attivi</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalSensors }}</div>
            </div>
            <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-wifi text-orange-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">+{{ getSensorGrowth() }}% </span>
          <span class="text-muted-color">nuovi sensori</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Valore Monitorato</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">€{{ getTotalValue() }}M</div>
            </div>
            <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-euro text-cyan-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">+{{ getValueGrowth() }}% </span>
          <span class="text-muted-color">valore protetto</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">{{ getCollaboratorsLabel() }}</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalUsers }}</div>
            </div>
            <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-users text-purple-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">{{ getUsersGrowth() }} </span>
          <span class="text-muted-color">{{ getUsersGrowthLabel() }}</span>
        </div>
      </div>

      <!-- Map and Projects -->
      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h5 class="m-0">Mappa Progetti</h5>
            <div class="flex gap-2">
              <p-button 
                icon="pi pi-refresh" 
                severity="secondary" 
                size="small" 
                [text]="true"
                (onClick)="refreshMap()">
              </p-button>
              <p-button 
                icon="pi pi-expand" 
                severity="secondary" 
                size="small" 
                [text]="true"
                (onClick)="expandMap()">
              </p-button>
            </div>
          </div>
          
          <!-- Map Container -->
          <div #mapContainer class="border-round overflow-hidden" style="height: 400px; width: 100%;">
            <div class="flex align-items-center justify-content-center h-full bg-gray-50">
              <div class="text-center">
                <i class="pi pi-map text-4xl text-400 mb-3"></i>
                <div class="text-900 text-lg font-medium mb-2">Mappa Progetti</div>
                <div class="text-600">Caricamento mappa in corso...</div>
              </div>
            </div>
          </div>
          
          <!-- Map Legend -->
          <div class="flex justify-content-center gap-4 mt-3">
            <div class="flex align-items-center gap-2">
              <div class="w-1rem h-1rem bg-green-500 border-round"></div>
              <span class="text-sm text-600">Monitoraggio Attivo</span>
            </div>
            <div class="flex align-items-center gap-2">
              <div class="w-1rem h-1rem bg-orange-500 border-round"></div>
              <span class="text-sm text-600">In Installazione</span>
            </div>
            <div class="flex align-items-center gap-2">
              <div class="w-1rem h-1rem bg-blue-500 border-round"></div>
              <span class="text-sm text-600">Pianificazione</span>
            </div>
            <div class="flex align-items-center gap-2">
              <div class="w-1rem h-1rem bg-gray-400 border-round"></div>
              <span class="text-sm text-600">Inattivo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="col-span-12 lg:col-span-4">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">{{ getRecentProjectsTitle() }}</h5>
            <p-button 
              label="Vedi Tutti" 
              severity="secondary" 
              size="small" 
              [text]="true"
              (onClick)="viewAllProjects()">
            </p-button>
          </div>
          
          <div class="flex flex-col gap-3">
            @for (project of recentProjects(); track project.id) {
              <div class="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div class="flex items-center gap-3">
                  <div class="flex items-center justify-center rounded" 
                       [ngClass]="getProjectIconClass(project.status)"
                       style="width:2.5rem;height:2.5rem">
                    <i class="pi pi-building text-white"></i>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 mb-1">{{ project.name }}</div>
                    <div class="text-gray-600 text-sm">{{ project.address.split(',')[0] }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <p-tag 
                    [value]="getStatusLabel(project.status)" 
                    [severity]="getStatusSeverity(project.status)"
                    class="text-xs">
                  </p-tag>
                  <div class="text-gray-600 text-sm mt-1">{{ project.sensorCount }} sensori</div>
                </div>
              </div>
            }
            
            @if (recentProjects().length === 0) {
              <div class="text-center py-4">
                <i class="pi pi-building text-3xl text-gray-400 mb-3"></i>
                <div class="text-gray-600">{{ getNoProjectsMessage() }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Projects Table -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h5 class="m-0">{{ getProjectsTableTitle() }}</h5>
            @if (canManageProjects()) {
              <p-button 
                label="Gestisci Progetti" 
                icon="pi pi-cog" 
                severity="secondary"
                (onClick)="manageProjects()">
              </p-button>
            }
          </div>
          
          <p-table 
            [value]="projects()" 
            [paginator]="true" 
            [rows]="5" 
            [showCurrentPageReport]="true" 
            currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} progetti"
            styleClass="p-datatable-gridlines">
            
            <ng-template pTemplate="header">
              <tr>
                <th>Progetto</th>
                <th>Tipo Struttura</th>
                <th>Stato</th>
                <th>Sensori</th>
                <th>Valore</th>
                <th>Azioni</th>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-project>
              <tr>
                <td>
                  <div>
                    <div class="font-medium text-900">{{ project.name }}</div>
                    <div class="text-600 text-sm">{{ project.code }}</div>
                  </div>
                </td>
                
                <td>
                  <span class="text-900">{{ project.structureType }}</span>
                </td>
                
                <td>
                  <p-tag 
                    [value]="getStatusLabel(project.status)" 
                    [severity]="getStatusSeverity(project.status)">
                  </p-tag>
                </td>
                
                <td>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-wifi text-600"></i>
                    <span class="font-medium">{{ project.sensorCount }}</span>
                  </div>
                </td>
                
                <td>
                  <span class="font-medium">€{{ formatValue(project.estimatedValue) }}</span>
                </td>
                
                <td>
                  <div class="flex gap-2">
                    <p-button 
                      icon="pi pi-eye" 
                      severity="info" 
                      size="small" 
                      [text]="true"
                      (onClick)="viewProject(project)">
                    </p-button>
                    @if (canEditProject(project)) {
                      <p-button 
                        icon="pi pi-pencil" 
                        severity="secondary" 
                        size="small" 
                        [text]="true"
                        (onClick)="editProject(project)">
                      </p-button>
                    }
                  </div>
                </td>
              </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center">
                  <div class="flex flex-column align-items-center justify-content-center py-4">
                    <i class="pi pi-building text-4xl text-400 mb-3"></i>
                    <span class="text-900 text-lg font-medium mb-2">Nessun progetto trovato</span>
                    <span class="text-600">{{ getNoProjectsMessage() }}</span>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <p-toast></p-toast>
  `
})
export class ProjectDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  // Reactive state
  projects = signal<Project[]>([]);
  stats = signal<UserStats>({ totalUsers: 0, activeProjects: 0, totalSensors: 0, pendingInvitations: 0 });
  
  // Computed values
  recentProjects = computed(() => {
    return this.projects()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  });

  private map: any;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Load Leaflet CSS and JS dynamically
    this.loadLeaflet().then(() => {
      setTimeout(() => this.initializeMap(), 100);
    });
  }

  private async loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (typeof L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement || typeof L === 'undefined') return;

    // Initialize map centered on Italy
    this.map = L.map(this.mapContainer.nativeElement).setView([42.5, 12.5], 6);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add project markers
    this.addProjectMarkers();
  }

  private addProjectMarkers(): void {
    if (!this.map) return;

    this.projects().forEach(project => {
      const color = this.getMarkerColor(project.status);
      
      // Create custom marker
      const marker = L.circleMarker([project.coordinates.lat, project.coordinates.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(this.map);

      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h6 class="m-0 mb-2">${project.name}</h6>
          <p class="m-0 text-sm text-600 mb-2">${project.address}</p>
          <div class="flex justify-content-between align-items-center">
            <span class="text-xs bg-${this.getStatusSeverity(project.status)}-100 text-${this.getStatusSeverity(project.status)}-800 px-2 py-1 border-round">
              ${this.getStatusLabel(project.status)}
            </span>
            <span class="text-sm font-medium">${project.sensorCount} sensori</span>
          </div>
        </div>
      `);
    });
  }

  private getMarkerColor(status: string): string {
    switch (status) {
      case 'monitoring': return '#10b981'; // green
      case 'installation': return '#f59e0b'; // orange
      case 'planning': return '#3b82f6'; // blue
      case 'inactive': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  }

  private loadData(): void {
    // Load projects for current role
    this.userService.getProjectsForCurrentRole().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        if (this.map) {
          this.addProjectMarkers();
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nel caricamento dei progetti'
        });
      }
    });

    // Load stats
    this.userService.getStatsForCurrentRole().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  // Dashboard content methods based on user role
  getDashboardTitle(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Dashboard Progetti';

    switch (currentUser.roleLevel) {
      case 1: return 'Dashboard Globale - Tutti i Progetti';
      case 2: return 'Dashboard Organizzazione';
      case 3: return 'Dashboard Progetti';
      case 4: return 'I Miei Progetti';
      default: return 'Dashboard Progetti';
    }
  }

  getDashboardDescription(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return '';

    switch (currentUser.roleLevel) {
      case 1: return 'Panoramica completa di tutti i progetti sulla piattaforma';
      case 2: return 'Gestisci i progetti della tua organizzazione';
      case 3: return 'Monitora e gestisci i tuoi progetti';
      case 4: return 'Visualizza i progetti a cui hai accesso';
      default: return '';
    }
  }

  getProjectsLabel(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Progetti';

    switch (currentUser.roleLevel) {
      case 1: return 'Progetti Totali';
      case 2: return 'Progetti Organizzazione';
      case 3: return 'I Tuoi Progetti';
      case 4: return 'Progetti Accessibili';
      default: return 'Progetti';
    }
  }

  getCollaboratorsLabel(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Utenti';

    switch (currentUser.roleLevel) {
      case 1: return 'Utenti Totali';
      case 2: return 'Team Organizzazione';
      case 3: return 'Collaboratori';
      case 4: return 'Team Progetti';
      default: return 'Utenti';
    }
  }

  getRecentProjectsTitle(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Progetti Recenti';

    switch (currentUser.roleLevel) {
      case 1: return 'Progetti Recenti';
      case 2: return 'Nuovi Progetti';
      case 3: return 'I Tuoi Progetti';
      case 4: return 'Progetti Recenti';
      default: return 'Progetti Recenti';
    }
  }

  getProjectsTableTitle(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Elenco Progetti';

    switch (currentUser.roleLevel) {
      case 1: return 'Tutti i Progetti';
      case 2: return 'Progetti Organizzazione';
      case 3: return 'I Tuoi Progetti';
      case 4: return 'Progetti Accessibili';
      default: return 'Elenco Progetti';
    }
  }

  getNoProjectsMessage(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Nessun progetto disponibile';

    switch (currentUser.roleLevel) {
      case 1: return 'Nessun progetto registrato nella piattaforma';
      case 2: return 'Nessun progetto nella tua organizzazione';
      case 3: return 'Non hai ancora creato progetti';
      case 4: return 'Non hai accesso a nessun progetto';
      default: return 'Nessun progetto disponibile';
    }
  }

  // Permission methods
  canCreateProject(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 3 : false;
  }

  canManageProjects(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 2 : false;
  }

  canEditProject(project: Project): boolean {
    const currentUser = this.authService.user();
    if (!currentUser) return false;
    
    return currentUser.roleLevel <= 2 || project.ownerId === currentUser.id;
  }

  // Statistics calculations
  getProjectsGrowth(): string {
    return '+12%';
  }

  getSensorGrowth(): number {
    return 8;
  }

  getTotalValue(): string {
    const total = this.projects().reduce((sum, p) => sum + p.estimatedValue, 0);
    return (total / 1000000).toFixed(1);
  }

  getValueGrowth(): number {
    return 15;
  }

  getUsersGrowth(): string {
    return '+3';
  }

  getUsersGrowthLabel(): string {
    return 'nuovi utenti';
  }

  // Utility methods
  getStatusLabel(status: string): string {
    switch (status) {
      case 'monitoring': return 'Monitoraggio';
      case 'installation': return 'Installazione';
      case 'planning': return 'Pianificazione';
      case 'inactive': return 'Inattivo';
      default: return status;
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'monitoring': return 'success';
      case 'installation': return 'warning';
      case 'planning': return 'info';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  }

  getProjectIconClass(status: string): string {
    const baseClass = 'flex items-center justify-center rounded';
    switch (status) {
      case 'monitoring': return `${baseClass} bg-green-500`;
      case 'installation': return `${baseClass} bg-orange-500`;
      case 'planning': return `${baseClass} bg-blue-500`;
      case 'inactive': return `${baseClass} bg-gray-400`;
      default: return `${baseClass} bg-gray-400`;
    }
  }

  formatValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }

  // Action methods
  createProject(): void {
    this.router.navigate(['/projects/new']);
  }

  viewProject(project: Project): void {
    console.log('View project:', project);
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: `Visualizzazione progetto ${project.name} in sviluppo`
    });
  }

  editProject(project: Project): void {
    console.log('Edit project:', project);
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: `Modifica progetto ${project.name} in sviluppo`
    });
  }

  manageProjects(): void {
    this.router.navigate(['/user-management']);
  }

  viewAllProjects(): void {
    // Scroll to projects table
    const element = document.querySelector('p-table');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  refreshMap(): void {
    if (this.map) {
      this.map.invalidateSize();
      this.addProjectMarkers();
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Aggiornato',
      detail: 'Mappa aggiornata con successo'
    });
  }

  expandMap(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funzionalità mappa a schermo intero in sviluppo'
    });
  }
}
