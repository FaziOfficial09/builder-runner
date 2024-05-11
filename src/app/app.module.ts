import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { fieldComponents, formlyCustomeConfig } from './formlyConfig';
import { NgZorroAntdModule } from './zorro/ng-zorro-antd.module';
import { NgxMaskModule } from 'ngx-mask';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { CommonModule } from '@angular/common';
import { ShareModule } from './shared/share.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { GoogleChartsModule } from 'angular-google-charts';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GoogleMapsService } from './services/google-maps.service';
import { EnvService } from './shared/envoirment.service';
import { RouteReuseStrategy, Router } from '@angular/router';
import { AuthInterceptor } from './shared/interceptor';
import { AuthGuard } from './auth/auth.Guard';
import { CommonService } from '../common/common-services/common.service';
import { DatePipe } from '@angular/common';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { DataService } from './services/offlineDb.service';
import { AudioRecordingService } from './services/audio-recording.service';
import { VideoRecordingService } from './services/video-recording.service';
import { NotFoundComponent } from './auth/not-found/not-found.component';
import { PermissionDeniedComponent } from './auth/permission-denied/permission-denied.component';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { MsalGuard, MsalBroadcastService, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';
import { msalConfig } from './auth/auth-config';
import { SocketService } from './services/socket.service';
import { AutomergeService } from './services/automerge.service';


export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
  };
}

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])


@NgModule({
  declarations: [
    AppComponent,
    fieldComponents,
    NotFoundComponent,
    PermissionDeniedComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    FormlyNgZorroAntdModule,
    NgxMaskModule.forRoot(),
    FormlyModule.forRoot(formlyCustomeConfig),
    FullCalendarModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ShareModule,
    GoogleChartsModule,
    ContextMenuModule,
    DragDropModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json');
        },
        deps: [HttpClient]
      }
    }),
    MsalModule
    // NzIconModule.forRoot([ SettingOutline  ]),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    CommonService,
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_ICONS, useValue: icons },
    GoogleMapsService,
    EnvService,
    AuthGuard,
    DataService,
    AutomergeService,
    AudioRecordingService,
    VideoRecordingService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: function (router: Router, env: EnvService) {
        return new AuthInterceptor(router, env);
      },
      multi: true,
      deps: [Router, EnvService],
    },
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptcha.siteKey,
      } as RecaptchaSettings,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    SocketService,
  ],
  bootstrap: [AppComponent,MsalRedirectComponent],
})
export class AppModule { }
