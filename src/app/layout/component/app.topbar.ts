import { Component, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, ButtonModule, AppConfigurator],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="2" y="17" width="20" height="3" rx="1.5" fill="currentColor"/>
                </svg>
            </button>
            <a class="layout-topbar-logo" [routerLink]="authService.getDashboardRoute()">
                <!-- SYNERGY Logo -->
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-2">
                    <i class="pi pi-building text-white text-lg"></i>
                </div>
                <span class="text-xl font-semibold">SYNERGY</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <!-- User Info & Role Badge -->
            @if (currentUser()) {
                <div class="flex items-center gap-3 mr-4">
                    <div class="text-right">
                        <div class="text-sm font-medium text-surface-900 dark:text-surface-0">
                            {{ currentUser()!.firstName }} {{ currentUser()!.lastName }}
                        </div>
                        <div class="text-xs text-muted-color">
                            {{ getRoleLabel(currentUser()!.roleLevel) }}
                        </div>
                    </div>
                    <div [ngClass]="getRoleBadgeClass(currentUser()!.roleLevel)" 
                         class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ getRoleAbbreviation(currentUser()!.roleLevel) }}
                    </div>
                </div>
            }

            <div class="layout-config-menu">
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <!-- User Menu -->
            <div class="relative">
                <button 
                    class="layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true">
                    <i class="pi pi-user"></i>
                </button>
                <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    @if (authService.canAccess('projects')) {
                        <button type="button" class="layout-topbar-action" [routerLink]="['/dashboard']">
                            <i class="pi pi-home"></i>
                            <span>Dashboard</span>
                        </button>
                    }
                    @if (authService.canAccess('users', 'admin')) {
                        <button type="button" class="layout-topbar-action" [routerLink]="['/admin/projects']">
                            <i class="pi pi-users"></i>
                            <span>Gestione</span>
                        </button>
                    }
                    <button type="button" class="layout-topbar-action" (click)="logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    currentUser = computed(() => this.authService.user());
    userMenuItems: MenuItem[] = [];

    constructor(
        public layoutService: LayoutService,
        public authService: AuthService
    ) {
        this.setupUserMenu();
    }

    private setupUserMenu(): void {
        this.userMenuItems = [
            {
                label: 'Profilo',
                icon: 'pi pi-user',
                command: () => {
                    // Navigate to profile page
                }
            },
            {
                label: 'Impostazioni',
                icon: 'pi pi-cog',
                command: () => {
                    // Navigate to settings page
                }
            },
            { separator: true },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => this.logout()
            }
        ];
    }

    logout(): void {
        this.authService.logout();
    }

    getRoleLabel(roleLevel: number): string {
        switch (roleLevel) {
            case 1: return 'Super Amministratore';
            case 2: return 'Amministratore';
            case 3: return 'Progettista';
            case 4: return 'Proprietario';
            default: return 'Utente';
        }
    }

    getRoleAbbreviation(roleLevel: number): string {
        switch (roleLevel) {
            case 1: return 'SA';
            case 2: return 'ADM';
            case 3: return 'PRO';
            case 4: return 'USR';
            default: return 'U';
        }
    }

    getRoleBadgeClass(roleLevel: number): string {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
        switch (roleLevel) {
            case 1: return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
            case 2: return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
            case 3: return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
            case 4: return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
            default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
        }
    }
}
