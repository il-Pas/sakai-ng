import { Component, OnInit, ViewChild, ElementRef, signal, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TimelineModule } from 'primeng/timeline';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MessageService, MenuItem } from 'primeng/api';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FluidModule } from 'primeng/fluid';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

// Services
import { ProjectService, Project, ProjectFilters } from '../../core/services/project.service';
import { AuthService } from '../../core/auth/auth.service';

// Leaflet for map
declare var L: any;

interface Activity {
  id: string;
  projectId: string;
  projectName: string;
  type: 'alarm' | 'maintenance' | 'update' | 'sensor';
  message: string;
  timestamp: Date;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalSensors: number;
  activeSensors: number;
  totalAlarms: number;
  criticalAlarms: number;
  totalValue: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    DataViewModule,
    DividerModule,
    CarouselModule,
    ChartModule,
    ProgressBarModule,
    TimelineModule,
    MenuModule,
    ToastModule,
    ToggleButtonModule,
    BadgeModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    FluidModule,
    TooltipModule,
    SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <!-- Page Header -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="text-2xl font-semibold text-900 mb-2">I Miei Progetti</h2>
              <p class="text-600 text-lg m-0">Gestisci e monitora tutti i tuoi progetti di monitoraggio strutturale</p>
            </div>
            <div class="flex gap-2">
              <p-button 
                label="Nuovo Progetto" 
                icon="pi pi-plus"
                routerLink="/projects/new">
              </p-button>
              <p-button 
                label="Export Dati" 
                icon="pi pi-download"
                severity="secondary"
                [outlined]="true"
                (click)="exportAllData()">
              </p-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Progetti Totali</span>
              @if (projectService.loading()) {
                <p-skeleton width="3rem" height="1.5rem"></p-skeleton>
              } @else {
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalProjects }}</div>
              }
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-building text-blue-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">{{ stats().activeProjects }} attivi</span>
          <span class="text-muted-color"> su {{ stats().totalProjects }}</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Sensori Attivi</span>
              @if (projectService.loading()) {
                <p-skeleton width="4rem" height="1.5rem"></p-skeleton>
              } @else {
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().activeSensors }}/{{ stats().totalSensors }}</div>
              }
            </div>
            <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-wifi text-orange-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">{{ getSensorPercentage() }}% </span>
          <span class="text-muted-color">online</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Allarmi</span>
              @if (projectService.loading()) {
                <p-skeleton width="2rem" height="1.5rem"></p-skeleton>
              } @else {
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalAlarms }}</div>
              }
            </div>
            <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-bell text-red-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-red-500 font-medium">{{ stats().criticalAlarms }} critici</span>
          <span class="text-muted-color"> attivi</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Valore Monitorato</span>
              @if (projectService.loading()) {
                <p-skeleton width="4rem" height="1.5rem"></p-skeleton>
              } @else {
                <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">€{{ formatValue(stats().totalValue) }}M</div>
              }
            </div>
            <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-euro text-green-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">Patrimonio protetto</span>
        </div>
      </div>

      <!-- Error Message -->
      @if (projectService.error()) {
        <div class="col-span-12">
          <div class="card bg-red-50 border-red-200">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-exclamation-triangle text-red-500 text-xl"></i>
              <div>
                <div class="font-medium text-red-900">Errore nel caricamento</div>
                <div class="text-red-700 text-sm">{{ projectService.error() }}</div>
              </div>
              <p-button 
                label="Riprova" 
                icon="pi pi-refresh"
                size="small"
                severity="danger"
                [outlined]="true"
                (click)="refreshProjects()"
                class="ml-auto">
              </p-button>
            </div>
          </div>
        </div>
      }

      <!-- View Controls -->
      <div class="col-span-12">
        <div class="card flex flex-col gap-4">
          <div class="font-semibold text-xl">Controlli Vista e Filtri</div>
          
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex gap-2">
              <p-toggleButton 
                [(ngModel)]="showCarouselView"
                onLabel="Carosello" 
                offLabel="Griglia"
                onIcon="pi pi-th-large" 
                offIcon="pi pi-list">
              </p-toggleButton>
              <p-toggleButton 
                [(ngModel)]="showMapView"
                onLabel="Mappa" 
                offLabel="Nascosta"
                onIcon="pi pi-map" 
                offIcon="pi pi-eye-slash">
              </p-toggleButton>
            </div>
            
            <div class="flex flex-col md:flex-row gap-4 flex-1">
              <p-iconfield class="flex-1">
                <p-inputicon class="pi pi-search" />
                <input 
                  pInputText 
                  type="text" 
                  placeholder="Cerca progetti..." 
                  [(ngModel)]="searchTerm"
                  (input)="filterProjects()" />
              </p-iconfield>
              
              <p-dropdown 
                [options]="statusOptions"
                [(ngModel)]="selectedStatus"
                (onChange)="filterProjects()"
                placeholder="Filtra per stato"
                optionLabel="label"
                optionValue="value"
                [style]="{ 'min-width': '12rem' }">
              </p-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Content -->
      <div class="col-span-12">
        
        <!-- Loading State -->
        @if (projectService.loading()) {
          <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
              <p-skeleton width="8rem" height="1.5rem"></p-skeleton>
              <p-skeleton width="6rem" height="2rem"></p-skeleton>
            </div>
            
            <div class="grid">
              @for (item of [1,2,3,4]; track item) {
                <div class="col-12 md:col-6">
                  <div class="border border-gray-200 rounded p-3 mb-3">
                    <div class="flex justify-content-between align-items-start mb-3">
                      <div class="flex-1">
                        <p-skeleton width="10rem" height="1.2rem" class="mb-2"></p-skeleton>
                        <p-skeleton width="8rem" height="1rem"></p-skeleton>
                      </div>
                      <p-skeleton width="4rem" height="1.5rem"></p-skeleton>
                    </div>
                    <p-skeleton width="100%" height="8rem" class="mb-3"></p-skeleton>
                    <div class="flex justify-content-between align-items-center mb-3">
                      <p-skeleton width="3rem" height="1rem"></p-skeleton>
                      <p-skeleton width="3rem" height="1rem"></p-skeleton>
                      <p-skeleton width="3rem" height="1rem"></p-skeleton>
                    </div>
                    <div class="flex gap-2">
                      <p-skeleton width="100%" height="2rem"></p-skeleton>
                      <p-skeleton width="3rem" height="2rem"></p-skeleton>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Projects Carousel -->
        @if (!projectService.loading() && showCarouselView) {
          <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="m-0">I Tuoi Progetti</h5>
              <p-tag [value]="filteredProjects().length + ' progetti'" severity="info"></p-tag>
            </div>
            
            @if (filteredProjects().length > 0) {
              <p-carousel 
                [value]="filteredProjects()" 
                [numVisible]="2" 
                [numScroll]="1"
                [responsiveOptions]="carouselResponsiveOptions"
                [circular]="true"
                [autoplayInterval]="5000">
                
                <ng-template let-project pTemplate="item">
                  <div class="p-2">
                    <div class="border border-gray-200 rounded p-3 cursor-pointer hover:shadow-md transition-all"
                         (click)="openProject(project)">
                      
                      <!-- Project Header -->
                      <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                          <h6 class="text-900 font-medium mb-1">{{ project.name }}</h6>
                          <p class="text-600 text-sm m-0">{{ project.structure_type }}</p>
                        </div>
                        <p-tag 
                          [value]="getStatusLabel(project.status)" 
                          [severity]="getStatusSeverity(project.status)"
                          class="ml-2">
                        </p-tag>
                      </div>
                      
                      <!-- Project Image -->
                      <img 
                        [src]="project.thumbnail" 
                        [alt]="project.name"
                        class="w-full h-8rem object-cover border-round mb-3">
                      
                      <!-- Project Stats -->
                      <div class="flex justify-content-between align-items-center mb-3">
                        <div class="text-center">
                          <div class="text-900 font-medium">{{ project.active_sensors }}/{{ project.total_sensors }}</div>
                          <div class="text-600 text-xs">Sensori</div>
                        </div>
                        <div class="text-center">
                          <div class="text-900 font-medium" [class]="project.alarms_count && project.alarms_count > 0 ? 'text-red-500' : 'text-green-500'">
                            {{ project.alarms_count || 0 }}
                          </div>
                          <div class="text-600 text-xs">Allarmi</div>
                        </div>
                        <div class="text-center">
                          <div class="text-900 font-medium" [class]="getHealthColor(project.comfort_score)">
                            {{ project.comfort_score }}%
                          </div>
                          <div class="text-600 text-xs">Salute</div>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2">
                        <p-button 
                          label="Apri" 
                          icon="pi pi-external-link"
                          size="small"
                          class="flex-1"
                          (click)="openProject(project); $event.stopPropagation()">
                        </p-button>
                        <p-button 
                          icon="pi pi-cog" 
                          size="small"
                          [outlined]="true"
                          (click)="configureProject(project); $event.stopPropagation()">
                        </p-button>
                      </div>
                    </div>
                  </div>
                </ng-template>
              </p-carousel>
            } @else {
              <div class="text-center py-8">
                <i class="pi pi-building text-4xl text-400 mb-3"></i>
                <div class="text-900 text-lg font-medium mb-2">Nessun progetto trovato</div>
                <div class="text-600">Modifica i filtri o crea un nuovo progetto</div>
              </div>
            }
          </div>
        }

        <!-- Projects Grid -->
        @if (!projectService.loading() && !showCarouselView) {
          <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="m-0">Lista Progetti</h5>
              <p-tag [value]="filteredProjects().length + ' progetti'" severity="info"></p-tag>
            </div>
            
            @if (filteredProjects().length > 0) {
              <div class="grid">
                @for (project of filteredProjects(); track project.id) {
                  <div class="col-12 md:col-6">
                    <div class="border border-gray-200 rounded p-3 cursor-pointer hover:shadow-md transition-all mb-3"
                         (click)="openProject(project)">
                      
                      <!-- Project Header -->
                      <div class="flex justify-content-between align-items-start mb-3">
                        <div class="flex-1">
                          <h6 class="text-900 font-medium mb-1">{{ project.name }}</h6>
                          <p class="text-600 text-sm m-0">{{ project.structure_type }}</p>
                        </div>
                        <p-tag 
                          [value]="getStatusLabel(project.status)" 
                          [severity]="getStatusSeverity(project.status)"
                          class="ml-2">
                        </p-tag>
                      </div>
                      
                      <!-- Project Image -->
                      <img 
                        [src]="project.thumbnail" 
                        [alt]="project.name"
                        class="w-full h-8rem object-cover border-round mb-3">
                      
                      <!-- Project Stats -->
                      <div class="flex justify-content-between align-items-center mb-3">
                        <div class="text-center">
                          <div class="text-900 font-medium">{{ project.active_sensors }}/{{ project.total_sensors }}</div>
                          <div class="text-600 text-xs">Sensori</div>
                        </div>
                        <div class="text-center">
                          <div class="text-900 font-medium" [class]="project.alarms_count && project.alarms_count > 0 ? 'text-red-500' : 'text-green-500'">
                            {{ project.alarms_count || 0 }}
                          </div>
                          <div class="text-600 text-xs">Allarmi</div>
                        </div>
                        <div class="text-center">
                          <div class="text-900 font-medium" [class]="getHealthColor(project.comfort_score)">
                            {{ project.comfort_score }}%
                          </div>
                          <div class="text-600 text-xs">Salute</div>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2">
                        <p-button 
                          label="Apri" 
                          icon="pi pi-external-link"
                          size="small"
                          class="flex-1"
                          (click)="openProject(project); $event.stopPropagation()">
                        </p-button>
                        <p-button 
                          icon="pi pi-cog" 
                          size="small"
                          [outlined]="true"
                          (click)="configureProject(project); $event.stopPropagation()">
                        </p-button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <i class="pi pi-building text-4xl text-400 mb-3"></i>
                <div class="text-900 text-lg font-medium mb-2">Nessun progetto trovato</div>
                <div class="text-600">Modifica i filtri o crea un nuovo progetto</div>
              </div>
            }
          </div>
        }

        <!-- Interactive Map -->
        @if (showMapView && !projectService.loading()) {
          <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="m-0">Mappa Progetti</h5>
              <div class="flex gap-2">
                <p-button 
                  icon="pi pi-refresh" 
                  severity="secondary" 
                  size="small" 
                  [text]="true"
                  (click)="refreshMap()">
                </p-button>
                <p-button 
                  icon="pi pi-expand" 
                  severity="secondary" 
                  size="small" 
                  [text]="true"
                  (click)="expandMap()">
                </p-button>
              </div>
            </div>
            
            <!-- Map Container -->
            <div #mapContainer class="border-round overflow-hidden mb-3" style="height: 400px; width: 100%;">
              <div class="flex align-items-center justify-content-center h-full bg-gray-50">
                <div class="text-center">
                  <i class="pi pi-map text-4xl text-400 mb-3"></i>
                  <div class="text-900 text-lg font-medium mb-2">Mappa Progetti</div>
                  <div class="text-600">Caricamento mappa in corso...</div>
                </div>
              </div>
            </div>
            
            <!-- Map Legend -->
            <div class="flex justify-content-center gap-4">
              <div class="flex align-items-center gap-2">
                <div class="w-1rem h-1rem bg-green-500 border-round"></div>
                <span class="text-sm text-600">Monitoraggio</span>
              </div>
              <div class="flex align-items-center gap-2">
                <div class="w-1rem h-1rem bg-orange-500 border-round"></div>
                <span class="text-sm text-600">Installazione</span>
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
        }
      </div>

      <!-- Projects Table -->
      @if (!projectService.loading()) {
        <div class="col-span-12">
          <div class="card">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="m-0">Tutti i Progetti</h5>
              <p-button 
                label="Gestisci Progetti" 
                icon="pi pi-cog" 
                severity="secondary"
                (click)="manageProjects()">
              </p-button>
            </div>
            
            <p-table 
              [value]="filteredProjects()" 
              [paginator]="true" 
              [rows]="5" 
              [showCurrentPageReport]="true" 
              currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} progetti"
              styleClass="p-datatable-gridlines">
              
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 25%">Progetto</th>
                  <th style="width: 15%">Tipo</th>
                  <th style="width: 12%">Stato</th>
                  <th style="width: 12%">Sensori</th>
                  <th style="width: 10%">Allarmi</th>
                  <th style="width: 12%">Valore</th>
                  <th style="width: 14%">Azioni</th>
                </tr>
              </ng-template>
              
              <ng-template pTemplate="body" let-project>
                <tr>
                  <td style="width: 25%">
                    <div class="flex align-items-center gap-3">
                      <img [src]="project.thumbnail" [alt]="project.name" class="w-3rem h-3rem object-cover border-round flex-shrink-0">
                      <div class="overflow-hidden">
                        <div class="font-medium text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">{{ project.name }}</div>
                        <div class="text-600 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">{{ project.address.split(',')[0] }}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td style="width: 15%">
                    <span class="text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis block">{{ project.structure_type }}</span>
                  </td>
                  
                  <td style="width: 12%">
                    <p-tag 
                      [value]="getStatusLabel(project.status)" 
                      [severity]="getStatusSeverity(project.status)">
                    </p-tag>
                  </td>
                  
                  <td style="width: 12%">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-wifi text-600 flex-shrink-0"></i>
                      <span class="font-medium white-space-nowrap">{{ project.active_sensors }}/{{ project.total_sensors }}</span>
                    </div>
                  </td>
                  
                  <td style="width: 10%">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-bell flex-shrink-0" [class]="project.alarms_count && project.alarms_count > 0 ? 'text-red-500' : 'text-green-500'"></i>
                      <span class="font-medium white-space-nowrap" [class]="project.alarms_count && project.alarms_count > 0 ? 'text-red-500' : 'text-green-500'">
                        {{ project.alarms_count || 0 }}
                      </span>
                    </div>
                  </td>
                  
                  <td style="width: 12%">
                    <span class="font-medium white-space-nowrap">€{{ formatValue(project.estimated_value) }}M</span>
                  </td>
                  
                  <td style="width: 14%">
                    <div class="flex gap-1">
                      <p-button 
                        icon="pi pi-eye" 
                        severity="info" 
                        size="small" 
                        [text]="true"
                        [pTooltip]="'Visualizza'"
                        tooltipPosition="top"
                        (click)="openProject(project)">
                      </p-button>
                      <p-button 
                        icon="pi pi-cog" 
                        severity="secondary" 
                        size="small" 
                        [text]="true"
                        [pTooltip]="'Configura'"
                        tooltipPosition="top"
                        (click)="configureProject(project)">
                      </p-button>
                      <p-button 
                        icon="pi pi-ellipsis-v" 
                        severity="secondary" 
                        size="small" 
                        [text]="true"
                        [pTooltip]="'Menu'"
                        tooltipPosition="top"
                        (click)="showProjectMenu($event, project)">
                      </p-button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center">
                    <div class="flex flex-column align-items-center justify-content-center py-4">
                      <i class="pi pi-building text-4xl text-400 mb-3"></i>
                      <span class="text-900 text-lg font-medium mb-2">Nessun progetto trovato</span>
                      <span class="text-600">Inizia creando il tuo primo progetto</span>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      }
    </div>

    <!-- Project Context Menu -->
    <p-menu #projectMenu [model]="projectMenuItems" [popup]="true"></p-menu>

    <!-- Toast Messages -->
    <p-toast></p-toast>
  `
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @ViewChild('projectMenu', { static: false }) projectMenu!: any;

  // Reactive state
  filteredProjects = signal<Project[]>([]);
  stats = signal<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalSensors: 0,
    activeSensors: 0,
    totalAlarms: 0,
    criticalAlarms: 0,
    totalValue: 0
  });

  // View state
  searchTerm: string = '';
  selectedStatus: string = '';
  showCarouselView: boolean = true;
  showMapView: boolean = true;

  // Options
  statusOptions = [
    { label: 'Tutti gli stati', value: '' },
    { label: 'Monitoraggio', value: 'monitoring' },
    { label: 'Pianificazione', value: 'planning' },
    { label: 'Installazione', value: 'installation' },
    { label: 'Inattivo', value: 'inactive' }
  ];

  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  projectMenuItems: MenuItem[] = [
    {
      label: 'Apri Dashboard',
      icon: 'pi pi-external-link',
      command: () => this.openProject(this.selectedProject)
    },
    {
      label: 'Configurazioni',
      icon: 'pi pi-cog',
      command: () => this.configureProject(this.selectedProject)
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-line',
      command: () => this.viewAnalytics(this.selectedProject)
    },
    {
      label: 'Report',
      icon: 'pi pi-file-pdf',
      command: () => this.generateProjectReport(this.selectedProject)
    },
    { separator: true },
    {
      label: 'Modifica',
      icon: 'pi pi-pencil',
      command: () => this.editProject(this.selectedProject)
    }
  ];

  private selectedProject!: Project;
  private map: any;
  private subscriptions: Subscription[] = [];

  constructor(
    public projectService: ProjectService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngAfterViewInit(): void {
    if (this.showMapView) {
      this.loadLeaflet().then(() => {
        setTimeout(() => this.initializeMap(), 100);
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private loadProjects(): void {
    const filters: ProjectFilters = {
      owner_id: this.authService.user()?.id
    };

    const sub = this.projectService.getProjects(filters).subscribe({
      next: (response) => {
        this.filteredProjects.set(response.projects);
        this.calculateStats(response.projects);
        
        // Update map if visible
        if (this.showMapView && this.map) {
          this.addProjectMarkers();
        }
      },
      error: (error) => {
        console.error('Error loading projects:', error);
      }
    });

    this.subscriptions.push(sub);
  }

  private calculateStats(projects: Project[]): void {
    const stats: ProjectStats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'monitoring').length,
      totalSensors: projects.reduce((sum, p) => sum + (p.total_sensors || 0), 0),
      activeSensors: projects.reduce((sum, p) => sum + (p.active_sensors || 0), 0),
      totalAlarms: projects.reduce((sum, p) => sum + (p.alarms_count || 0), 0),
      criticalAlarms: projects.filter(p => (p.alarms_count || 0) > 1).length,
      totalValue: projects.reduce((sum, p) => sum + p.estimated_value, 0)
    };

    this.stats.set(stats);
  }

  private async loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

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

    this.map = L.map(this.mapContainer.nativeElement).setView([43.4648, 11.8846], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addProjectMarkers();
  }

  private addProjectMarkers(): void {
    if (!this.map) return;

    this.filteredProjects().forEach(project => {
      if (project.coordinates) {
        const color = this.getMarkerColor(project.status);
        
        const marker = L.circleMarker([project.coordinates.lat, project.coordinates.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map);

        marker.bindPopup(`
          <div class="p-2">
            <h6 class="m-0 mb-2">${project.name}</h6>
            <p class="m-0 text-sm text-600 mb-2">${project.address}</p>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xs bg-${this.getStatusSeverity(project.status)}-100 text-${this.getStatusSeverity(project.status)}-800 px-2 py-1 border-round">
                ${this.getStatusLabel(project.status)}
              </span>
              <span class="text-sm font-medium">${project.active_sensors}/${project.total_sensors} sensori</span>
            </div>
          </div>
        `);
      }
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

  filterProjects(): void {
    const allProjects = this.projectService.projects();
    const filtered = allProjects.filter(project => {
      const matchesSearch = !this.searchTerm || 
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.address.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || project.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });

    this.filteredProjects.set(filtered);
    this.calculateStats(filtered);
  }

  refreshProjects(): void {
    this.projectService.clearError();
    this.loadProjects();
  }

  // Action methods
  openProject(project: Project): void {
    this.router.navigate(['/projects', project.id, 'building']);
  }

  configureProject(project: Project): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Configurazione',
      detail: `Configurazione progetto ${project.name}`
    });
  }

  viewAnalytics(project: Project): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Analytics',
      detail: `Analytics per ${project.name}`
    });
  }

  editProject(project: Project): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Modifica',
      detail: `Modifica progetto ${project.name}`
    });
  }

  generateProjectReport(project: Project): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Report',
      detail: `Report generato per ${project.name}`
    });
  }

  showProjectMenu(event: Event, project: Project): void {
    this.selectedProject = project;
    this.projectMenu.toggle(event);
  }

  // Quick actions
  exportAllData(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Export',
      detail: 'Export dati avviato'
    });
  }

  refreshMap(): void {
    if (this.map) {
      this.map.invalidateSize();
      this.addProjectMarkers();
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Mappa',
      detail: 'Mappa aggiornata'
    });
  }

  expandMap(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Mappa',
      detail: 'Vista mappa espansa in sviluppo'
    });
  }

  manageProjects(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Gestione',
      detail: 'Gestione progetti in sviluppo'
    });
  }

  // Utility methods
  getSensorPercentage(): number {
    const stats = this.stats();
    return stats.totalSensors > 0 ? Math.round((stats.activeSensors / stats.totalSensors) * 100) : 0;
  }

  formatValue(value: number): string {
    return (value / 1000000).toFixed(1);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'monitoring': return 'Monitoraggio';
      case 'planning': return 'Pianificazione';
      case 'installation': return 'Installazione';
      case 'inactive': return 'Inattivo';
      default: return status;
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'monitoring': return 'success';
      case 'planning': return 'info';
      case 'installation': return 'warning';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  }

  getHealthColor(score: number): string {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  }
}
