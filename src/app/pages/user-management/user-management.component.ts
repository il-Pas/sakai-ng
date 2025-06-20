import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components (following Sakai CRUD pattern)
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

// Services
import { AuthService } from '../../core/auth/auth.service';
import { UserService, UserWithProjects, UserStats } from '../../core/services/user.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LayoutService } from '../../layout/service/layout.service';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    InputIconModule,
    IconFieldModule,
    ChartModule,
    CardModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="grid grid-cols-12 gap-8">
      <!-- Statistics Cards Row -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">{{ getStatsLabel('users') }}</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalUsers }}</div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-users text-blue-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">+3 </span>
          <span class="text-muted-color">nuovi utenti</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Progetti Attivi</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().activeProjects }}</div>
            </div>
            <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-building text-orange-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">+12% </span>
          <span class="text-muted-color">crescita mensile</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Sensori Monitorati</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().totalSensors }}</div>
            </div>
            <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-wifi text-cyan-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">98% </span>
          <span class="text-muted-color">online</span>
        </div>
      </div>
      
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
          <div class="flex justify-between mb-4">
            <div>
              <span class="block text-muted-color font-medium mb-4">Inviti Pendenti</span>
              <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats().pendingInvitations }}</div>
            </div>
            <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
              <i class="pi pi-clock text-purple-500 !text-xl"></i>
            </div>
          </div>
          <span class="text-primary font-medium">85% </span>
          <span class="text-muted-color">tasso risposta</span>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="col-span-12 xl:col-span-6">
        <div class="card">
          <h5>Distribuzione Utenti per Ruolo</h5>
          <p-chart type="doughnut" [data]="roleChartData" [options]="roleChartOptions" style="height: 300px;" />
        </div>
      </div>
      
      <div class="col-span-12 xl:col-span-6">
        <div class="card">
          <h5>Attività Recente</h5>
          <div class="timeline-container">
            @for (activity of recentActivities(); track activity.id) {
              <div class="flex align-items-center p-2 border-bottom-1 surface-border">
                <div class="flex align-items-center justify-content-center border-round mr-3" 
                     [ngClass]="getActivityIconClass(activity.type)"
                     style="width:2rem;height:2rem">
                  <i [class]="getActivityIcon(activity.type)" class="text-white text-sm"></i>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-900 text-sm">{{ activity.title }}</div>
                  <div class="text-600 text-xs">{{ activity.description }}</div>
                  <div class="text-400 text-xs">{{ formatActivityTime(activity.timestamp) }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Main Users Table -->
      <div class="col-span-12">
        <p-toolbar styleClass="mb-4">
          <ng-template pTemplate="left">
            @if (canInviteUsers()) {
              <p-button 
                label="Invita Utente" 
                icon="pi pi-plus" 
                severity="secondary" 
                class="mr-2" 
                (onClick)="openInviteDialog()" />
            }
            @if (canExportData()) {
              <p-button 
                severity="secondary" 
                label="Esporta" 
                icon="pi pi-upload" 
                outlined 
                (onClick)="exportCSV()" />
            }
          </ng-template>
        </p-toolbar>

        <p-table
          #dt
          [value]="filteredUsers()"
          [rows]="10"
          [paginator]="true"
          [globalFilterFields]="['firstName', 'lastName', 'email', 'roleLevel']"
          [tableStyle]="{ 'min-width': '75rem' }"
          [(selection)]="selectedUsers"
          [rowHover]="true"
          dataKey="id"
          currentPageReportTemplate="Mostrando {first} a {last} di {totalRecords} utenti"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
          [loading]="loading()"
        >
          <ng-template pTemplate="caption">
            <div class="flex align-items-center justify-content-between">
              <h5 class="m-0">{{ getTableTitle() }}</h5>
              <p-iconField iconPosition="left">
                <p-inputIcon styleClass="pi pi-search" />
                <input 
                  pInputText 
                  type="text" 
                  (input)="onGlobalFilter(dt, $event)" 
                  placeholder="Cerca utenti..." />
              </p-iconField>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              @if (canManageMultipleUsers()) {
                <th style="width: 3rem">
                  <p-tableHeaderCheckbox />
                </th>
              }
              <th pSortableColumn="firstName" style="min-width:16rem">
                Utente
                <p-sortIcon field="firstName" />
              </th>
              <th pSortableColumn="roleLevel" style="min-width:10rem">
                Ruolo
                <p-sortIcon field="roleLevel" />
              </th>
              @if (showProjectsColumn()) {
                <th style="min-width:12rem">Progetti</th>
              }
              <th pSortableColumn="status" style="min-width:8rem">
                Stato
                <p-sortIcon field="status" />
              </th>
              <th pSortableColumn="lastAccess" style="min-width:12rem">
                Ultimo Accesso
                <p-sortIcon field="lastAccess" />
              </th>
              <th style="min-width:8rem">Azioni</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-user>
            <tr>
              @if (canManageMultipleUsers()) {
                <td>
                  <p-tableCheckbox [value]="user" />
                </td>
              }
              <td>
                <div class="flex align-items-center gap-2">
                  <div class="flex align-items-center justify-content-center border-round" 
                       [ngClass]="getUserAvatarClass(user.roleLevel)"
                       style="width:2.5rem;height:2.5rem">
                    <span class="text-white font-medium">
                      {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <div class="font-medium text-900">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="text-500 text-sm">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <p-tag 
                  [value]="getRoleLabel(user.roleLevel)" 
                  [severity]="getRoleSeverity(user.roleLevel)" />
              </td>
              @if (showProjectsColumn()) {
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for (project of user.projects.slice(0, 2); track project.id) {
                      <p-tag 
                        [value]="project.name" 
                        severity="info" 
                        styleClass="text-xs" />
                    }
                    @if (user.projects.length > 2) {
                      <p-tag 
                        [value]="'+' + (user.projects.length - 2)" 
                        severity="secondary" 
                        styleClass="text-xs" />
                    }
                  </div>
                </td>
              }
              <td>
                <p-tag 
                  [value]="getStatusLabel(user.status)" 
                  [severity]="getStatusSeverity(user.status)" />
              </td>
              <td>{{ formatDate(user.lastAccess) }}</td>
              <td>
                <div class="flex gap-2">
                  @if (canEditUser(user)) {
                    <p-button 
                      icon="pi pi-pencil" 
                      [rounded]="true" 
                      [outlined]="true" 
                      severity="secondary"
                      size="small"
                      (click)="editUser(user)" />
                  }
                  @if (canManageProjects(user)) {
                    <p-button 
                      icon="pi pi-building" 
                      [rounded]="true" 
                      [outlined]="true" 
                      severity="info"
                      size="small"
                      (click)="manageUserProjects(user)" />
                  }
                  @if (canRemoveUser(user)) {
                    <p-button 
                      icon="pi pi-trash" 
                      [rounded]="true" 
                      [outlined]="true" 
                      severity="danger"
                      size="small"
                      (click)="deleteUser(user)" />
                  }
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="getColumnCount()" class="text-center">
                <div class="flex flex-column align-items-center justify-content-center py-4">
                  <i class="pi pi-users text-4xl text-400 mb-3"></i>
                  <span class="text-900 text-lg font-medium mb-2">Nessun utente trovato</span>
                  <span class="text-600">{{ getEmptyMessage() }}</span>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Invite User Dialog -->
    <p-dialog 
      [(visible)]="inviteDialog" 
      [style]="{width: '450px'}" 
      header="Invita Nuovo Utente" 
      [modal]="true">
      
      <ng-template pTemplate="content">
        <div class="flex flex-column gap-4">
          <div>
            <label for="inviteEmail" class="block font-bold mb-3">Email</label>
            <input 
              type="text" 
              pInputText 
              id="inviteEmail"
              [(ngModel)]="inviteForm.email" 
              placeholder="Inserisci email utente"
              class="w-full" 
              [class.ng-invalid]="submitted && !inviteForm.email" />
            <small class="p-error" *ngIf="submitted && !inviteForm.email">Email è richiesta.</small>
          </div>
          
          <div>
            <label for="inviteRole" class="block font-bold mb-3">Livello Utente</label>
            <p-dropdown 
              [(ngModel)]="inviteForm.roleLevel" 
              [options]="availableRoles()" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Seleziona livello"
              class="w-full" />
          </div>
        </div>
      </ng-template>
      
      <ng-template pTemplate="footer">
        <p-button 
          label="Annulla" 
          icon="pi pi-times" 
          [text]="true" 
          (click)="hideInviteDialog()" />
        <p-button 
          label="Invia Invito" 
          icon="pi pi-check" 
          (click)="sendInvite()" 
          [loading]="inviteLoading()" />
      </ng-template>
    </p-dialog>

    <!-- Toast Messages -->
    <p-toast />
    
    <!-- Confirm Dialog -->
    <p-confirmDialog [style]="{width: '450px'}" />
  `
})
export class UserManagementComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // Reactive state
  users = signal<UserWithProjects[]>([]);
  stats = signal<UserStats>({ totalUsers: 0, activeProjects: 0, totalSensors: 0, pendingInvitations: 0 });
  loading = signal(false);
  inviteLoading = signal(false);
  
  // UI state
  inviteDialog: boolean = false;
  selectedUsers: UserWithProjects[] | null = null;
  submitted: boolean = false;
  inviteForm = {
    email: '',
    roleLevel: 4
  };

  // Chart data
  roleChartData: any;
  roleChartOptions: any;
  subscription!: Subscription;

  // Computed values
  filteredUsers = computed(() => this.users());

  recentActivities = computed(() => [
    {
      id: '1',
      type: 'user_invite',
      title: 'Nuovo invito inviato',
      description: 'Invito inviato a marco.rossi@email.it',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'user_join',
      title: 'Nuovo utente registrato',
      description: 'Laura Bianchi si è unita al team',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'project_assign',
      title: 'Progetto assegnato',
      description: 'Centro Storico assegnato a Giovanni',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'role_change',
      title: 'Ruolo modificato',
      description: 'Alessandro promosso a User+',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ]);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private layoutService: LayoutService
  ) {
    this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
      this.initChart();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadData(): void {
    this.loading.set(true);
    
    this.userService.getUsersForCurrentRole().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
        this.initChart(); // Reinitialize chart with new data
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nel caricamento degli utenti'
        });
      }
    });

    this.userService.getStatsForCurrentRole().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  private initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    const users = this.users();
    const roleDistribution = {
      superAdmin: users.filter(u => u.roleLevel === 1).length,
      admin: users.filter(u => u.roleLevel === 2).length,
      userPlus: users.filter(u => u.roleLevel === 3).length,
      user: users.filter(u => u.roleLevel === 4).length
    };

    this.roleChartData = {
      labels: ['Super Admin', 'Admin', 'User+', 'User'],
      datasets: [{
        data: [roleDistribution.superAdmin, roleDistribution.admin, roleDistribution.userPlus, roleDistribution.user],
        backgroundColor: [
          documentStyle.getPropertyValue('--p-red-500'),
          documentStyle.getPropertyValue('--p-orange-500'),
          documentStyle.getPropertyValue('--p-blue-500'),
          documentStyle.getPropertyValue('--p-green-500')
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue('--p-red-400'),
          documentStyle.getPropertyValue('--p-orange-400'),
          documentStyle.getPropertyValue('--p-blue-400'),
          documentStyle.getPropertyValue('--p-green-400')
        ]
      }]
    };

    this.roleChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };
  }

  // Table methods
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  // Dialog methods
  openInviteDialog() {
    this.inviteForm = { email: '', roleLevel: 4 };
    this.submitted = false;
    this.inviteDialog = true;
  }

  hideInviteDialog() {
    this.inviteDialog = false;
    this.submitted = false;
  }

  sendInvite() {
    this.submitted = true;

    if (!this.inviteForm.email?.trim()) {
      return;
    }

    this.inviteLoading.set(true);
    
    this.userService.inviteUser(this.inviteForm.email, this.inviteForm.roleLevel).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: response.message
        });
        this.hideInviteDialog();
        this.inviteLoading.set(false);
        this.loadData();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nell\'invio dell\'invito'
        });
        this.inviteLoading.set(false);
      }
    });
  }

  // User actions
  editUser(user: UserWithProjects) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funzionalità di modifica utente in sviluppo'
    });
  }

  manageUserProjects(user: UserWithProjects) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funzionalità di gestione progetti in sviluppo'
    });
  }

  deleteUser(user: UserWithProjects) {
    this.confirmationService.confirm({
      message: `Sei sicuro di voler rimuovere l'utente ${user.firstName} ${user.lastName}?`,
      header: 'Conferma Rimozione',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.removeUser(user.id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successo',
              detail: response.message
            });
            this.loadData();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Errore nella rimozione dell\'utente'
            });
          }
        });
      }
    });
  }

  // Helper methods
  getTableTitle(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Gestione Utenti';

    switch (currentUser.roleLevel) {
      case 1: return 'Gestione Utenti & Autorizzazioni';
      case 2: return 'Gestione Utenti Organizzazione';
      case 3: return 'Gestione Collaboratori';
      case 4: return 'I Miei Dati';
      default: return 'Gestione Utenti';
    }
  }

  getStatsLabel(type: string): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Utenti';

    if (type === 'users') {
      switch (currentUser.roleLevel) {
        case 1: return 'Utenti Totali';
        case 2: return 'Utenti Organizzazione';
        case 3: return 'Collaboratori';
        case 4: return 'Progetti Accessibili';
        default: return 'Utenti';
      }
    }
    return 'Utenti';
  }

  getEmptyMessage(): string {
    const currentUser = this.authService.user();
    if (!currentUser) return 'Nessun utente disponibile';

    switch (currentUser.roleLevel) {
      case 1: return 'Nessun utente registrato nella piattaforma';
      case 2: return 'Nessun utente nella tua organizzazione';
      case 3: return 'Non hai ancora invitato collaboratori';
      case 4: return 'Nessun dato disponibile';
      default: return 'Nessun utente disponibile';
    }
  }

  getColumnCount(): number {
    let count = 5; // Base columns
    if (this.canManageMultipleUsers()) count++;
    if (this.showProjectsColumn()) count++;
    return count;
  }

  // Permission methods
  canInviteUsers(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 3 : false;
  }

  canExportData(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 2 : false;
  }

  canManageMultipleUsers(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 2 : false;
  }

  canEditUser(user: UserWithProjects): boolean {
    const currentUser = this.authService.user();
    if (!currentUser) return false;
    return currentUser.roleLevel <= 2 || user.id === currentUser.id;
  }

  canManageProjects(user: UserWithProjects): boolean {
    const currentUser = this.authService.user();
    if (!currentUser) return false;
    return currentUser.roleLevel <= 3 && user.roleLevel >= 3;
  }

  canRemoveUser(user: UserWithProjects): boolean {
    const currentUser = this.authService.user();
    if (!currentUser) return false;
    return currentUser.roleLevel <= 2 && user.id !== currentUser.id;
  }

  showProjectsColumn(): boolean {
    const currentUser = this.authService.user();
    return currentUser ? currentUser.roleLevel <= 3 : false;
  }

  availableRoles() {
    const currentUser = this.authService.user();
    if (!currentUser) return [];

    const allRoles = [
      { label: 'Super Admin', value: 1 },
      { label: 'Admin', value: 2 },
      { label: 'User+', value: 3 },
      { label: 'User', value: 4 }
    ];

    return allRoles.filter(role => role.value >= currentUser.roleLevel);
  }

  // Utility methods
  getRoleLabel(roleLevel: number): string {
    switch (roleLevel) {
      case 1: return 'Super Admin';
      case 2: return 'Admin';
      case 3: return 'User+';
      case 4: return 'User';
      default: return 'Unknown';
    }
  }

  getRoleSeverity(roleLevel: number): string {
    switch (roleLevel) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4: return 'success';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'pending': return 'In Attesa';
      default: return status;
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  }

  getUserAvatarClass(roleLevel: number): string {
    switch (roleLevel) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_invite': return 'pi pi-send';
      case 'user_join': return 'pi pi-user-plus';
      case 'project_assign': return 'pi pi-building';
      case 'role_change': return 'pi pi-shield';
      default: return 'pi pi-info-circle';
    }
  }

  getActivityIconClass(type: string): string {
    switch (type) {
      case 'user_invite': return 'bg-blue-500';
      case 'user_join': return 'bg-green-500';
      case 'project_assign': return 'bg-orange-500';
      case 'role_change': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} giorni fa`;
    } else if (hours > 0) {
      return `${hours} ore fa`;
    } else {
      return 'Poco fa';
    }
  }
}
