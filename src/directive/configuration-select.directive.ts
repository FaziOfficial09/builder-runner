import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SocketService } from 'src/app/services/socket.service';
import { DataSharedService } from 'src/app/services/data-shared.service';
@Directive({
  selector: '[appConfigurableSelect]'
})
export class ConfigurableSelectDirective implements OnInit, OnDestroy {

  @Input('appConfigurableSelect') configs: Array<{ event: string, actions: Array<Action> }>;
  @Input() loadAction: LoadAction;
  @Input() templateRef: TemplateRef<any>;
  @Input() processData: (data: any[]) => any[];

  // Store the results from API
  data: any[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private viewContainer: ViewContainerRef,
    private renderer: Renderer2,
    private el: ElementRef,
    private toastr: NzMessageService,
    private socketService: SocketService,private dataSharedService:DataSharedService
  ) { }

  ngOnInit() {
    this.bindEvents();
    this.loadOptions();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.unsubscribe$.unsubscribe();
  }

  private bindEvents(): void {
    if (this.configs) {
      if (this.configs.length > 0) {
        this.configs?.forEach(config => {
          if (config?.event && config?.actions) {
            this.renderer.listen(this.viewContainer.element.nativeElement, config.event, () => {
              // alert(`${config.event.charAt(0).toUpperCase() + config.event.slice(1)} event triggered!`);
              config.actions.forEach(action => {
                this.loadAction = action;
                this.loadOptions();
                // this.executeAction(action);
              });
            });
          }
        });
      }
    }
  }

  private loadOptions(): void {
    if (this.loadAction && Object.keys(this.loadAction).length !== 0) {
      if (this.loadAction?.id) {
        const RequestGuid = this.executeAction(this.loadAction)
        this.dataSharedService.saveDebugLog('ConfigurableSelectDirective',RequestGuid)

        this.socketService.OnResponseMessage()
          .subscribe(
            response => {
              try {
                if (response.parseddata.requestId == RequestGuid && response.parseddata.isSuccess) {
                  response = response.parseddata.apidata;
                  if (response) {
                    if (!response?.isSuccess && response?.data?.length == 0) {
                      this.toastr.error(response.message, { nzDuration: 3000 });
                    }
                    this.data = response;
                    // Process this.data
                    if (this.processData) {
                      this.data = this.processData(this.data);
                    }
                    // this.viewContainer.clear();

                    // this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: this.data });
                  } else {
                    this.data = [];
                    if (this.processData) {
                      this.data = this.processData(this.data);
                    }
                  }
                }

              } catch (error) {
                console.error("Error while processing response:", error);
                // Handle the error appropriately (e.g., show error message, set default data, etc.)
              }
            },
            error => {
              console.error("API call failed:", error);
              this.data = [];
              if (this.processData) {
                this.data = this.processData(this.data);
              }
              // Handle the API call error (e.g., show error message, set default data, etc.)
            }
          );
      }

    }
  }

  private executeAction(action: Action): any {
    const { id, actionLink, data, headers, parentId, page, pageSize } = action;
    let pagination = ''; let Rulepage = ''; let RulepageSize = '';
    if (page && pageSize) {
      pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
      Rulepage = `${localStorage.getItem('tablePageNo') || 1}`;
      RulepageSize = `${localStorage.getItem('tablePageSize') || 10}`;
    }

    const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010',id, parentId, Rulepage, RulepageSize, data,  headers);
    // return this.applicationService.callApi(`knex-query/getexecute-rules/${id}${pagination}`, 'get', data, headers, parentId)
    //   .pipe(takeUntil(this.unsubscribe$));
    //  const { jsonData, newGuid } = this.socketService.querymakeJsonData('2010','2010',dummyData);
    console.log("Knex Query", jsonData)
    this.socketService.Request(jsonData);
    return RequestGuid;
  }

}

type LoadAction = Action;

type Action = {
  actionType: string;
  url: string;
  actionLink: string;
  data?: any;
  headers?: any;
  id?: any;
  page?: any;
  pageSize?: any;
  parentId?: any;
  screenBuilderId?: any;
};
