import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <div class="menu-container">
            <ul class="layout-menu">
                <ng-container *ngFor="let item of mainMenuItems(); let i = index">
                    <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                    <li *ngIf="item.separator" class="menu-separator"></li>
                </ng-container>
            </ul>
            
            <ul class="layout-menu layout-menu-bottom" *ngIf="bottomMenuItem() as bottomItem">
                <li app-menuitem [item]="bottomItem" [index]="0" [root]="true"></li>
            </ul>
        </div>
    `,
    styles: [`
        .menu-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        .layout-menu {
            flex: 1;
        }
        
        .layout-menu-bottom {
            flex: none;
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid var(--surface-border);
        }
    `]
})
export class AppMenu {
    // Dynamic menu based on user role
    model = computed(() => this.buildMenuForCurrentUser());
    
    // Main menu items (everything except Preferenze)
    mainMenuItems = computed(() => {
        const allItems = this.model();
        return allItems.filter(item => item.label !== 'Preferenze');
    });
    
    // Bottom menu item (only Preferenze)
    bottomMenuItem = computed(() => {
        const allItems = this.model();
        return allItems.find(item => item.label === 'Preferenze') || null;
    });

    constructor(private authService: AuthService) {}

    private buildMenuForCurrentUser(): MenuItem[] {
        const currentUser = this.authService.user();
        if (!currentUser) return this.getDefaultMenu();

        const menu: MenuItem[] = [
            // DASHBOARD (panoramica generale)
            {
                label: 'Dashboard',
                items: [
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-home', 
                        routerLink: ['/dashboard'] 
                    }
                ]
            },

            // PROJECTS (pagina dedicata con thumbnail)
            {
                label: 'Projects',
                items: [
                    { 
                        label: 'I Miei Progetti', 
                        icon: 'pi pi-fw pi-building', 
                        routerLink: ['/projects'] 
                    }
                ]
            },

            // TOOLS
            {
                label: 'Tools',
                items: [
                    { 
                        label: 'Strumenti', 
                        icon: 'pi pi-fw pi-wrench', 
                        routerLink: ['/tools'] 
                    }
                ]
            },

            // ANALYTICS
            {
                label: 'Analytics',
                items: [
                    { 
                        label: 'Grafici e Analisi', 
                        icon: 'pi pi-fw pi-chart-bar', 
                        routerLink: ['/analytics'] 
                    }
                ]
            },

            // REPORT
            {
                label: 'Report',
                items: [
                    { 
                        label: 'Rapporti', 
                        icon: 'pi pi-fw pi-file-pdf', 
                        routerLink: ['/reports'] 
                    }
                ]
            }
        ];

        // Add role-specific menu items
        if (currentUser.roleLevel <= 3) { // User+ and above
            // Add user management for authorized users
            menu.push({
                label: 'Gestione Utenti',
                items: [
                    { 
                        label: this.getUserManagementLabel(currentUser.roleLevel), 
                        icon: 'pi pi-fw pi-users', 
                        routerLink: ['/user-management'] 
                    }
                ]
            });
        }

        // PREFERENZE (al bottom della sidebar)
        menu.push({
            label: 'Preferenze',
            items: [
                { 
                    label: 'Preferenze', 
                    icon: 'pi pi-fw pi-cog', 
                    routerLink: ['/settings/preferences'] 
                }
            ]
        });

        return menu;
    }

    private getUserManagementLabel(roleLevel: number): string {
        switch (roleLevel) {
            case 1: return 'Gestione Utenti';
            case 2: return 'Gestione Utenti';
            case 3: return 'Gestione Utenti';
            default: return 'Gestione Utenti';
        }
    }

    private isDevelopmentMode(): boolean {
        // In production, this should be false or based on environment
        return true;
    }

    private getDefaultMenu(): MenuItem[] {
        // Fallback menu when no user is authenticated
        return [
            {
                label: 'Home',
                items: [
                    { 
                        label: 'Dashboard', 
                        icon: 'pi pi-fw pi-home', 
                        routerLink: ['/dashboard'] 
                    }
                ]
            },
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/app/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/app/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/app/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/app/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/app/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/app/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/app/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/app/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/app/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/app/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/app/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/app/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/app/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/app/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/app/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/app/pages/crud']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/app/pages/empty']
                    }
                ]
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/app/documentation']
                    },
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/primefaces/sakai-ng',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
