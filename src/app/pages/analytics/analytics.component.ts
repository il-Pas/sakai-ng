import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    DropdownModule,
    CalendarModule,
    ChartModule
  ],
  template: `
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h2 class="text-2xl font-semibold text-900 mb-4">Analytics e Grafici</h2>
          <p class="text-600 text-lg mb-6">Visualizzazioni avanzate e analisi dei dati di monitoraggio strutturale</p>
          
          <!-- Filters -->
          <div class="grid mb-6">
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Periodo</label>
              <p-dropdown 
                [options]="periodOptions"
                [(ngModel)]="selectedPeriod"
                placeholder="Seleziona periodo"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Sensore</label>
              <p-dropdown 
                [options]="sensorOptions"
                [(ngModel)]="selectedSensor"
                placeholder="Tutti i sensori"
                optionLabel="label"
                optionValue="value"
                class="w-full">
              </p-dropdown>
            </div>
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Data Inizio</label>
              <p-calendar 
                [(ngModel)]="startDate"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full">
              </p-calendar>
            </div>
            <div class="col-12 md:col-3">
              <label class="block text-900 font-medium mb-2">Data Fine</label>
              <p-calendar 
                [(ngModel)]="endDate"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                class="w-full">
              </p-calendar>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid">
            <!-- Time Series Chart -->
            <div class="col-12 lg:col-8">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Serie Temporale - Accelerazioni</h3>
                    <p-tag severity="success" value="Real-time"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="line" 
                    [data]="timeSeriesData" 
                    [options]="timeSeriesOptions"
                    height="300px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- FFT Analysis -->
            <div class="col-12 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Analisi FFT</h3>
                    <p-tag severity="info" value="Frequenze"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="bar" 
                    [data]="fftData" 
                    [options]="fftOptions"
                    height="300px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- Temperature and Humidity -->
            <div class="col-12 lg:col-6">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Temperatura e Umidità</h3>
                    <p-tag severity="warning" value="Ambientale"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="line" 
                    [data]="environmentalData" 
                    [options]="environmentalOptions"
                    height="250px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- Vibration Analysis -->
            <div class="col-12 lg:col-6">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Analisi Vibrazioni</h3>
                    <p-tag severity="danger" value="UNI 9916"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="scatter" 
                    [data]="vibrationData" 
                    [options]="vibrationOptions"
                    height="250px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- Inclination Trends -->
            <div class="col-12 lg:col-8">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Trend Inclinazioni</h3>
                    <p-tag severity="secondary" value="Drift Analysis"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="line" 
                    [data]="inclinationData" 
                    [options]="inclinationOptions"
                    height="300px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- Sensor Status -->
            <div class="col-12 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Stato Sensori</h3>
                    <p-tag severity="success" value="Online"></p-tag>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="doughnut" 
                    [data]="sensorStatusData" 
                    [options]="sensorStatusOptions"
                    height="300px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>

            <!-- Comparative Analysis -->
            <div class="col-12">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-between p-4">
                    <h3 class="text-lg font-medium text-900 m-0">Analisi Comparativa Multi-Sensore</h3>
                    <div class="flex gap-2">
                      <p-tag severity="info" value="Confronto"></p-tag>
                      <p-tag severity="success" value="Correlazione"></p-tag>
                    </div>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p-chart 
                    type="line" 
                    [data]="comparativeData" 
                    [options]="comparativeOptions"
                    height="400px">
                  </p-chart>
                </ng-template>
              </p-card>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Quick Actions -->
          <div class="text-center">
            <h3 class="text-xl font-medium text-900 mb-4">Azioni Rapide</h3>
            <div class="flex flex-wrap justify-content-center gap-3">
              <p-button 
                label="Export Grafici" 
                icon="pi pi-download"
                severity="secondary">
              </p-button>
              <p-button 
                label="Salva Vista" 
                icon="pi pi-save"
                severity="secondary">
              </p-button>
              <p-button 
                label="Condividi" 
                icon="pi pi-share-alt"
                severity="secondary">
              </p-button>
              <p-button 
                label="Configura Dashboard" 
                icon="pi pi-cog"
                severity="secondary"
                [disabled]="true">
              </p-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  selectedPeriod: string = '7d';
  selectedSensor: string = 'all';
  startDate: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  endDate: Date = new Date();

  periodOptions = [
    { label: 'Ultima ora', value: '1h' },
    { label: 'Ultime 24 ore', value: '24h' },
    { label: 'Ultimi 7 giorni', value: '7d' },
    { label: 'Ultimo mese', value: '30d' },
    { label: 'Personalizzato', value: 'custom' }
  ];

  sensorOptions = [
    { label: 'Tutti i sensori', value: 'all' },
    { label: 'Accelerometro 1', value: 'acc1' },
    { label: 'Accelerometro 2', value: 'acc2' },
    { label: 'Inclinometro 1', value: 'incl1' },
    { label: 'Sensore Ambientale', value: 'env1' }
  ];

  // Chart data
  timeSeriesData: any;
  timeSeriesOptions: any;
  fftData: any;
  fftOptions: any;
  environmentalData: any;
  environmentalOptions: any;
  vibrationData: any;
  vibrationOptions: any;
  inclinationData: any;
  inclinationOptions: any;
  sensorStatusData: any;
  sensorStatusOptions: any;
  comparativeData: any;
  comparativeOptions: any;

  ngOnInit() {
    this.initializeCharts();
  }

  private initializeCharts() {
    // Time Series Data
    this.timeSeriesData = {
      labels: this.generateTimeLabels(),
      datasets: [
        {
          label: 'Accelerazione X (mg)',
          data: this.generateRandomData(50, -10, 10),
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          tension: 0.4
        },
        {
          label: 'Accelerazione Y (mg)',
          data: this.generateRandomData(50, -8, 8),
          borderColor: '#FFA726',
          backgroundColor: 'rgba(255, 167, 38, 0.1)',
          tension: 0.4
        }
      ]
    };

    this.timeSeriesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Accelerazione (mg)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Tempo'
          }
        }
      }
    };

    // FFT Data
    this.fftData = {
      labels: ['0-5 Hz', '5-10 Hz', '10-15 Hz', '15-20 Hz', '20-25 Hz', '25-30 Hz'],
      datasets: [
        {
          label: 'Ampiezza',
          data: [12, 19, 8, 5, 2, 3],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }
      ]
    };

    this.fftOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Ampiezza'
          }
        }
      }
    };

    // Environmental Data
    this.environmentalData = {
      labels: this.generateTimeLabels(24),
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: this.generateRandomData(24, 18, 25),
          borderColor: '#FF6384',
          yAxisID: 'y'
        },
        {
          label: 'Umidità (%)',
          data: this.generateRandomData(24, 40, 70),
          borderColor: '#36A2EB',
          yAxisID: 'y1'
        }
      ]
    };

    this.environmentalOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperatura (°C)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Umidità (%)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    };

    // Vibration Data
    this.vibrationData = {
      datasets: [
        {
          label: 'PPV vs Frequenza',
          data: this.generateScatterData(30),
          backgroundColor: '#4BC0C0'
        }
      ]
    };

    this.vibrationOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Frequenza (Hz)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'PPV (mm/s)'
          }
        }
      }
    };

    // Inclination Data
    this.inclinationData = {
      labels: this.generateTimeLabels(30),
      datasets: [
        {
          label: 'Inclinazione X (°)',
          data: this.generateTrendData(30, 0.1),
          borderColor: '#9966FF',
          tension: 0.4
        },
        {
          label: 'Inclinazione Y (°)',
          data: this.generateTrendData(30, -0.05),
          borderColor: '#FF9F40',
          tension: 0.4
        }
      ]
    };

    this.inclinationOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: 'Inclinazione (°)'
          }
        }
      }
    };

    // Sensor Status Data
    this.sensorStatusData = {
      labels: ['Online', 'Offline', 'Manutenzione'],
      datasets: [
        {
          data: [85, 10, 5],
          backgroundColor: ['#4CAF50', '#F44336', '#FF9800']
        }
      ]
    };

    this.sensorStatusOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    // Comparative Data
    this.comparativeData = {
      labels: this.generateTimeLabels(20),
      datasets: [
        {
          label: 'Sensore Piano 1',
          data: this.generateRandomData(20, -5, 5),
          borderColor: '#42A5F5'
        },
        {
          label: 'Sensore Piano 2',
          data: this.generateRandomData(20, -3, 7),
          borderColor: '#FFA726'
        },
        {
          label: 'Sensore Piano 3',
          data: this.generateRandomData(20, -2, 4),
          borderColor: '#66BB6A'
        }
      ]
    };

    this.comparativeOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: 'Accelerazione (mg)'
          }
        }
      }
    };
  }

  private generateTimeLabels(count: number = 50): string[] {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      labels.push(time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    }
    return labels;
  }

  private generateRandomData(count: number, min: number, max: number): number[] {
    return Array.from({ length: count }, () => 
      Math.random() * (max - min) + min
    );
  }

  private generateTrendData(count: number, trend: number): number[] {
    const data = [];
    let value = 0;
    for (let i = 0; i < count; i++) {
      value += trend + (Math.random() - 0.5) * 0.1;
      data.push(value);
    }
    return data;
  }

  private generateScatterData(count: number): any[] {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 50,
      y: Math.random() * 10
    }));
  }
}
