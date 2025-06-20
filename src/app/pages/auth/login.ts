import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule, 
        CheckboxModule, 
        InputTextModule, 
        PasswordModule, 
        FormsModule, 
        RouterModule, 
        RippleModule, 
        MessageModule,
        ProgressSpinnerModule,
        AppFloatingConfigurator
    ],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <!-- SYNERGY Logo -->
                            <div class="mb-8 w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center">
                                <i class="pi pi-building text-white text-2xl"></i>
                            </div>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Benvenuto in SYNERGY</div>
                            <span class="text-muted-color font-medium">Piattaforma di Monitoraggio Strutturale</span>
                        </div>

                        <!-- Error Message -->
                        @if (errorMessage()) {
                            <p-message severity="error" [text]="errorMessage()" styleClass="w-full mb-4"></p-message>
                        }

                        <!-- Login Form -->
                        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
                            <div class="mb-6">
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                                <input 
                                    pInputText 
                                    id="email1" 
                                    name="email"
                                    type="email" 
                                    placeholder="Inserisci la tua email" 
                                    class="w-full md:w-[30rem]" 
                                    [(ngModel)]="email" 
                                    required
                                    email
                                    [disabled]="isLoading()"
                                    #emailInput="ngModel" />
                                @if (emailInput.invalid && emailInput.touched) {
                                    <small class="text-red-500">Email non valida</small>
                                }
                            </div>

                            <div class="mb-6">
                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                                <p-password 
                                    id="password1" 
                                    name="password"
                                    [(ngModel)]="password" 
                                    placeholder="Inserisci la password" 
                                    [toggleMask]="true" 
                                    [fluid]="true" 
                                    [feedback]="false"
                                    [disabled]="isLoading()"
                                    required
                                    #passwordInput="ngModel">
                                </p-password>
                                @if (passwordInput.invalid && passwordInput.touched) {
                                    <small class="text-red-500">Password richiesta</small>
                                }
                            </div>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="rememberMe" id="rememberme1" name="rememberMe" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Ricordami</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Password dimenticata?</span>
                            </div>

                            <p-button 
                                type="submit"
                                [label]="isLoading() ? 'Accesso in corso...' : 'Accedi'" 
                                styleClass="w-full"
                                [disabled]="loginForm.invalid || isLoading()"
                                [loading]="isLoading()">
                            </p-button>
                        </form>

                        <!-- Demo Users -->
                        <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
                            <div class="text-center mb-4">
                                <span class="text-muted-color text-sm">Demo - Utenti di test:</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <p-button 
                                    label="Super Admin" 
                                    severity="secondary" 
                                    size="small"
                                    styleClass="w-full"
                                    (onClick)="loginAsDemo('admin@logicatre.it')"
                                    [disabled]="isLoading()">
                                </p-button>
                                <p-button 
                                    label="Admin Partner" 
                                    severity="secondary" 
                                    size="small"
                                    styleClass="w-full"
                                    (onClick)="loginAsDemo('admin@whitelabel.com')"
                                    [disabled]="isLoading()">
                                </p-button>
                                <p-button 
                                    label="Progettista" 
                                    severity="secondary" 
                                    size="small"
                                    styleClass="w-full"
                                    (onClick)="loginAsDemo('progettista@studio.it')"
                                    [disabled]="isLoading()">
                                </p-button>
                                <p-button 
                                    label="Proprietario" 
                                    severity="secondary" 
                                    size="small"
                                    styleClass="w-full"
                                    (onClick)="loginAsDemo('condominio@email.it')"
                                    [disabled]="isLoading()">
                                </p-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email = signal('');
    password = signal('');
    rememberMe = signal(false);
    errorMessage = signal('');
    
    // Get loading state from AuthService using computed
    isLoading = computed(() => this.authService.isLoading());

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onLogin(): void {
        if (!this.email() || !this.password()) {
            this.errorMessage.set('Email e password sono richiesti');
            return;
        }

        this.errorMessage.set('');

        // Use mock login for development
        this.authService.mockLogin(this.email()).subscribe({
            next: (response) => {
                console.log('Login successful:', response);
                
                // Check for redirect URL
                const redirectUrl = localStorage.getItem('synergy_redirect_url');
                if (redirectUrl) {
                    localStorage.removeItem('synergy_redirect_url');
                    this.router.navigate([redirectUrl]);
                } else {
                    // Navigate to appropriate dashboard based on user role
                    this.router.navigate([this.authService.getDashboardRoute()]);
                }
            },
            error: (error) => {
                console.error('Login failed:', error);
                this.errorMessage.set('Credenziali non valide. Riprova.');
            }
        });
    }

    loginAsDemo(email: string): void {
        this.email.set(email);
        this.password.set('password');
        this.onLogin();
    }
}
