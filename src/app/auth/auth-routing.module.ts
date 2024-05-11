import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PdfComponent } from '../components/pdf/pdf.component';
import { AuthContainerComponent, ForgotPasswordComponent, LoginComponent, RegisterComponent, ResetPasswordComponent } from '.';
import { TaskManagerComponent } from '../components/task-manager/task-manager.component';


const routes: Routes = [
  {
    path: '',
    component: AuthContainerComponent,
    children: [
      { path: '', component: LoginComponent },
      { path: 'login', component: LoginComponent },
      { path: 'pdf/:pdfPage', component: PdfComponent },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'forgot',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
      {
        path: 'task',
        component: TaskManagerComponent
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
