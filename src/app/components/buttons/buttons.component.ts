import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { Subject, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { SocketService } from 'src/app/services/socket.service';
import { resolve } from 'dns';
import { ToasterService } from 'src/app/services/toaster.service';



@Component({
  selector: 'st-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss']
})
export class ButtonsComponent implements OnInit {
  @Input() buttonData: any;
  @Input() title: any;
  @Input() tableRowId: any;
  @Input() tableDisplayData: any;
  @Input() softIconList: any;
  @Input() screenId: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() GridRuleColor: any;
  @Input() drawOpen: any;
  @Input() tableIndex: any;
  @Input() mappingId: any;
  drawScreenId : any;
  bgColor: any;
  hoverTextColor: any;
  dataSrc: any;
  isShow: Boolean = false;
  color: "hover:bg-[#000000]";
  borderColor: any;
  isVisible = false;
  isVisibleDrawer = false;
  saveHoverIconColor: any;
  hoverOpacity = '';
  nodes: any[] = [];
  responseData: any;
  loader: boolean = false;
  isActionExist: boolean = false;
  requestSubscription: Subscription;
  policyList: any = [];
  policyId: any = {};
  hostUrl: any = '';
  policyTheme: any = '';
  //Drawer title and keyName is used in case of previous next in button drawer
  drawerTiltle: any;
  keyName: any = '';
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  @Output() gridEmit: EventEmitter<any> = new EventEmitter<any>();
  constructor(private modalService: NzModalService, private router: Router,
    public dataSharedService: DataSharedService, private activatedRoute: ActivatedRoute, private location: Location, private cdr: ChangeDetectorRef,
    private socketService: SocketService, private toasterService: ToasterService,
  ) {
    const saveredirectsubscription = this.dataSharedService.saveredirect.subscribe(res => {
      if (res) {
        if (res.key == this.buttonData.key) {
          this.redirect(res, res.saveredirect, true)
        }
      }
    });
    this.subscriptions.add(saveredirectsubscription);
  }

  ngOnInit(): void {
    if (this.tableDisplayData) {
      this.keyName = this.findKeyByOrderid(this.tableDisplayData, this.title);
    }

    const userData = this.dataSharedService.decryptedValue('user') ? this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null : null;
    if (this.buttonData?.dropdownProperties == 'policyTheme' && userData) {
      this.policyTheme = userData['policy']['policyTheme'];
      this.buttonData['title'] = userData['policy']['policyTheme'] ? userData['policy']['policyTheme'] : this.buttonData?.title;
    }
    // this.drawerClose();
    this.hostUrl = window.location.host;
    if (this.buttonData?.showPolicies || this.buttonData?.dropdownProperties == 'policyTheme') {
      this.jsonPolicyModuleList();
    }
    if (this.buttonData?.appConfigurableEvent || this.buttonData?.eventActionconfig || this.buttonData?.redirect || this.buttonData?.isSubmit) {
      this.isActionExist = true;
    }
    this.hoverTextColor = this.buttonData?.textColor ? this.buttonData?.textColor : '';
    this.bgColor = this.buttonData?.color ? this.buttonData?.color : '';
    if (this.buttonData.title === '$user' && window.location.href.includes('/pages') && userData) {
      this.policyId = userData['policy']['policyId'];
      this.buttonData.title = userData.policy.policyName ? userData.policy.policyName : this.buttonData.title;
    }

    if (this.drawOpen && this.tableIndex == 0) {
      this.pagesRoute(this.buttonData);
    }

  }

  pagesRoute(data: any): void {
    debugger
    if (data.isSubmit) {
      return;
    }

    if (!data.href) {
      return;
    }

    this.redirect(data, data.redirect, false)
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.drawScreenId  = null;
    this.isVisible = false;
  }
  isHover: boolean = false;
  handleCancel(): void {
    this.isVisible = false;
    this.drawScreenId  = null;
  }
  handleClose(): void {
    this.isVisible = false;
    this.drawScreenId  = null;
    this.dataSharedService.drawerVisible = false;
    this.dataSharedService.refreshModel.next({});
    this.gridEmit.emit();

  }
  handleButtonClick(buttonData: any): void {
    this.pagesRoute(buttonData);
    if ((!buttonData.captureData || buttonData.captureData == 'sectionLevel') && buttonData.isSubmit) {
      this.dataSharedService.buttonData = buttonData;
      this.dataSharedService.saveModel = this.formlyModel;
      let newData = {
        buttonData: buttonData,
        mappingId: this.mappingId,
      }
      this.dataSharedService.sectionSubmit.next(newData);
    } else if (buttonData.captureData == 'pageLevel' && buttonData.isSubmit) {
      this.dataSharedService.pageSubmit.next(buttonData);
    }
  }

  handleButtonMouseOver(buttonData: any): void {
    this.hoverOpacity = '1';
    this.bgColor = buttonData.hoverColor || '';
    this.hoverTextColor = buttonData.hoverTextColor || '';
    this.borderColor = buttonData.hoverBorderColor || '';
    this.saveHoverIconColor = buttonData['iconColor'];
    buttonData['iconColor'] = buttonData['hoverIconColor'];
  }

  handleButtonMouseOut(buttonData: any): void {
    this.hoverOpacity = '';
    buttonData['iconColor'] = this.saveHoverIconColor;
    this.bgColor = buttonData.color || '';
    this.hoverTextColor = buttonData.textColor || '';
    this.borderColor = buttonData.borderColor || '';
  }

  hoverStyle(data: any, mouseOver: any): void {
    if (mouseOver) {
      this.buttonData.dropdownOptions.forEach((option: any) => option.label == data.label ? option['hover'] = true : option['hover'] = false);
    } else {
      this.buttonData.dropdownOptions.forEach((option: any) => option['hover'] = false);
    }
  }
  findObjectByTypeBase(data: any, type: any) {
    if (data) {
      if (data.type && type) {
        if (data.type === type && data.mapApi && (data.componentMapping == undefined || data.componentMapping == '' || data.componentMapping == false) && this.tableRowId) {
          data.mapApi += `/${this.tableRowId}`
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            this.findObjectByTypeBase(child, type);
          }
        }
      }
    }
  }
  logout() {
    localStorage.removeItem('isLoggedIn'); // Clear the logged-in flag
    localStorage.clear();
    window.localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
  jsonPolicyModuleList() {

    let user = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('getpolicy', user?.policy?.userid, '2002');
    this.dataSharedService.saveDebugLog('jsonPolicyModuleList', newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res?.data.length > 0) {
              if (this.buttonData?.showPolicies) {
                // this.policyList = res.data.filter((a: any) => a?.policyid.id != user['policy']['policyid']);
                this.policyList = res.data;
              } else {
                this.policyList = res?.data;
              }
            }
          } ``
        }

      },
      error: (err) => {
        this.toasterService.checkToaster(this.buttonData, 'error');
      },
    });
  }

  switchPolicy(policy: any) {
    // this.modalService.confirm({
    //   nzTitle: '<i>Do you want to switch this policy?</i>',
    //   nzContent: '',
    //   nzWrapClassName: 'confirm-modal',
    //   nzOnOk: () => this.changePolicy(policy)
    // });
    this.changePolicy(policy);
  }
  switchPolicyTheme(policy: any) {
    this.modalService.confirm({
      nzTitle: '<i>Do you Want to switch this theme?</i>',
      nzContent: '',
      nzOnOk: () => this.changeTheme(policy)
    });
  }
  changeTheme(policy: any) {
    let user = JSON.parse(window.localStorage['user']);
    this.policyTheme = policy?.applicationtheme;
    user['policy']['policyTheme'] = policy?.applicationtheme ? policy?.applicationtheme : '';
    this.buttonData.title = policy?.applicationtheme ? policy?.applicationtheme : '';

    this.dataSharedService.ecryptedValue('user', JSON.stringify(user), true);
    this.dataSharedService.applicationTheme.next(true);
  }
  changePolicy(policy: any) {
    let user = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    user['policy']['policyId'] = policy?.id;
    user['policy']['policyName'] = policy?.name;
    this.policyTheme = policy?.applicationtheme;
    this.dataSharedService.ecryptedValue('user', JSON.stringify(user), true);
    let obj = {
      policyId: policy?.id,
      userId: user.policy?.userid,
      defaultPolicy: true,
      appid: this.dataSharedService.decryptedValue('appid'),
    }
    this.dataSharedService.pagesLoader.next(true);
    const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(policy.id);
    var ResponseGuid: any = newUGuid;
    const Update = { [`policyswicth`]: obj, metaInfo: metainfoupdate };
    this.dataSharedService.saveDebugLog('CheckUserScreen', newUGuid)
    this.socketService.Request(Update)
    this.socketService.OnResponseMessage().subscribe((res: any) => {
      if (res.parseddata.requestId == ResponseGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        this.dataSharedService.pagesLoader.next(false);

        if (res.isSuccess) {
          this.toasterService.checkToaster(this.buttonData, 'success');
          setTimeout(() => {
            this.router.navigate(['/']).then(() => {
              // Reload the entire application to re-render all components
              if (res.data.length > 0) {
                if (res.data[0]?.token) {
                  window.localStorage['authToken'] = JSON.stringify(res.data[0]?.token);
                  window.localStorage['jwtToken'] = res.data[0]?.token;
                }
              }
              this.location.replaceState('/');
              window.location.reload();
            });
          }, 1000);

        } else {
          this.toasterService.checkToaster(this.buttonData, 'error');
        }
      }
    });
  }
  // private drawerClose(): void {
  //   const subscription = this.dataSharedService.drawerClose.subscribe({
  //     next: (res) => {
  //       if (res && this.isVisible && (this.buttonData.redirect == 'drawer' || this.buttonData.redirect == 'largeDrawer' || this.buttonData.redirect == 'extraLargeDrawer')) {
  //         this.isVisible = false;
  //         // this.dataSharedService.gridDataLoad = false;
  //         this.gridEmit.emit(this.buttonData)
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //     }
  //   });
  //   this.subscriptions.add(subscription);
  // }
  ngOnDestroy(): void {
    try {
      if (this.requestSubscription) {
        this.requestSubscription.unsubscribe();
      }
      if (this.subscriptions) {
        this.subscriptions.unsubscribe();
      }
      this.destroy$.next();
      this.destroy$.complete();
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }

  getNextOrPreviousObjectById(direction: any) {
    const index = this.tableDisplayData.findIndex((item: any) => item.id === this.tableRowId);
    if (index !== -1) {
      if (direction === 'next' && index < this.tableDisplayData.length - 1) {
        this.tableRowId = this.tableDisplayData[index + 1]['id'];
        this.drawerTiltle = this.tableDisplayData[index + 1][this.keyName];
      }
      else if (direction === 'previous' && index > 0) {
        this.tableRowId = this.tableDisplayData[index - 1]['id'];
        this.drawerTiltle = this.tableDisplayData[index - 1][this.keyName];
      } else {
        const indexValue = direction === 'next' ? 1 : -1
        this.gridEmit.emit(indexValue);
        // this.toastr.warning('Id does not exist', { nzDuration: 3000 });
        return;
      }
    }
    let obj: any = {
      tableRowId: this.tableRowId,
      screenId: this.screenId
    }
    this.dataSharedService.prevNextRecord.next(obj);
  }
  findKeyByOrderid(data: any[], targetOrderid: string): string | null {
    for (const key in data[0]) {
      if (data[0].hasOwnProperty(key)) {
        const foundObject = data.find(obj => obj[key] === targetOrderid);
        if (foundObject) {
          return key;
        }
      }
    }
    return null;
  }
  getBuilderScreen(data: any, save: boolean) {
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('Builders', save ? data.saveRouteLink : data.href, '2002');
    this.dataSharedService.saveDebugLog('getBuilderScreen', newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        try {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess) {
              if (res.data.length > 0) {
                this.screenId = res.data[0].sbid;
                this.nodes = [];
                this.nodes.push(res);
              }
              this.loader = false;
            } else {
              this.toasterService.checkToaster(this.buttonData, 'error');
              this.loader = false;
            }
          }
        } catch (err) {
          this.loader = false;
          this.toasterService.checkToaster(this.buttonData, 'error');
        }
      },
      error: (err) => {
        this.loader = false;
        this.toasterService.checkToaster(this.buttonData, 'error');
        console.error(err); // Log the error to the console
      }
    });
  }
  redirect(data: any, redirect: any, save: boolean) {
    switch (redirect) {
      case 'modal':
      case '1200px':
      case '800px':
      case '600px':
      case 'drawer':
      case 'largeDrawer':
      case 'extraLargeDrawer':
        this.drawerTiltle = '';

        if (!data.href && !save) {
          this.toasterService.checkToaster(this.buttonData, 'error');
          // this.toastr.warning('Required Href', {
          //   nzDuration: 3000,
          // });
          return
        }
        let link = save ? data.saveRouteLink : data.href;
        this.cdr.detectChanges();
        this.nodes = [];
        if (this.tableRowId) {
          this.mappingId = this.tableRowId;
          this.mappingId = this.mappingId;
        }
        if (this.buttonData?.mappingId) {
          this.mappingId = this.buttonData?.mappingId;
          this.tableRowId = this.buttonData?.mappingId;
        }
        this.dataSharedService.drawerIdList = {};
        if (this.buttonData?.headerHeight !== undefined) {
          document.documentElement.style.setProperty('--drawerHeaderHight', this.buttonData?.headerHeight + '%');
          this.cdr.detectChanges();
        } else {
          document.documentElement.style.setProperty('--drawerHeaderHight', 'auto');

        }
        this.loader = true;
        this.isVisible = true;
        let externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
        if (externalLogin == false) {
          const { jsonData, newGuid } = this.socketService.makeJsonDataById('CheckUserScreen', link, '2006');
          this.dataSharedService.saveDebugLog('CheckUserScreen', newGuid)
          this.socketService.Request(jsonData);
          this.socketService.OnResponseMessage().subscribe(res => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              if (res?.data == true) {
                this.getBuilderScreen(data, save);
              }
              else {
                this.loader = false;
                this.drawScreenId = res.data[0].sbid;
                this.dataSharedService.currentPageLink = this.drawScreenId;

                this.nodes.push(res)
              }
            }
          });
        } else {
          this.getBuilderScreen(data, save);
        }

        break;
      case 'policy':
        const { jsonData, newGuid } = this.socketService.makeJsonDataById('policy', data.href, '2002');
        this.dataSharedService.saveDebugLog('policy', newGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res) => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              if (res.isSuccess) {
                this.changePolicy(res.data[0])
              }
            }
          }, error: (error) => {
            this.toasterService.checkToaster(this.buttonData, 'error');
          }
        });
        break;
      case '_blank':
        if (this.tableRowId || this.buttonData.mappingId) {
          const queryParams: any = { mpId: (this.tableRowId ? this.tableRowId : this.buttonData.mappingId), pdId: this.buttonData?.isPdfRoute ? true : false };
          const queryString = new URLSearchParams(queryParams).toString();
          window.open('/pages/' + data.href + '?' + queryString);
        } else {
          this.requestSubscription = this.activatedRoute.params.subscribe((params: Params) => {
            if (params["id"]) {
              const queryParams: any = { mpId: params["id"], pdId: this.buttonData?.isPdfRoute ? true : false };
              const queryString = new URLSearchParams(queryParams).toString();
              window.open('/pages/' + data.href + '?' + queryString);
            } else if (data.href.includes('https://www')) {
              window.open(data.href);
            }
            else {
              window.open('/pages/' + data.href);
            }
          });
        }

        break;
      case '':
        if (this.tableRowId || this.buttonData.mappingId) {
          this.router.navigate(['/pages/' + data.href + '/' + (this.tableRowId ? this.tableRowId : this.buttonData.mappingId)]
            , { queryParams: { mpId: (this.tableRowId ? this.tableRowId : this.buttonData.mappingId), pdId: this.buttonData?.isPdfRoute ? true : false, } })
          // window.open('/pages/' + data.href + '/' + (this.tableRowId ? this.tableRowId : this.buttonData.mappingId));
        }
        else if (data.href.includes('https://www')) {
          window.location.href = data.href;
        }
        else {
          this.requestSubscription = this.activatedRoute.params.subscribe((params: Params) => {
            if (params["id"]) {
              this.router.navigate(['/pages/' + data.href], { queryParams: { mpId: params["id"], pdId: this.buttonData?.isPdfRoute ? true : false, } })
            }
            else if (data.href.includes('https://www')) {
              this.router.navigate([data.href]);
            }
            else {
              this.router.navigate(['/pages/' + data.href]);
            }
          });
        }
        break;
    }
  }
}
