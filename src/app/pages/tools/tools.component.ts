import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule
  ],
  template: `
    <div class="grid">
      <div class="col-12">
        <div class="card">
          <h2 class="text-2xl font-semibold text-900 mb-4">Tools e Strumenti</h2>
          <p class="text-600 text-lg mb-6">Strumenti avanzati per la gestione e configurazione del sistema di monitoraggio</p>
          
          <div class="grid">
            <!-- Configurazione Sensori -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-blue-50">
                    <i class="pi pi-wifi text-4xl text-blue-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Configurazione Sensori
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Gestisci la configurazione dei sensori, parametri di acquisizione e connessioni MQTT/API.</p>
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

            <!-- Gestione Allarmi -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-orange-50">
                    <i class="pi pi-bell text-4xl text-orange-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Gestione Allarmi
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Configura soglie di allarme, notifiche email/SMS e trigger automatici.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Gestisci" 
                    icon="pi pi-bell"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <!-- Calibrazione Strumenti -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-green-50">
                    <i class="pi pi-wrench text-4xl text-green-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Calibrazione
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Strumenti per la calibrazione e verifica del corretto funzionamento dei sensori.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Calibra" 
                    icon="pi pi-wrench"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <!-- Manutenzione -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-purple-50">
                    <i class="pi pi-cog text-4xl text-purple-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Manutenzione
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Pianificazione interventi, diagnostica remota e gestione service.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Pianifica" 
                    icon="pi pi-calendar"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <!-- Backup e Restore -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-cyan-50">
                    <i class="pi pi-database text-4xl text-cyan-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Backup & Restore
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Gestione backup automatici e ripristino configurazioni sistema.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Gestisci" 
                    icon="pi pi-database"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>

            <!-- Diagnostica Sistema -->
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="flex align-items-center justify-content-center p-4 bg-pink-50">
                    <i class="pi pi-search text-4xl text-pink-500"></i>
                  </div>
                </ng-template>
                
                <ng-template pTemplate="title">
                  Diagnostica
                </ng-template>
                
                <ng-template pTemplate="content">
                  <p class="text-600 mb-4">Strumenti di diagnostica per verificare lo stato del sistema e identificare problemi.</p>
                  <p-tag severity="warning" value="In Sviluppo"></p-tag>
                </ng-template>
                
                <ng-template pTemplate="footer">
                  <p-button 
                    label="Diagnosi" 
                    icon="pi pi-search"
                    [disabled]="true"
                    class="w-full">
                  </p-button>
                </ng-template>
              </p-card>
            </div>
          </div>

          <p-divider></p-divider>

          <div class="text-center">
            <h3 class="text-xl font-medium text-900 mb-3">Strumenti in Arrivo</h3>
            <p class="text-600 mb-4">Stiamo lavorando per implementare tutti gli strumenti necessari per una gestione completa del sistema SYNERGY.</p>
            <p class="text-500 text-sm">Le funzionalità saranno disponibili nelle prossime versioni della piattaforma.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ToolsComponent {
  
}
