import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { RegistrazioneEdificioComponent } from './registrazione-edificio/registrazione-edificio.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'registrazione-edificio', component: RegistrazioneEdificioComponent },
    {
        path: 'projects',
        loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent)
    },
    {
        path: 'projects/:id/building',
        loadComponent: () => import('./building-detail/building-detail.component').then(m => m.BuildingDetailComponent)
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
