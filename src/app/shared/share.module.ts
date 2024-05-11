import { PagesComponent } from './../pages/pages.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { formlyCustomeConfig } from '../formlyConfig';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { NgxMaskModule } from 'ngx-mask';
import { NgZorroAntdModule } from '../zorro/ng-zorro-antd.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { AngularSplitModule } from 'angular-split';
import { ContextMenuModule } from "@perfectmemory/ngx-contextmenu";
import {
  AccordionButtonComponent, AffixComponent, AnchorComponent, AudioComponent, AvatarComponent, BackTopComponent, BadgeComponent,
  BlockButtonsCardComponent, BreadCrumbComponent, BuilderToaterComponent, CarouselCrossfadeCardComponent, CascaderComponent, CommentComponent, DescriptionComponent,
  DividerComponent, DrawerComponent, DynamicTableComponent, DynamicTableRepeatSectionComponent, EmptyComponent, HeadingComponent,
  InvoiceTemplateComponent, ListComponent, MentionComponent, MessageComponent, ModalComponent, MultiFileUploadComponent, NewAlertsComponent,
  NotificationComponent, ParagraphComponent, PopconfirmComponent, ProgressbarsComponent, RateComponent, ResultComponent,
  SalesCardComponent, SimpleCardWithHeaderBodyFooterComponent, SkeletonComponent, StatisticComponent, StepperComponent, SwitchComponent, TableComponent,
  TabsComponent, TimelineBuilderComponent, TransferComponent, TreeComponent, TreeSelectComponent, TreeViewComponent, VideosComponent, CalendarComponent, IconComponent,
  ButtonsComponent, BoardComponent, DetailComponent, SummaryComponent, ContextMenuComponent,  ListsComponent, ContentEditDirective, HtmlBlockComponent,
  BarChartComponent,PieChartComponent,BubbleChartComponent,CandlestickChartComponent,ColumnChartComponent,GanttChartComponent,
  GeoChartComponent, HistogramChartComponent,LineChartComponent, SankeyChartComponent,ScatterChartComponent,
  TimelineChartComponent,AreaChartComponent,ComboChartComponent,SteppedAreaChartComponent ,OrgChartComponent,TableChartComponent,ListWithComponentsComponent,TreeMapComponent,
  CardWithComponentsComponent,CommentModalComponent, CommentListComponent,MenuControllComponent,PrintInvoiceComponent,FileManagerComponent,googleMapComponent,
  TaskReportComponent,ContactListComponent,RecycleComponent, BuilderMenuComponent,DebugLogComponent,TagsComponent, BuilderMenuChildComponent, GanttChartV2Component,
  SegmentedComponent,DiffCheckerComponent

} from '../components'
import { SanitizePipe } from '../pipe/sanitize.pipe';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EditorJsWrapperComponent } from '../wrappers/editor/editor-js-wrapper/editor-js-wrapper.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { MenuComponent } from '../_layout/menu/menu.component';
import { SiteLayoutComponent,
  AppSideMenuComponent,LayoutTabsDropdownComponent} from '../_layout';
import {MainComponent, MainsComponent,PageComponent,SectionsComponent} from '../pages/index'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GoogleMapsModule } from '@angular/google-maps';
import { ErrorComponent } from 'src/common/error/error.component';
import { CommonService } from '../../common/common-services/common.service';
import { ConfigurableDirective } from 'src/directive/configuration.directive';
import { ConfigurableSelectDirective } from 'src/directive/configuration-select.directive';
import { ParentCalendarComponent } from '../components/parent-calendar/parent-calendar.component';
import { AudioRecordingService } from '../services/audio-recording.service';
import { VideoRecordingService } from '../services/video-recording.service';
import { VoiceRecorderComponent } from '../components/voice-recorder/voice-recorder.component';
import { DownloadbuttonComponent } from '../components/downloadbutton/downloadbutton.component';
import { QrCodeComponent } from '../components/qr-code/qr-code.component';
import { SupportChatComponent } from '../components/support-chat/support-chat.component';
import { PdfComponent } from '../components/pdf/pdf.component';
import { EmailComponent } from '../components/email/email.component';
import { TaskManagerComponent } from '../components/task-manager/task-manager.component';
import { PolicyComponent, PolicyMappingComponent, PolicyMappingTableComponent, UserComponent, UserMappingComponent } from '../accounts';
// import { CommonService } from './common.service';
// import { WebsiteModules } from '../Website/website.module';

@NgModule({
  imports:
    [
      CommonModule,
      FormsModule,
      AngularSplitModule,
      NgJsonEditorModule,
      NgZorroAntdModule,
      ReactiveFormsModule,
      FormlyNgZorroAntdModule,
      NgxMaskModule.forRoot(),
      FormlyModule.forRoot(formlyCustomeConfig),
      FullCalendarModule,
      RouterModule,
      GoogleChartsModule,
      GoogleMapsModule,
      ContextMenuModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => {
            return new TranslateHttpLoader(http, './assets/i18n/', '.json');
          },
          deps: [HttpClient]
        }
      }),
      // WebsiteModules,
    ],
  declarations: [
    PagesComponent,
    MainComponent,
    AccordionButtonComponent, AffixComponent, AnchorComponent, AudioComponent, AvatarComponent, BackTopComponent, BadgeComponent,
    BlockButtonsCardComponent, BreadCrumbComponent, BuilderToaterComponent, CarouselCrossfadeCardComponent, CascaderComponent, CommentComponent, DescriptionComponent,
    DividerComponent, DrawerComponent, DynamicTableComponent, DynamicTableRepeatSectionComponent, EmptyComponent, HeadingComponent,
    InvoiceTemplateComponent, ListComponent, MentionComponent, MessageComponent, ModalComponent, MultiFileUploadComponent, NewAlertsComponent,
    NotificationComponent, ParagraphComponent, PopconfirmComponent, ProgressbarsComponent, RateComponent, ResultComponent,
    SalesCardComponent, SimpleCardWithHeaderBodyFooterComponent, SkeletonComponent, StatisticComponent, StepperComponent, SwitchComponent, TableComponent,
    TabsComponent, TimelineBuilderComponent, TransferComponent, TreeComponent, TreeSelectComponent, TreeViewComponent, VideosComponent, CalendarComponent,ParentCalendarComponent,
    SanitizePipe, IconComponent, ButtonsComponent,DiffCheckerComponent,
    EditorJsWrapperComponent,
    BoardComponent, DetailComponent, SummaryComponent, ContextMenuComponent,  ListsComponent, HtmlBlockComponent,
    ContentEditDirective, BarChartComponent,PieChartComponent,BubbleChartComponent,CandlestickChartComponent,ColumnChartComponent,
    GanttChartComponent,GeoChartComponent, HistogramChartComponent,LineChartComponent,
    SankeyChartComponent,AreaChartComponent,ComboChartComponent,SteppedAreaChartComponent,
    ScatterChartComponent,
    TimelineChartComponent,
    OrgChartComponent,
    TableChartComponent,
    ListWithComponentsComponent,
    TreeMapComponent,
    CardWithComponentsComponent,
    AppSideMenuComponent,LayoutTabsDropdownComponent,SiteLayoutComponent,
    MenuComponent,
    MainsComponent,PageComponent,SectionsComponent,
    CommentModalComponent,CommentListComponent,
    MenuControllComponent,
    PrintInvoiceComponent,FileManagerComponent,googleMapComponent,
    ConfigurableDirective,
    ConfigurableSelectDirective,
    TaskReportComponent,VoiceRecorderComponent,
    DownloadbuttonComponent,QrCodeComponent,
    SupportChatComponent,ContactListComponent,
    PdfComponent,EmailComponent,TaskManagerComponent,
    PolicyComponent,
    UserComponent,
    UserMappingComponent,
    PolicyMappingComponent,
    PolicyMappingTableComponent,RecycleComponent,BuilderMenuComponent,DebugLogComponent, TagsComponent,
    BuilderMenuChildComponent,GanttChartV2Component,SegmentedComponent,DiffCheckerComponent

  ],
  exports: [
    FormsModule,
    PagesComponent,
    MainComponent,
    AccordionButtonComponent, AffixComponent, AnchorComponent, AudioComponent, AvatarComponent, BackTopComponent, BadgeComponent,
    BlockButtonsCardComponent, BreadCrumbComponent, BuilderToaterComponent, CarouselCrossfadeCardComponent, CascaderComponent, CommentComponent, DescriptionComponent,
    DividerComponent, DrawerComponent, DynamicTableComponent, DynamicTableRepeatSectionComponent, EmptyComponent, HeadingComponent,
    InvoiceTemplateComponent, ListComponent, MentionComponent, MessageComponent, ModalComponent, MultiFileUploadComponent, NewAlertsComponent,
    NotificationComponent, ParagraphComponent, PopconfirmComponent, ProgressbarsComponent, RateComponent, ResultComponent,
    SalesCardComponent, SimpleCardWithHeaderBodyFooterComponent, SkeletonComponent, StatisticComponent, StepperComponent, SwitchComponent, TableComponent,
    TabsComponent, TimelineBuilderComponent, TransferComponent, TreeComponent, TreeSelectComponent, TreeViewComponent, VideosComponent, IconComponent, ButtonsComponent,
    EditorJsWrapperComponent,
    BoardComponent,
    DetailComponent,
    SummaryComponent,
    ContextMenuComponent,
    ListsComponent,
    ContentEditDirective,
    EditorJsWrapperComponent,
    HtmlBlockComponent,
    BarChartComponent,
    PieChartComponent,
    BubbleChartComponent,
    CandlestickChartComponent,
    ColumnChartComponent,
    GanttChartComponent,
    GeoChartComponent,
    GeoChartComponent,
    HistogramChartComponent,
    LineChartComponent,
    SankeyChartComponent,
    ScatterChartComponent,
    TimelineChartComponent,
    OrgChartComponent,
    TableChartComponent,
    AreaChartComponent,
    ComboChartComponent,
    SteppedAreaChartComponent,
    ListWithComponentsComponent,
    TreeMapComponent,
    CardWithComponentsComponent,
    AppSideMenuComponent,LayoutTabsDropdownComponent,SiteLayoutComponent,
    MenuComponent,
    MainsComponent,PageComponent,SectionsComponent,
    CommentModalComponent,CommentListComponent,
    MenuControllComponent,
    PrintInvoiceComponent,FileManagerComponent,googleMapComponent,
    ConfigurableDirective,
    ConfigurableSelectDirective,
    TaskReportComponent,
    ParentCalendarComponent,
    VoiceRecorderComponent,
    DownloadbuttonComponent,QrCodeComponent,
    SupportChatComponent,ContactListComponent,
    PdfComponent,EmailComponent,TaskManagerComponent,
    PolicyComponent,
    UserComponent,
    UserMappingComponent,
    PolicyMappingComponent,
    PolicyMappingTableComponent,RecycleComponent,BuilderMenuComponent,DebugLogComponent,TagsComponent,
    BuilderMenuChildComponent,
    GanttChartV2Component,SegmentedComponent,DiffCheckerComponent
    //
    // ErrorComponent
  ],
  providers: [
    AudioRecordingService,
    VideoRecordingService,
  ],
})

export class ShareModule {

}
