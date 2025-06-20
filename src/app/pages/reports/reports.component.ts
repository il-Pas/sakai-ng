import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    TableModule,
    CalendarModule,
    DropdownModule
  ],
  template: `
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h2 class="text-2xl font-semibold text-900 mb-4">Report e Rapporti</h2>
          <p class="text-600 text-lg mb-6">Genera e gestisci report personalizzati per il monitoraggio strutturale</p>
          
          <!-- Report Templates -->
          <div class="grid mb-6">
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-blue-50">
                    <i class="pi pi-file-pdf text-4xl text-blue-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Report Giornaliero
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Riepilogo giornaliero dello stato dei sensori, allarmi e dati acquisiti.</p>
                  <p-tag severity="success" value="Disponibile"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Genera" 
                    icon="pi pi-download"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-green-50">
                    <i class="pi pi-chart-line text-4xl text-green-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Report Settimanale
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Analisi settimanale con trend, statistiche e confronti storici.</p>
                  <p-tag severity="success" value="Disponibile"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Genera" 
                    icon="pi pi-download"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-orange-50">
                    <i class="pi pi-chart-bar text-4xl text-orange-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Report Mensile
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Rapporto mensile completo con analisi approfondite e raccomandazioni.</p>
                  <p-tag severity="success" value="Disponibile"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Genera" 
                    icon="pi pi-download"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-purple-50">
                    <i class="pi pi-exclamation-triangle text-4xl text-purple-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Report Allarmi
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Riepilogo dettagliato di tutti gli allarmi e eventi critici registrati.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Genera" 
                    icon="pi pi-download"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-cyan-50">
                    <i class="pi pi-cog text-4xl text-cyan-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Report Personalizzato
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Crea report personalizzati selezionando parametri, periodo e formato.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Configura" 
                    icon="pi pi-cog"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-pink-50">
                    <i class="pi pi-database text-4xl text-pink-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Export Dati
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Esporta dati grezzi in formato CSV, Excel o JSON per analisi esterne.</p>
                  <p-tag severity="success" value="Disponibile"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Esporta" 
                    icon="pi pi-upload"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Report History -->
          <div class="mb-6">
            <h3 class="text-xl font-medium text-900 mb-4">Storico Report Generati</h3>
            
            <p-table [value]="reportHistory" [paginator]="true" [rows]="10" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nome Report</th>
                  <th>Tipo</th>
                  <th>Data Generazione</th>
                  <th>Periodo</th>
                  <th>Dimensione</th>
                  <th>Azioni</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-report>
                <tr>
                  <td>{{ report.name }}</td>
                  <td>
                    <p-tag 
                      [value]="report.type" 
                      [severity]="getReportTypeSeverity(report.type)">
                    </p-tag>
                  </td>
                  <td>{{ report.generatedDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ report.period }}</td>
                  <td>{{ report.size }}</td>
                  <td>
                    <p-button 
                      icon="pi pi-download" 
                      size="small"
                      [text]="true"
                      pTooltip="Scarica">
                    </p-button>
                    <p-button 
                      icon="pi pi-eye" 
                      size="small"
                      [text]="true"
                      pTooltip="Visualizza">
                    </p-button>
                    <p-button 
                      icon="pi pi-trash" 
                      size="small"
                      [text]="true"
                      severity="danger"
                      pTooltip="Elimina">
                    </p-button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center p-4">
                    <i class="pi pi-info-circle text-4xl text-400 mb-3"></i>
                    <p class="text-600">Nessun report generato ancora</p>
                    <p class="text-500 text-sm">Genera il tuo primo report utilizzando i template sopra</p>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <p-divider></p-divider>

          <!-- Quick Actions -->
          <div class="text-center">
            <h3 class="text-xl font-medium text-900 mb-4">Azioni Rapide</h3>
            <div class="flex flex-wrap justify-content-center gap-3">
              <p-button 
                label="Report Ultimo Mese" 
                icon="pi pi-calendar"
                severity="secondary">
              </p-button>
              <p-button 
                label="Export Dati Oggi" 
                icon="pi pi-download"
                severity="secondary">
              </p-button>
              <p-button 
                label="Programma Report" 
                icon="pi pi-clock"
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
export class ReportsComponent {
  reportHistory = [
    {
      name: 'Report Settimanale - Edificio Centro Storico',
      type: 'Settimanale',
      generatedDate: new Date('2024-06-15T10:30:00'),
      period: '08/06 - 15/06/2024',
      size: '2.3 MB'
    },
    {
      name: 'Export Dati Sensori - Giugno 2024',
      type: 'Export',
      generatedDate: new Date('2024-06-10T14:15:00'),
      period: '01/06 - 10/06/2024',
      size: '15.7 MB'
    },
    {
      name: 'Report Mensile - Maggio 2024',
      type: 'Mensile',
      generatedDate: new Date('2024-06-01T09:00:00'),
      period: 'Maggio 2024',
      size: '4.1 MB'
    }
  ];

  getReportTypeSeverity(type: string): string {
    switch (type) {
      case 'Giornaliero': return 'info';
      case 'Settimanale': return 'success';
      case 'Mensile': return 'warning';
      case 'Export': return 'secondary';
      default: return 'info';
    }
  }
}
