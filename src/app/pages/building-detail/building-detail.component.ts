import { Component, OnInit, ViewChild, ElementRef, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { DataViewModule } from 'primeng/dataview';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { CarouselModule } from 'primeng/carousel';

// Three.js for 3D visualization
declare var THREE: any;

interface Sensor {
  id: string;
  name: string;
  type: 'accelerometer' | 'inclinometer' | 'temperature' | 'humidity' | 'strain' | 'vibration';
  status: 'online' | 'offline' | 'warning' | 'error';
  position: { x: number; y: number; z: number };
  lastValue: number;
  unit: string;
  batteryLevel: number;
  lastUpdate: Date;
  floor: number;
  room?: string;
}

interface Building {
  id: string;
  name: string;
  address: string;
  type: string;
  floors: number;
  constructionYear: number;
  totalSensors: number;
  activeSensors: number;
  alarms: number;
  healthScore: number;
  coordinates: { lat: number; lng: number };
  thumbnail: string;
}

interface EarthquakeEvent {
  id: string;
  magnitude: number;
  depth: number;
  location: string;
  distance: number;
  timestamp: Date;
  intensity?: string;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-building-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ChartModule,
    ProgressBarModule,
    ToastModule,
    BreadcrumbModule,
    TabViewModule,
    DataViewModule,
    BadgeModule,
    DividerModule,
    SkeletonModule,
    TooltipModule,
    CarouselModule
  ],
  providers: [MessageService],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <!-- Breadcrumb -->
      <div class="col-span-12">
        <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem"></p-breadcrumb>
      </div>

      <!-- Building Header -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-content-between align-items-start">
            <div class="flex gap-4">
              <img [src]="building().thumbnail" [alt]="building().name" 
                   class="w-6rem h-6rem object-cover border-round">
              <div>
                <h1 class="text-2xl font-semibold text-900 mb-2">{{ building().name }}</h1>
                <p class="text-600 text-lg mb-3">{{ building().address }}</p>
                <div class="flex gap-4">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-building text-600"></i>
                    <span class="text-sm">{{ building().type }}</span>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-calendar text-600"></i>
                    <span class="text-sm">{{ building().constructionYear }}</span>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-home text-600"></i>
                    <span class="text-sm">{{ building().floors }} piani</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <p-button 
                label="Configurazioni" 
                icon="pi pi-cog"
                severity="secondary"
                [outlined]="true"
                (click)="openConfigurations()">
              </p-button>
              <p-button 
                label="Report" 
                icon="pi pi-file-pdf"
                (click)="generateReport()">
              </p-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Cards -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Sensori Attivi</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ building().activeSensors }}/{{ building().totalSensors }}</div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-wifi text-blue-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">{{ getSensorPercentage() }}% </span>
          <span class="text-muted-color">operativi</span>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Allarmi</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ building().alarms }}</div>
            </div>
            <div class="flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-bell text-red-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-red-500 font-medium" *ngIf="building().alarms > 0">Attenzione richiesta</span>
          <span class="text-green-500 font-medium" *ngIf="building().alarms === 0">Tutto normale</span>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Salute Struttura</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ building().healthScore }}%</div>
            </div>
            <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-heart text-green-500 !text-xl"></i>
            </div>
          </div>
          <p-progressBar [value]="building().healthScore" [showValue]="false" styleClass="h-1rem"></p-progressBar>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Ultimo Aggiornamento</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ getLastUpdateTime() }}</div>
            </div>
            <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-clock text-orange-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-muted-color">{{ getLastUpdateDate() }}</span>
        </div>
      </div>

      <!-- 3D Building Map -->
      <div class="col-span-12 lg:col-span-8">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h5 class="m-0">Mappa 3D Edificio</h5>
            <div class="flex gap-2">
              <p-button 
                icon="pi pi-refresh" 
                severity="secondary" 
                size="small" 
                [text]="true"
                [pTooltip]="'Aggiorna vista'"
                (click)="refresh3DView()">
              </p-button>
              <p-button 
                icon="pi pi-expand" 
                severity="secondary" 
                size="small" 
                [text]="true"
                [pTooltip]="'Schermo intero'"
                (click)="expand3DView()">
              </p-button>
              <p-button 
                icon="pi pi-cog" 
                severity="secondary" 
                size="small" 
                [text]="true"
                [pTooltip]="'Impostazioni vista'"
                (click)="open3DSettings()">
              </p-button>
            </div>
          </div>
          
          <!-- 3D Container -->
          <div #threejsContainer class="border-round overflow-hidden mb-3" style="height: 500px; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <div class="flex align-items-center justify-content-center h-full">
              <div class="text-center text-white">
                <i class="pi pi-box text-6xl mb-4 opacity-70"></i>
                <div class="text-xl font-medium mb-2">Visualizzazione 3D</div>
                <div class="text-sm opacity-80">Caricamento modello edificio...</div>
                <p-progressBar mode="indeterminate" styleClass="mt-3 w-12rem mx-auto"></p-progressBar>
              </div>
            </div>
          </div>
          
          <!-- 3D Controls -->
          <div class="flex justify-content-between align-items-center">
            <div class="flex gap-2">
              <p-button 
                label="Piano Terra" 
                size="small"
                [outlined]="selectedFloor !== 0"
                (click)="selectFloor(0)">
              </p-button>
              <p-button 
                label="1° Piano" 
                size="small"
                [outlined]="selectedFloor !== 1"
                (click)="selectFloor(1)">
              </p-button>
              <p-button 
                label="2° Piano" 
                size="small"
                [outlined]="selectedFloor !== 2"
                (click)="selectFloor(2)">
              </p-button>
              <p-button 
                label="Vista Completa" 
                size="small"
                [outlined]="selectedFloor !== -1"
                (click)="selectFloor(-1)">
              </p-button>
            </div>
            <div class="text-sm text-600">
              Clicca sui sensori per visualizzare i dettagli
            </div>
          </div>
        </div>
      </div>

      <!-- Sensor Legend -->
      <div class="col-span-12 lg:col-span-4">
        <div class="card">
          <h5 class="mb-4">Legenda Sensori</h5>
          <div class="flex flex-col gap-3">
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-blue-500 border-round"></div>
              <span class="text-sm">Accelerometri</span>
              <p-badge [value]="getSensorCountByType('accelerometer')" severity="info"></p-badge>
            </div>
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-green-500 border-round"></div>
              <span class="text-sm">Inclinometri</span>
              <p-badge [value]="getSensorCountByType('inclinometer')" severity="success"></p-badge>
            </div>
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-orange-500 border-round"></div>
              <span class="text-sm">Temperatura</span>
              <p-badge [value]="getSensorCountByType('temperature')" severity="warn"></p-badge>
            </div>
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-cyan-500 border-round"></div>
              <span class="text-sm">Umidità</span>
              <p-badge [value]="getSensorCountByType('humidity')" severity="info"></p-badge>
            </div>
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-purple-500 border-round"></div>
              <span class="text-sm">Estensimetri</span>
              <p-badge [value]="getSensorCountByType('strain')" severity="secondary"></p-badge>
            </div>
            <div class="flex align-items-center gap-3">
              <div class="w-1rem h-1rem bg-pink-500 border-round"></div>
              <span class="text-sm">Vibrometri</span>
              <p-badge [value]="getSensorCountByType('vibration')" severity="danger"></p-badge>
            </div>
          </div>
          
          <p-divider></p-divider>
          
          <h6 class="mb-3">Stati Sensori</h6>
          <div class="flex flex-col gap-2">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-circle-fill text-green-500 text-xs"></i>
              <span class="text-sm">Online</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-circle-fill text-red-500 text-xs"></i>
              <span class="text-sm">Offline</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-circle-fill text-yellow-500 text-xs"></i>
              <span class="text-sm">Warning</span>
            </div>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-circle-fill text-orange-500 text-xs"></i>
              <span class="text-sm">Errore</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensors Carousel -->
      <div class="col-span-12">
        <div class="card">
          <div class="flex justify-content-between align-items-center mb-4">
            <h5 class="m-0">Sensori Installati</h5>
            <p-tag [value]="sensors().length + ' sensori'" severity="info"></p-tag>
          </div>
          
          <p-carousel 
            [value]="sensors()" 
            [numVisible]="3" 
            [numScroll]="1"
            [responsiveOptions]="sensorsCarouselResponsiveOptions"
            [circular]="true"
            [autoplayInterval]="0"
            styleClass="sensors-carousel">
            
            <ng-template let-sensor pTemplate="item">
              <div class="p-3">
                <div class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-300 h-full"
                     [class]="getSensorCardClass(sensor)"
                     (click)="selectSensor(sensor)">
                  
                  <!-- Large Icon at Top -->
                  <div class="flex justify-content-center mb-4">
                    <div class="flex items-center justify-center rounded-full shadow-lg" 
                         [ngClass]="getSensorIconClass(sensor.type)"
                         style="width:5rem;height:5rem">
                      <i [class]="getSensorIcon(sensor.type)" class="text-white text-3xl"></i>
                    </div>
                  </div>
                  
                  <!-- Sensor Info -->
                  <div class="text-center mb-4">
                    <h6 class="font-semibold text-900 mb-2 line-height-3">{{ sensor.name }}</h6>
                    <p class="text-600 text-sm m-0 mb-2">{{ getSensorTypeLabel(sensor.type) }}</p>
                    <p-tag 
                      [value]="getSensorStatusLabel(sensor.status)" 
                      [severity]="getSensorStatusSeverity(sensor.status)"
                      class="text-xs">
                    </p-tag>
                  </div>
                  
                  <!-- Sensor Metrics -->
                  <div class="grid mb-4">
                    <div class="col-6">
                      <div class="text-center p-2 bg-gray-50 border-round">
                        <div class="text-900 font-bold text-xl mb-1">{{ sensor.lastValue }}</div>
                        <div class="text-600 text-xs font-medium">{{ sensor.unit }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="text-center p-2 bg-gray-50 border-round">
                        <div class="text-900 font-bold text-xl mb-1" 
                             [class]="sensor.batteryLevel < 20 ? 'text-red-500' : sensor.batteryLevel < 50 ? 'text-orange-500' : 'text-green-500'">
                          {{ sensor.batteryLevel }}%
                        </div>
                        <div class="text-600 text-xs font-medium">Batteria</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Location and Time -->
                  <div class="border-top-1 border-gray-200 pt-3">
                    <div class="flex justify-content-between align-items-center text-sm">
                      <div class="flex align-items-center gap-2 text-600">
                        <i class="pi pi-map-marker text-xs"></i>
                        <span class="font-medium">{{ sensor.floor }}° Piano{{ sensor.room ? ' - ' + sensor.room : '' }}</span>
                      </div>
                    </div>
                    <div class="flex align-items-center gap-2 text-600 text-xs mt-2">
                      <i class="pi pi-clock"></i>
                      <span>{{ sensor.lastUpdate | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </p-carousel>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="col-span-12">
        <div class="card">
          <h5 class="mb-4">Grafici e Analisi</h5>
          
          <p-tabView>
            <p-tabPanel header="Vibrazioni" leftIcon="pi pi-chart-line">
              <div class="grid">
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">Accelerazioni (Ultimo Giorno)</h6>
                    <p-chart type="line" [data]="accelerationChartData()" [options]="chartOptions"></p-chart>
                  </div>
                </div>
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">FFT Analisi</h6>
                    <p-chart type="bar" [data]="fftChartData()" [options]="chartOptions"></p-chart>
                  </div>
                </div>
              </div>
            </p-tabPanel>
            
            <p-tabPanel header="Inclinazioni" leftIcon="pi pi-compass">
              <div class="grid">
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">Inclinazioni X-Y</h6>
                    <p-chart type="scatter" [data]="inclinationChartData()" [options]="chartOptions"></p-chart>
                  </div>
                </div>
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">Trend Temporale</h6>
                    <p-chart type="line" [data]="inclinationTrendData()" [options]="chartOptions"></p-chart>
                  </div>
                </div>
              </div>
            </p-tabPanel>
            
            <p-tabPanel header="Ambiente" leftIcon="pi pi-sun">
              <div class="grid">
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">Temperatura e Umidità</h6>
                    <p-chart type="line" [data]="environmentalChartData()" [options]="chartOptions"></p-chart>
                  </div>
                </div>
                <div class="col-12 lg:col-6">
                  <div class="card">
                    <h6 class="mb-3">Comfort Score</h6>
                    <p-chart type="doughnut" [data]="comfortScoreData()" [options]="doughnutOptions"></p-chart>
                  </div>
                </div>
              </div>
            </p-tabPanel>
            
            <p-tabPanel header="Terremoti INGV" leftIcon="pi pi-globe">
              <div class="grid">
                <div class="col-12 lg:col-8">
                  <div class="card">
                    <h6 class="mb-3">Eventi Sismici Recenti (Raggio 100km)</h6>
                    <p-chart type="scatter" [data]="earthquakeChartData()" [options]="earthquakeChartOptions"></p-chart>
                  </div>
                </div>
                <div class="col-12 lg:col-4">
                  <div class="card">
                    <h6 class="mb-3">Eventi Recenti</h6>
                    <div class="flex flex-col gap-3">
                      <div *ngFor="let earthquake of recentEarthquakes()" 
                           class="flex justify-content-between align-items-center p-2 border-round surface-hover">
                        <div>
                          <div class="font-medium">M {{ earthquake.magnitude }}</div>
                          <div class="text-sm text-600">{{ earthquake.location }}</div>
                          <div class="text-xs text-500">{{ earthquake.distance }}km</div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm">{{ earthquake.timestamp | date:'dd/MM' }}</div>
                          <div class="text-xs text-600">{{ earthquake.timestamp | date:'HH:mm' }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabPanel>
          </p-tabView>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <p-toast></p-toast>
  `
})
export class BuildingDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('threejsContainer', { static: false }) threejsContainer!: ElementRef;

  // Reactive state
  building = signal<Building>({
    id: '1',
    name: 'Centro Storico Arezzo',
    address: 'Piazza Grande, Arezzo (AR)',
    type: 'Edificio in Muratura',
    floors: 3,
    constructionYear: 1850,
    totalSensors: 12,
    activeSensors: 11,
    alarms: 1,
    healthScore: 88,
    coordinates: { lat: 43.4648, lng: 11.8846 },
    thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=200&fit=crop'
  });

  sensors = signal<Sensor[]>([]);
  recentEarthquakes = signal<EarthquakeEvent[]>([]);
  
  // Chart data
  accelerationChartData = signal<ChartData>({ labels: [], datasets: [] });
  fftChartData = signal<ChartData>({ labels: [], datasets: [] });
  inclinationChartData = signal<ChartData>({ labels: [], datasets: [] });
  inclinationTrendData = signal<ChartData>({ labels: [], datasets: [] });
  environmentalChartData = signal<ChartData>({ labels: [], datasets: [] });
  comfortScoreData = signal<ChartData>({ labels: [], datasets: [] });
  earthquakeChartData = signal<ChartData>({ labels: [], datasets: [] });

  // UI state
  selectedFloor: number = -1;
  selectedSensor: Sensor | null = null;

  // Navigation
  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  // Carousel options
  sensorsCarouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  // Chart options
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  earthquakeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Distanza (km)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Magnitudo'
        }
      }
    }
  };

  private scene: any;
  private camera: any;
  private renderer: any;
  private buildingId: string = '';

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.buildingId = this.route.snapshot.params['id'];
    this.setupBreadcrumb();
    this.loadBuildingData();
    this.loadSensorsData();
    this.loadEarthquakeData();
    this.generateChartData();
  }

  ngAfterViewInit(): void {
    this.init3DView();
  }

  private setupBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Progetti', routerLink: '/projects' },
      { label: 'I Miei Progetti', routerLink: '/projects' },
      { label: this.building().name }
    ];
  }

  private loadBuildingData(): void {
    // In production, this would load from a service based on buildingId
    // For now, using mock data
  }

  private loadSensorsData(): void {
    const mockSensors: Sensor[] = [
      {
        id: 'ACC001',
        name: 'Accelerometro Piano Terra',
        type: 'accelerometer',
        status: 'online',
        position: { x: 0, y: 0, z: 0 },
        lastValue: 0.02,
        unit: 'g',
        batteryLevel: 85,
        lastUpdate: new Date(),
        floor: 0,
        room: 'Ingresso'
      },
      {
        id: 'INC001',
        name: 'Inclinometro Primo Piano',
        type: 'inclinometer',
        status: 'online',
        position: { x: 5, y: 3, z: 0 },
        lastValue: 0.15,
        unit: '°',
        batteryLevel: 92,
        lastUpdate: new Date(),
        floor: 1,
        room: 'Sala Principale'
      },
      {
        id: 'TEMP001',
        name: 'Sensore Temperatura',
        type: 'temperature',
        status: 'warning',
        position: { x: -3, y: 2, z: 0 },
        lastValue: 24.5,
        unit: '°C',
        batteryLevel: 45,
        lastUpdate: new Date(),
        floor: 1
      },
      {
        id: 'HUM001',
        name: 'Sensore Umidità',
        type: 'humidity',
        status: 'online',
        position: { x: 2, y: -1, z: 0 },
        lastValue: 65,
        unit: '%',
        batteryLevel: 78,
        lastUpdate: new Date(),
        floor: 0
      },
      {
        id: 'STR001',
        name: 'Estensimetro Trave',
        type: 'strain',
        status: 'online',
        position: { x: 0, y: 4, z: 0 },
        lastValue: 120,
        unit: 'με',
        batteryLevel: 88,
        lastUpdate: new Date(),
        floor: 2,
        room: 'Sottotetto'
      },
      {
        id: 'VIB001',
        name: 'Vibrometro Parete',
        type: 'vibration',
        status: 'offline',
        position: { x: -2, y: 0, z: 0 },
        lastValue: 0.8,
        unit: 'mm/s',
        batteryLevel: 12,
        lastUpdate: new Date(Date.now() - 3600000),
        floor: 1
      }
    ];

    this.sensors.set(mockSensors);
  }

  private loadEarthquakeData(): void {
    const mockEarthquakes: EarthquakeEvent[] = [
      {
        id: 'EQ001',
        magnitude: 2.1,
        depth: 8.5,
        location: 'Casentino (AR)',
        distance: 25,
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 'EQ002',
        magnitude: 1.8,
        depth: 12.3,
        location: 'Valdichiana (AR)',
        distance: 35,
        timestamp: new Date(Date.now() - 14400000)
      },
      {
        id: 'EQ003',
        magnitude: 3.2,
        depth: 15.8,
        location: 'Appennino Tosco-Emiliano',
        distance: 45,
        timestamp: new Date(Date.now() - 21600000)
      },
      {
        id: 'EQ004',
        magnitude: 1.5,
        depth: 6.2,
        location: 'Chianti (SI)',
        distance: 55,
        timestamp: new Date(Date.now() - 28800000)
      }
    ];

    this.recentEarthquakes.set(mockEarthquakes);
  }

  private generateChartData(): void {
    // Generate mock chart data
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    // Acceleration data
    this.accelerationChartData.set({
      labels: hours,
      datasets: [
        {
          label: 'Accelerazione X',
          data: hours.map(() => Math.random() * 0.1 - 0.05),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Accelerazione Y',
          data: hours.map(() => Math.random() * 0.1 - 0.05),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    });

    // FFT data
    this.fftChartData.set({
      labels: ['0-5Hz', '5-10Hz', '10-15Hz', '15-20Hz', '20-25Hz', '25-30Hz'],
      datasets: [
        {
          label: 'Ampiezza FFT',
          data: [0.8, 1.2, 0.6, 0.3, 0.1, 0.05],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
        }
      ]
    });

    // Inclination data
    this.inclinationChartData.set({
      labels: ['Dataset'],
      datasets: [
        {
          label: 'Inclinazioni',
          data: [
            { x: 0.1, y: 0.15 },
            { x: 0.12, y: 0.18 },
            { x: 0.08, y: 0.12 },
            { x: 0.15, y: 0.20 },
            { x: 0.11, y: 0.16 }
          ],
          backgroundColor: '#10b981',
          borderColor: '#059669'
        }
      ]
    });

    // Environmental data
    this.environmentalChartData.set({
      labels: hours,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: hours.map(() => 20 + Math.random() * 10),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Umidità (%)',
          data: hours.map(() => 40 + Math.random() * 40),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          yAxisID: 'y1'
        }
      ]
    });

    // Comfort score
    this.comfortScoreData.set({
      labels: ['Ottimo', 'Buono', 'Discreto', 'Scarso'],
      datasets: [
        {
          data: [45, 30, 20, 5],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
        }
      ]
    });

    // Earthquake data
    const earthquakes = this.recentEarthquakes();
    this.earthquakeChartData.set({
      labels: ['Terremoti'],
      datasets: [
        {
          label: 'Eventi Sismici',
          data: earthquakes.map(eq => ({ x: eq.distance, y: eq.magnitude })),
          backgroundColor: earthquakes.map(eq => 
            eq.magnitude > 3 ? '#ef4444' : 
            eq.magnitude > 2 ? '#f59e0b' : '#10b981'
          ),
          borderColor: '#374151',
          borderWidth: 1
        }
      ]
    });
  }

  private init3DView(): void {
    // Initialize Three.js scene (placeholder for now)
    // In production, this would load the actual 3D model
    setTimeout(() => {
      if (this.threejsContainer?.nativeElement) {
        // Replace placeholder with actual 3D scene
        this.threejsContainer.nativeElement.innerHTML = `
          <div class="flex align-items-center justify-content-center h-full">
            <div class="text-center text-white">
              <i class="pi pi-box text-6xl mb-4 opacity-70"></i>
              <div class="text-xl font-medium mb-2">Modello 3D Edificio</div>
              <div class="text-sm opacity-80">Integrazione Three.js in sviluppo</div>
            </div>
          </div>
        `;
      }
    }, 2000);
  }

  // Utility methods
  getSensorPercentage(): number {
    const building = this.building();
    return building.totalSensors > 0 ? Math.round((building.activeSensors / building.totalSensors) * 100) : 0;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getLastUpdateDate(): string {
    return new Date().toLocaleDateString('it-IT');
  }

  getSensorCountByType(type: string): number {
    return this.sensors().filter(s => s.type === type).length;
  }

  getSensorTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'accelerometer': 'Accelerometro',
      'inclinometer': 'Inclinometro',
      'temperature': 'Temperatura',
      'humidity': 'Umidità',
      'strain': 'Estensimetro',
      'vibration': 'Vibrometro'
    };
    return labels[type] || type;
  }

  getSensorIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'accelerometer': 'pi pi-chart-line',
      'inclinometer': 'pi pi-compass',
      'temperature': 'pi pi-sun',
      'humidity': 'pi pi-cloud',
      'strain': 'pi pi-arrows-h',
      'vibration': 'pi pi-wave-pulse'
    };
    return icons[type] || 'pi pi-circle';
  }

  getSensorIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'accelerometer': 'bg-blue-500',
      'inclinometer': 'bg-green-500',
      'temperature': 'bg-orange-500',
      'humidity': 'bg-cyan-500',
      'strain': 'bg-purple-500',
      'vibration': 'bg-pink-500'
    };
    return classes[type] || 'bg-gray-500';
  }

  getSensorStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'online': 'Online',
      'offline': 'Offline',
      'warning': 'Warning',
      'error': 'Errore'
    };
    return labels[status] || status;
  }

  getSensorStatusSeverity(status: string): string {
    const severities: { [key: string]: string } = {
      'online': 'success',
      'offline': 'danger',
      'warning': 'warning',
      'error': 'danger'
    };
    return severities[status] || 'secondary';
  }

  getSensorCardClass(sensor: Sensor): string {
    const baseClass = 'border border-gray-200 rounded p-4 cursor-pointer hover:shadow-md transition-all';
    switch (sensor.status) {
      case 'warning': return `${baseClass} border-yellow-300 bg-yellow-50`;
      case 'error':
      case 'offline': return `${baseClass} border-red-300 bg-red-50`;
      default: return baseClass;
    }
  }

  // Action methods
  selectFloor(floor: number): void {
    this.selectedFloor = floor;
    this.messageService.add({
      severity: 'info',
      summary: 'Vista 3D',
      detail: floor === -1 ? 'Vista completa edificio' : `Visualizzazione ${floor}° piano`
    });
  }

  selectSensor(sensor: Sensor): void {
    this.selectedSensor = sensor;
    this.messageService.add({
      severity: 'info',
      summary: 'Sensore Selezionato',
      detail: `${sensor.name} - ${sensor.lastValue} ${sensor.unit}`
    });
  }

  refresh3DView(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Vista 3D',
      detail: 'Vista aggiornata'
    });
  }

  expand3DView(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Vista 3D',
      detail: 'Modalità schermo intero in sviluppo'
    });
  }

  open3DSettings(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Impostazioni 3D',
      detail: 'Pannello impostazioni in sviluppo'
    });
  }

  openConfigurations(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Configurazioni',
      detail: 'Apertura pannello configurazioni'
    });
  }

  generateReport(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Report',
      detail: 'Generazione report in corso...'
    });
  }
}
