import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from '../shared/share.module';
import { NgZorroAntdModule } from '../zorro/ng-zorro-antd.module';
import { EnvService } from '../shared/envoirment.service';
import { NgxMaskModule } from 'ngx-mask';
import { AccountRoutingModule } from './account-routing.module';
import {  PolicyComponent, PolicyMappingComponent, PolicyMappingTableComponent, UserComponent, UserMappingComponent } from '.';
import { FormlyModule } from '@ngx-formly/core';
import { formlyCustomeConfig } from '../formlyConfig';
import { RecaptchaModule } from 'ng-recaptcha';


@NgModule({
  declarations: [
    // PolicyComponent,
    // UserComponent,
    // UserMappingComponent,
    // PolicyMappingComponent,
    // PolicyMappingTableComponent
  ],
  imports: [
    AccountRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ShareModule,
    NgZorroAntdModule,
    FormlyModule.forRoot(formlyCustomeConfig),
    NgxMaskModule.forRoot(),
    RecaptchaModule,
  ],
  exports: [RouterModule],
  providers: [EnvService]

})
export class AccountModule { }
