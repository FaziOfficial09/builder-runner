import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PolicyComponent, PolicyMappingComponent, UserComponent, UserMappingComponent } from '.';


const routes: Routes = [
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

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
