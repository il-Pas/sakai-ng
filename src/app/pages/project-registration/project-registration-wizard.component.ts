import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';

// PrimeNG Components
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

// Services
import { MessageService, MenuItem } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';

interface SensorConfig {
  type: string;
  count: number;
}

@Component({
  selector: 'app-project-registration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    FileUploadModule,
    ToastModule,
    ProgressSpinnerModule,
    DividerModule,
    TagModule
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-2xl font-semibold text-900 mb-2">Registrazione nuovo edificio</h2>
          <p class="text-600 text-lg m-0">Completa tutti i passaggi per registrare il tuo edificio</p>
        </div>
        <p-button 
          label="Annulla" 
          icon="pi pi-times" 
          severity="secondary"
          [text]="true"
          (onClick)="cancel()">
        </p-button>
      </div>

      <!-- Steps Navigation -->
      <p-steps 
        [model]="steps" 
        [activeIndex]="currentStep()" 
        [readonly]="false"
        styleClass="mb-6">
      </p-steps>

      <!-- Step Content -->
      <div class="step-content">
        
        <!-- Step 1: Informazioni di Base -->
        @if (currentStep() === 0) {
          <div class="step-container">
            <h3 class="text-xl font-medium text-900 mb-4">Informazioni di Base</h3>
            
            <form [formGroup]="basicInfoForm" class="grid grid-cols-12 gap-6">
              <!-- Nome edificio -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Nome edificio *</label>
                <input 
                  pInputText 
                  formControlName="name"
                  placeholder="Inserisci nome edificio"
                  class="w-full">
                @if (basicInfoForm.get('name')?.invalid && basicInfoForm.get('name')?.touched) {
                  <small class="p-error">Nome edificio richiesto</small>
                }
              </div>

              <!-- Indirizzo -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Indirizzo *</label>
                <input 
                  pInputText 
                  formControlName="address"
                  placeholder="Inserisci indirizzo struttura"
                  class="w-full">
                @if (basicInfoForm.get('address')?.invalid && basicInfoForm.get('address')?.touched) {
                  <small class="p-error">Indirizzo richiesto</small>
                }
              </div>

              <!-- Tipologia di struttura -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Tipologia di struttura *</label>
                <p-dropdown 
                  formControlName="structureType"
                  [options]="structureTypes"
                  placeholder="Seleziona tipologia"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full">
                </p-dropdown>
                @if (basicInfoForm.get('structureType')?.invalid && basicInfoForm.get('structureType')?.touched) {
                  <small class="p-error">Tipologia struttura richiesta</small>
                }
              </div>

              <!-- Anno di costruzione -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Anno di costruzione *</label>
                <p-inputNumber 
                  formControlName="constructionYear"
                  placeholder="Es. 1998"
                  [min]="1800"
                  [max]="2025"
                  [useGrouping]="false"
                  class="w-full">
                </p-inputNumber>
                @if (basicInfoForm.get('constructionYear')?.invalid && basicInfoForm.get('constructionYear')?.touched) {
                  <small class="p-error">Anno di costruzione richiesto</small>
                }
              </div>

              <!-- Destinazione d'uso -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Destinazione d'uso *</label>
                <p-dropdown 
                  formControlName="destinationUse"
                  [options]="destinationUses"
                  placeholder="Seleziona destinazione d'uso"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full">
                </p-dropdown>
                @if (basicInfoForm.get('destinationUse')?.invalid && basicInfoForm.get('destinationUse')?.touched) {
                  <small class="p-error">Destinazione d'uso richiesta</small>
                }
              </div>

              <!-- Classe costruttiva -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Classe costruttiva *</label>
                <p-dropdown 
                  formControlName="constructionClass"
                  [options]="constructionClasses"
                  placeholder="Seleziona classe costruttiva"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full">
                </p-dropdown>
                @if (basicInfoForm.get('constructionClass')?.invalid && basicInfoForm.get('constructionClass')?.touched) {
                  <small class="p-error">Classe costruttiva richiesta</small>
                }
              </div>

              <!-- Numero piani fuori terra -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Numero piani fuori terra *</label>
                <p-inputNumber 
                  formControlName="floorsAboveGround"
                  placeholder="Es. 3"
                  [min]="1"
                  [max]="50"
                  [useGrouping]="false"
                  class="w-full">
                </p-inputNumber>
                @if (basicInfoForm.get('floorsAboveGround')?.invalid && basicInfoForm.get('floorsAboveGround')?.touched) {
                  <small class="p-error">Numero piani richiesto</small>
                }
              </div>

              <!-- Numero di persone in media -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Numero di persone in media</label>
                <p-inputNumber 
                  formControlName="averageOccupants"
                  placeholder="Es. 50"
                  [min]="0"
                  [max]="10000"
                  [useGrouping]="false"
                  class="w-full">
                </p-inputNumber>
              </div>

              <!-- Classe energetica -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Classe energetica *</label>
                <p-dropdown 
                  formControlName="energyClass"
                  [options]="energyClasses"
                  placeholder="Seleziona..."
                  optionLabel="label"
                  optionValue="value"
                  class="w-full">
                </p-dropdown>
                @if (basicInfoForm.get('energyClass')?.invalid && basicInfoForm.get('energyClass')?.touched) {
                  <small class="p-error">Classe energetica richiesta</small>
                }
              </div>

              <!-- Checkboxes -->
              <div class="col-span-12">
                <p-divider align="left">
                  <span class="text-900 font-medium">Caratteristiche aggiuntive</span>
                </p-divider>
                
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasStructuralUpgrade"
                        binary="true"
                        inputId="structuralUpgrade">
                      </p-checkbox>
                      <label for="structuralUpgrade" class="ml-2">Riqualificazione Strutturale</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasStaticCertificate"
                        binary="true"
                        inputId="staticCertificate">
                      </p-checkbox>
                      <label for="staticCertificate" class="ml-2">Certificato di Collaudo Statico</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasPreventiveMeasures"
                        binary="true"
                        inputId="preventiveMeasures">
                      </p-checkbox>
                      <label for="preventiveMeasures" class="ml-2">Presenza Misure Preventive</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasFloodProtection"
                        binary="true"
                        inputId="floodProtection">
                      </p-checkbox>
                      <label for="floodProtection" class="ml-2">Infissi antiallagamento</label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        }

        <!-- Step 2: Dati Architettonici -->
        @if (currentStep() === 1) {
          <div class="step-container">
            <h3 class="text-xl font-medium text-900 mb-4">Dati Architettonici</h3>
            
            <form [formGroup]="architecturalForm" class="grid grid-cols-12 gap-6">
              <!-- Dimensioni in pianta -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Dimensioni in pianta (m²) *</label>
                <p-inputNumber 
                  formControlName="floorArea"
                  placeholder="Es. 250"
                  [min]="1"
                  [max]="100000"
                  suffix=" m²"
                  class="w-full">
                </p-inputNumber>
                @if (architecturalForm.get('floorArea')?.invalid && architecturalForm.get('floorArea')?.touched) {
                  <small class="p-error">Dimensioni in pianta richieste</small>
                }
              </div>

              <!-- Numero piani -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Numero piani *</label>
                <p-inputNumber 
                  formControlName="floors"
                  placeholder="Es. 4"
                  [min]="1"
                  [max]="50"
                  [useGrouping]="false"
                  class="w-full">
                </p-inputNumber>
                @if (architecturalForm.get('floors')?.invalid && architecturalForm.get('floors')?.touched) {
                  <small class="p-error">Numero piani richiesto</small>
                }
              </div>

              <!-- Altezza media interpiano -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Altezza media interpiano (m) *</label>
                <p-inputNumber 
                  formControlName="averageFloorHeight"
                  placeholder="Es. 3"
                  [min]="2"
                  [max]="10"
                  [minFractionDigits]="1"
                  [maxFractionDigits]="2"
                  suffix=" m"
                  class="w-full">
                </p-inputNumber>
                @if (architecturalForm.get('averageFloorHeight')?.invalid && architecturalForm.get('averageFloorHeight')?.touched) {
                  <small class="p-error">Altezza media interpiano richiesta</small>
                }
              </div>

              <!-- Tamponamenti -->
              <div class="col-span-12">
                <p-divider align="left">
                  <span class="text-900 font-medium">Tamponamenti</span>
                </p-divider>
                
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasExternalWalls"
                        binary="true"
                        inputId="externalWalls">
                      </p-checkbox>
                      <label for="externalWalls" class="ml-2">Tamponamento esterno</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-6">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasInternalWalls"
                        binary="true"
                        inputId="internalWalls">
                      </p-checkbox>
                      <label for="internalWalls" class="ml-2">Tamponamento interno</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- File Upload Sections -->
              <div class="col-span-12">
                <p-divider align="left">
                  <span class="text-900 font-medium">Documenti del progetto</span>
                </p-divider>
                
                <!-- Immagini progetto -->
                <div class="mb-4">
                  <label class="block text-900 font-medium mb-2">Carica o trascina qui un'immagine per il tuo progetto</label>
                  <p class="text-600 text-sm mb-3">File accettati: .img, .pdf</p>
                  <p-fileUpload 
                    mode="basic" 
                    name="projectImages"
                    accept=".jpg,.jpeg,.png,.pdf"
                    [maxFileSize]="10000000"
                    chooseLabel="Carica file (max 10 MB)"
                    (onSelect)="onFileSelect($event, 'projectImages')"
                    class="w-full">
                  </p-fileUpload>
                </div>

                <!-- Piante -->
                <div class="mb-4">
                  <label class="block text-900 font-medium mb-2">Carica o trascina qui la pianta del tuo progetto</label>
                  <p class="text-600 text-sm mb-3">File accettati: .dfx, .img, .pdf</p>
                  <p-fileUpload 
                    mode="basic" 
                    name="floorPlans"
                    accept=".dwg,.dxf,.jpg,.jpeg,.png,.pdf"
                    [maxFileSize]="10000000"
                    chooseLabel="Carica file (max 10 MB)"
                    (onSelect)="onFileSelect($event, 'floorPlans')"
                    class="w-full">
                  </p-fileUpload>
                </div>

                <!-- Prospetti -->
                <div class="mb-4">
                  <label class="block text-900 font-medium mb-2">Carica o trascina qui i prospetti del tuo progetto</label>
                  <p class="text-600 text-sm mb-3">File accettati: .dfx, .img, .pdf</p>
                  <p-fileUpload 
                    mode="basic" 
                    name="elevations"
                    accept=".dwg,.dxf,.jpg,.jpeg,.png,.pdf"
                    [maxFileSize]="10000000"
                    chooseLabel="Carica file (max 10 MB)"
                    (onSelect)="onFileSelect($event, 'elevations')"
                    class="w-full">
                  </p-fileUpload>
                </div>
              </div>
            </form>
          </div>
        }

        <!-- Step 3: Dati Strutturali -->
        @if (currentStep() === 2) {
          <div class="step-container">
            <h3 class="text-xl font-medium text-900 mb-4">Dati Strutturali</h3>
            
            <form [formGroup]="structuralForm" class="grid grid-cols-12 gap-6">
              <!-- Numero di impalcati in elevazione -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Numero di impalcati in elevazione *</label>
                <p-inputNumber 
                  formControlName="floorsInElevation"
                  placeholder="Es. 3"
                  [min]="1"
                  [max]="50"
                  [useGrouping]="false"
                  class="w-full">
                </p-inputNumber>
                @if (structuralForm.get('floorsInElevation')?.invalid && structuralForm.get('floorsInElevation')?.touched) {
                  <small class="p-error">Numero impalcati richiesto</small>
                }
              </div>

              <!-- Tipologia di impalcato -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Tipologia di impalcato *</label>
                <p-dropdown 
                  formControlName="floorType"
                  [options]="floorTypes"
                  placeholder="Seleziona tipologia"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full">
                </p-dropdown>
                @if (structuralForm.get('floorType')?.invalid && structuralForm.get('floorType')?.touched) {
                  <small class="p-error">Tipologia impalcato richiesta</small>
                }
              </div>

              <!-- Totale altezza fuori terra -->
              <div class="col-span-12 md:col-span-4">
                <label class="block text-900 font-medium mb-2">Totale altezza fuori terra (m) *</label>
                <p-inputNumber 
                  formControlName="totalHeightAboveGround"
                  placeholder="Es. 11"
                  [min]="3"
                  [max]="200"
                  [minFractionDigits]="1"
                  [maxFractionDigits]="2"
                  suffix=" m"
                  class="w-full">
                </p-inputNumber>
                @if (structuralForm.get('totalHeightAboveGround')?.invalid && structuralForm.get('totalHeightAboveGround')?.touched) {
                  <small class="p-error">Altezza totale richiesta</small>
                }
              </div>

              <!-- Regolarità strutturale -->
              <div class="col-span-12">
                <p-divider align="left">
                  <span class="text-900 font-medium">Regolarità strutturale</span>
                </p-divider>
                
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12 md:col-span-4">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasElevationRegularity"
                        binary="true"
                        inputId="elevationRegularity">
                      </p-checkbox>
                      <label for="elevationRegularity" class="ml-2">Regione in elevazione</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-4">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasFloorRegularity"
                        binary="true"
                        inputId="floorRegularity">
                      </p-checkbox>
                      <label for="floorRegularity" class="ml-2">Regione in pianta</label>
                    </div>
                  </div>
                  
                  <div class="col-span-12 md:col-span-4">
                    <div class="flex align-items-center">
                      <p-checkbox 
                        formControlName="hasRigidFloors"
                        binary="true"
                        inputId="rigidFloors">
                      </p-checkbox>
                      <label for="rigidFloors" class="ml-2">Impalcati rigidi</label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        }

        <!-- Step 4: Dati Immobiliari -->
        @if (currentStep() === 3) {
          <div class="step-container">
            <h3 class="text-xl font-medium text-900 mb-4">Dati Immobiliari</h3>
            
            <form [formGroup]="propertyForm" class="grid grid-cols-12 gap-6">
              <!-- Data di acquisto -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Data di acquisto *</label>
                <p-calendar 
                  formControlName="purchaseDate"
                  placeholder="gg/mm/aaaa"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full">
                </p-calendar>
                @if (propertyForm.get('purchaseDate')?.invalid && propertyForm.get('purchaseDate')?.touched) {
                  <small class="p-error">Data di acquisto richiesta</small>
                }
              </div>

              <!-- Valore all'acquisto -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Valore all'acquisto (€) *</label>
                <p-inputNumber 
                  formControlName="purchaseValue"
                  placeholder="Es. 500000"
                  [min]="0"
                  [max]="100000000"
                  mode="currency"
                  currency="EUR"
                  locale="it-IT"
                  class="w-full">
                </p-inputNumber>
                @if (propertyForm.get('purchaseValue')?.invalid && propertyForm.get('purchaseValue')?.touched) {
                  <small class="p-error">Valore all'acquisto richiesto</small>
                }
              </div>

              <!-- Data ultima valutazione -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Data ultima valutazione *</label>
                <p-calendar 
                  formControlName="lastValuationDate"
                  placeholder="gg/mm/aaaa"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  class="w-full">
                </p-calendar>
                @if (propertyForm.get('lastValuationDate')?.invalid && propertyForm.get('lastValuationDate')?.touched) {
                  <small class="p-error">Data ultima valutazione richiesta</small>
                }
              </div>

              <!-- Valore valutazione -->
              <div class="col-span-12 md:col-span-6">
                <label class="block text-900 font-medium mb-2">Valore valutazione (€) *</label>
                <p-inputNumber 
                  formControlName="lastValuationValue"
                  placeholder="Es. 500000"
                  [min]="0"
                  [max]="100000000"
                  mode="currency"
                  currency="EUR"
                  locale="it-IT"
                  class="w-full">
                </p-inputNumber>
                @if (propertyForm.get('lastValuationValue')?.invalid && propertyForm.get('lastValuationValue')?.touched) {
                  <small class="p-error">Valore valutazione richiesto</small>
                }
              </div>
            </form>
          </div>
        }

        <!-- Step 5: Configurazione Sensori -->
        @if (currentStep() === 4) {
          <div class="step-container">
            <h3 class="text-xl font-medium text-900 mb-4">Configurazione</h3>
            
            <form [formGroup]="sensorForm" class="grid grid-cols-12 gap-6">
              <!-- Tipologia sensori -->
              <div class="col-span-12">
                <label class="block text-900 font-medium mb-3">Tipologia sensori</label>
                <div class="flex gap-4">
                  <div class="flex align-items-center">
                    <p-radioButton 
                      formControlName="connectionType"
                      value="wireless"
                      inputId="wireless">
                    </p-radioButton>
                    <label for="wireless" class="ml-2">Wireless</label>
                  </div>
                  
                  <div class="flex align-items-center">
                    <p-radioButton 
                      formControlName="connectionType"
                      value="wired"
                      inputId="wired">
                    </p-radioButton>
                    <label for="wired" class="ml-2">Cablato</label>
                  </div>
                </div>
              </div>

              <!-- Selezione configurazione -->
              <div class="col-span-12">
                <label class="block text-900 font-medium mb-3">Selezione configurazione</label>
                
                <div class="grid grid-cols-12 gap-4">
                  <!-- Base -->
                  <div class="col-span-12 md:col-span-4">
                    <div class="border-2 border-round p-4 cursor-pointer transition-all duration-200"
                         [ngClass]="sensorForm.get('configurationLevel')?.value === 'base' ? 'border-primary bg-primary-50' : 'border-300'"
                         (click)="selectConfiguration('base')">
                      <div class="text-center mb-3">
                        <h4 class="text-900 font-medium mb-2">Base</h4>
                        <div class="flex justify-content-center mb-3">
                          <i class="pi pi-building text-4xl text-600"></i>
                        </div>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-purple-500 text-xs"></i>
                          <span class="text-sm">Accelerometro</span>
                          <span class="ml-auto font-medium">1</span>
                        </div>
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-orange-500 text-xs"></i>
                          <span class="text-sm">Ambientale</span>
                          <span class="ml-auto font-medium">1</span>
                        </div>
                      </div>
                      
                      <div class="mt-3 pt-3 border-top-1 border-300">
                        <p-button 
                          label="Aggiungi sensore" 
                          icon="pi pi-plus"
                          size="small"
                          [text]="true"
                          class="w-full">
                        </p-button>
                      </div>
                    </div>
                  </div>

                  <!-- Completo -->
                  <div class="col-span-12 md:col-span-4">
                    <div class="border-2 border-round p-4 cursor-pointer transition-all duration-200"
                         [ngClass]="sensorForm.get('configurationLevel')?.value === 'complete' ? 'border-primary bg-primary-50' : 'border-300'"
                         (click)="selectConfiguration('complete')">
                      <div class="text-center mb-3">
                        <h4 class="text-900 font-medium mb-2">Completo</h4>
                        <div class="flex justify-content-center mb-3">
                          <i class="pi pi-building text-4xl text-600"></i>
                        </div>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-purple-500 text-xs"></i>
                          <span class="text-sm">Accelerometro</span>
                          <span class="ml-auto font-medium">n.</span>
                        </div>
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-orange-500 text-xs"></i>
                          <span class="text-sm">Ambientale</span>
                          <span class="ml-auto font-medium">1</span>
                        </div>
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-blue-500 text-xs"></i>
                          <span class="text-sm">Inclinometro</span>
                          <span class="ml-auto font-medium">1</span>
                        </div>
                      </div>
                      
                      <div class="mt-3 pt-3 border-top-1 border-300">
                        <p-button 
                          label="Aggiungi sensore" 
                          icon="pi pi-plus"
                          size="small"
                          [text]="true"
                          class="w-full">
                        </p-button>
                      </div>
                    </div>
                  </div>

                  <!-- Esperto -->
                  <div class="col-span-12 md:col-span-4">
                    <div class="border-2 border-round p-4 cursor-pointer transition-all duration-200"
                         [ngClass]="sensorForm.get('configurationLevel')?.value === 'expert' ? 'border-primary bg-primary-50' : 'border-300'"
                         (click)="selectConfiguration('expert')">
                      <div class="text-center mb-3">
                        <h4 class="text-900 font-medium mb-2">Esperto</h4>
                        <div class="flex justify-content-center mb-3">
                          <i class="pi pi-building text-4xl text-600"></i>
                        </div>
                      </div>
                      
                      <div class="space-y-2">
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-purple-500 text-xs"></i>
                          <span class="text-sm">Accelerometro</span>
                          <span class="ml-auto font-medium">n.</span>
                        </div>
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-orange-500 text-xs"></i>
                          <span class="text-sm">Ambientale</span>
                          <span class="ml-auto font-medium">n.</span>
                        </div>
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-blue-500 text-xs"></i>
                          <span class="text-sm">Inclinometro</span>
                          <span class="ml-auto font-medium">n.</span>
                        </div>
                      </div>
                      
                      <div class="mt-3 pt-3 border-top-1 border-300">
                        <p-button 
                          label="Aggiungi sensore" 
                          icon="pi pi-plus"
                          size="small"
                          [text]="true"
                          class="w-full">
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Salta per il momento -->
              <div class="col-span-12 text-center">
                <p-button 
                  label="Salta per il momento" 
                  severity="secondary"
                  [text]="true"
                  (onClick)="skipSensorConfiguration()">
                </p-button>
              </div>
            </form>
          </div>
        }

        <!-- Step 6: Completamento -->
        @if (currentStep() === 5) {
          <div class="step-container text-center">
            <div class="flex justify-content-center mb-4">
              <i class="pi pi-check-circle text-6xl text-green-500"></i>
            </div>
            
            <h3 class="text-2xl font-medium text-900 mb-3">Registrazione Completata!</h3>
            <p class="text-600 text-lg mb-4">L'edificio è stato registrato con successo sulla piattaforma.</p>
            <p class="text-600 mb-6">Il sistema è ora attivo e pronto per iniziare la raccolta dati.</p>
            
            <div class="bg-gray-50 border-round p-4 mb-6">
              <h4 class="text-900 font-medium mb-3">Riepilogo configurazione</h4>
              
              <div class="grid grid-cols-12 gap-4 text-left">
                <div class="col-span-12 md:col-span-4">
                  <span class="text-600">ID configurazione</span>
                  <div class="font-medium text-900">{{ generatedProjectId() }}</div>
                </div>
                
                <div class="col-span-12 md:col-span-4">
                  <span class="text-600">Data attivazione</span>
                  <div class="font-medium text-900">{{ getCurrentDate() }}</div>
                </div>
                
                <div class="col-span-12 md:col-span-4">
                  <span class="text-600">Stato sistema</span>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-circle-fill text-green-500"></i>
                    <span class="font-medium text-900">Attivo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-content-center gap-3">
              <p-button 
                label="Scarica rapporto" 
                icon="pi pi-download"
                severity="secondary"
                (onClick)="downloadReport()">
              </p-button>
              
              <p-button 
                label="Vai alla dashboard" 
                icon="pi pi-arrow-right"
                (onClick)="goToDashboard()">
              </p-button>
            </div>
          </div>
        }
      </div>

      <!-- Navigation Buttons -->
      @if (currentStep() < 5) {
        <div class="flex justify-content-center gap-8 mt-8">
          <p-button 
            label="Indietro" 
            icon="pi pi-arrow-left"
            severity="secondary"
            [disabled]="currentStep() === 0"
            (onClick)="previousStep()">
          </p-button>
          
          @if (currentStep() === 4) {
            <p-button 
              label="Completa registrazione" 
              icon="pi pi-check"
              [loading]="isSubmitting()"
              (onClick)="completeRegistration()">
            </p-button>
          } @else {
            <p-button 
              label="Continua" 
              icon="pi pi-arrow-right"
              iconPos="right"
              [disabled]="!isCurrentStepValid()"
              (onClick)="nextStep()">
            </p-button>
          }
        </div>
      }
    </div>

    <!-- Toast Messages -->
    <p-toast></p-toast>
  `
})
export class ProjectRegistrationWizardComponent implements OnInit {
  // Reactive state
  currentStep = signal(0);
  isSubmitting = signal(false);
  generatedProjectId = signal('');

  // Forms
  basicInfoForm!: FormGroup;
  architecturalForm!: FormGroup;
  structuralForm!: FormGroup;
  propertyForm!: FormGroup;
  sensorForm!: FormGroup;

  // Steps configuration
  steps: MenuItem[] = [
    { label: 'Informazioni di base' },
    { label: 'Dati architettonici' },
    { label: 'Dati strutturali' },
    { label: 'Dati immobiliari' },
    { label: 'Configurazione' },
    { label: 'Fine' }
  ];

  // Dropdown options
  structureTypes = [
    { label: 'Edificio C.A.', value: 'concrete' },
    { label: 'Edificio Muratura', value: 'masonry' },
    { label: 'Prefabbricato', value: 'prefab' },
    { label: 'Edificio storico-monumentale', value: 'historic' },
    { label: 'Ponte', value: 'bridge' },
    { label: 'Silo', value: 'silo' },
    { label: 'Galleria', value: 'tunnel' },
    { label: 'Pendio', value: 'slope' },
    { label: 'Diga', value: 'dam' },
    { label: 'Torre a traliccio', value: 'tower' },
    { label: 'Edificio Pubblico o Strategico', value: 'public' }
  ];

  destinationUses = [
    { label: 'Residenziale', value: 'residential' },
    { label: 'Commerciale', value: 'commercial' },
    { label: 'Industriale', value: 'industrial' },
    { label: 'Uffici', value: 'office' },
    { label: 'Pubblico', value: 'public' },
    { label: 'Sanitario', value: 'healthcare' },
    { label: 'Scolastico', value: 'educational' },
    { label: 'Ricettivo', value: 'hospitality' }
  ];

  constructionClasses = [
    { label: 'Classe A', value: 'A' },
    { label: 'Classe B', value: 'B' },
    { label: 'Classe C', value: 'C' },
    { label: 'Classe D', value: 'D' }
  ];

  energyClasses = [
    { label: 'A4', value: 'A4' },
    { label: 'A3', value: 'A3' },
    { label: 'A2', value: 'A2' },
    { label: 'A1', value: 'A1' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' },
    { label: 'G', value: 'G' }
  ];

  floorTypes = [
    { label: 'Solaio in C.A.', value: 'concrete_slab' },
    { label: 'Solaio in acciaio', value: 'steel_slab' },
    { label: 'Solaio misto', value: 'composite_slab' },
    { label: 'Solaio in legno', value: 'wood_slab' },
    { label: 'Volta in muratura', value: 'masonry_vault' }
  ];

  // File storage
  uploadedFiles: { [key: string]: File[] } = {
    projectImages: [],
    floorPlans: [],
    elevations: []
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.generateProjectId();
  }

  private initializeForms(): void {
    // Step 1: Basic Info Form
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      structureType: ['', Validators.required],
      constructionYear: [null, [Validators.required, Validators.min(1800), Validators.max(2025)]],
      destinationUse: ['', Validators.required],
      constructionClass: ['', Validators.required],
      floorsAboveGround: [null, [Validators.required, Validators.min(1)]],
      averageOccupants: [null],
      energyClass: ['', Validators.required],
      hasStructuralUpgrade: [false],
      hasStaticCertificate: [false],
      hasPreventiveMeasures: [false],
      hasFloodProtection: [false]
    });

    // Step 2: Architectural Form
    this.architecturalForm = this.fb.group({
      floorArea: [null, [Validators.required, Validators.min(1)]],
      floors: [null, [Validators.required, Validators.min(1)]],
      averageFloorHeight: [null, [Validators.required, Validators.min(2)]],
      hasExternalWalls: [false],
      hasInternalWalls: [false]
    });

    // Step 3: Structural Form
    this.structuralForm = this.fb.group({
      floorsInElevation: [null, [Validators.required, Validators.min(1)]],
      floorType: ['', Validators.required],
      totalHeightAboveGround: [null, [Validators.required, Validators.min(3)]],
      hasElevationRegularity: [false],
      hasFloorRegularity: [false],
      hasRigidFloors: [false]
    });

    // Step 4: Property Form
    this.propertyForm = this.fb.group({
      purchaseDate: [null, Validators.required],
      purchaseValue: [null, [Validators.required, Validators.min(0)]],
      lastValuationDate: [null, Validators.required],
      lastValuationValue: [null, [Validators.required, Validators.min(0)]]
    });

    // Step 5: Sensor Form
    this.sensorForm = this.fb.group({
      connectionType: ['wireless', Validators.required],
      configurationLevel: ['complete', Validators.required]
    });
  }

  private generateProjectId(): void {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.generatedProjectId.set(`EDI-${year}-${random}`);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('it-IT');
  }

  // Navigation methods
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(0, step - 1));
  }

  onStepChange(index: number): void {
    // Allow navigation only to completed steps
    if (index <= this.currentStep()) {
      this.currentStep.set(index);
    }
  }

  // Validation methods
  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 0: return this.basicInfoForm.valid;
      case 1: return this.architecturalForm.valid;
      case 2: return this.structuralForm.valid;
      case 3: return this.propertyForm.valid;
      case 4: return this.sensorForm.valid;
      default: return true;
    }
  }

  // File upload methods
  onFileSelect(event: any, fileType: string): void {
    const files = event.files || event.currentFiles;
    if (files && files.length > 0) {
      this.uploadedFiles[fileType] = [...this.uploadedFiles[fileType], ...files];
      this.messageService.add({
        severity: 'success',
        summary: 'File caricato',
        detail: `${files.length} file caricato/i con successo`
      });
    }
  }

  // Sensor configuration methods
  selectConfiguration(level: 'base' | 'complete' | 'expert'): void {
    this.sensorForm.patchValue({ configurationLevel: level });
  }

  skipSensorConfiguration(): void {
    // Set default configuration and move to next step
    this.sensorForm.patchValue({ 
      connectionType: 'wireless',
      configurationLevel: 'base' 
    });
    this.nextStep();
  }

  // Completion methods
  async completeRegistration(): Promise<void> {
    if (!this.isCurrentStepValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Completa tutti i campi richiesti'
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Collect all form data
      const projectData = {
        basicInfo: this.basicInfoForm.value,
        architecturalData: this.architecturalForm.value,
        structuralData: this.structuralForm.value,
        propertyData: this.propertyForm.value,
        sensorConfiguration: this.sensorForm.value,
        uploadedFiles: this.uploadedFiles,
        projectId: this.generatedProjectId(),
        createdAt: new Date(),
        ownerId: this.authService.user()?.id
      };

      console.log('Project data to submit:', projectData);

      // Move to completion step
      this.currentStep.set(5);

      this.messageService.add({
        severity: 'success',
        summary: 'Successo',
        detail: 'Progetto registrato con successo!'
      });

    } catch (error) {
      console.error('Error submitting project:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Errore',
        detail: 'Errore durante la registrazione del progetto'
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  downloadReport(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Funzionalità di download rapporto in sviluppo'
    });
  }

  goToDashboard(): void {
    // Try to go back to the previous page, fallback to projects
    this.location.back();
  }

  cancel(): void {
    // Try to go back to the previous page, fallback to projects
    this.location.back();
  }
}
