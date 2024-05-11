import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { SiteLayoutComponent } from './_layout/site-layout/site-layout.component';
import { NotFoundComponent } from './auth/not-found/not-found.component';
import { PermissionDeniedComponent } from './auth/permission-denied/permission-denied.component';
import { PolicyComponent, PolicyMappingComponent, UserComponent, UserMappingComponent } from './accounts';

const routes: Routes = [
  {
    path: '', 
    component: SiteLayoutComponent,
    children: [
      {
        path: 'pages',
        component: PagesComponent
      },
      {
        path: 'pages/:schema',
        component: PagesComponent,
      },
      {
        path: 'pages/:schema/:id',
        component: PagesComponent,
      },
      {
        path: 'home/pages/:schema',
        component: PagesComponent
      },

      {
        path: 'permission-denied',
        component: PermissionDeniedComponent
      },
      {
        path: 'policy',
        component: PolicyComponent
      },
      {
        path: 'policy-mapping',
        component: PolicyMappingComponent
      },
      {
        path: 'user-mapping',
        component: UserMappingComponent
      },
      {
        path: 'user',
        component: UserComponent
      },
    

      { path: '**', redirectTo: 'not-found' }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import("src/app/auth/auth.module").then((m) => m.AuthModule),
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }