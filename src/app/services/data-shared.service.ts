import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime } from 'rxjs';
import { AES, enc } from 'crypto-js';
import { SocketService } from './socket.service';


@Injectable({
  providedIn: 'root'
})
export class DataSharedService {
  constructor(
    private socketService: SocketService) {

  }
  encryptSecretKey = "@12356489231SFSJDFPOSFSDF5464954$%#%DZGDSDFDSF"; //adding secret key
  // activeTabIndex = 0;
  private languageChange: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public change: Subject<{ event: any; field: any }> = new Subject();
  public eventChange: Subject<any> = new Subject();
  public gridData: Subject<{ event: any; field: any }> = new Subject();
  public urlModule: Subject<{ aplication?: any; module?: any }> = new Subject();
  public currentDepartment: Subject<any> = new Subject();
  public currentHeader: Subject<any> = new Subject();
  public currentFooter: Subject<any> = new Subject();
  public currentMenu: Subject<any> = new Subject();
  public screenId: Subject<any> = new Subject();
  public localhostHeaderFooter: Subject<any> = new Subject();
  public invoiceSum: Subject<any> = new Subject();
  public menuSelectedThemeLayout: Subject<any> = new Subject();
  public sectionSubmit: Subject<any> = new Subject();
  public pageSubmit: Subject<any> = new Subject();
  public formlyShowError = new BehaviorSubject<boolean>(false);
  public collapseMenu = new BehaviorSubject<boolean>(false);
  public highlightFalse = new BehaviorSubject<boolean>(false);
  public taskmanager = new BehaviorSubject<boolean>(false);
  public taskmanagerDrawer = new BehaviorSubject<boolean>(false);
  public spectrumControlNull = new BehaviorSubject<boolean>(false);
  public gericFieldLoader = new BehaviorSubject<boolean>(false);
  public pagesLoader = new BehaviorSubject<boolean>(false);
  public drawerClose = new BehaviorSubject<boolean>(false);
  public applicationTheme = new BehaviorSubject<boolean>(false);
  public prevNextRecord = new BehaviorSubject<boolean>(false);
  public commentsRecall = new BehaviorSubject<boolean>(false);
  public removeKanbanListIndex = new BehaviorSubject<boolean>(false);
  public voiceRecord: Subject<any> = new Subject();
  public configuration: Subject<any> = new Subject();
  public moveLink: Subject<any> = new Subject();
  public repeatableControll: Subject<any> = new Subject();
  public updateModel: Subject<any> = new Subject();
  public callDataIntaskManager: Subject<any> = new Subject();
  public saveredirect: Subject<any> = new Subject();
  public gridLoadById: Subject<any> = new Subject();
  public makeModel: Subject<any> = new Subject();
  public refreshModel: Subject<any> = new Subject();
  // public menus: Subject<any> = new Subject();
  // public currentApplication: Subject<any> = new Subject();
  // public defaultPage: Subject<any> = new Subject();

  isMenuCollapsed: boolean = false;
  gridDataLoad: boolean = false;
  drawerVisible: boolean = true;
  getUserPolicyMenuList: any[] = [];
  currentMenuLink: string = '';
  currentPageLink: string = '';
  defaultPageNodes: any;
  screenCommentList: any[] = [];
  menuCommentList: any[] = []
  nodeData: any[] = [];
  drawerIdList: any;
  checkContentForFixFooter: any;
  commentId: any;
  public menus: any;
  currentUrl: any;
  selectedNode: any;
  screenModule: any;
  nodes: any;
  checkModule: any;
  headerData: any = [];
  footerData: any = [];
  public data: any;
  copyJson: any = {};
  selectApplication: any = '';
  headerLogo: any = '';
  applicationDefaultScreen: any = '';
  usersData: any = [];
  rightClickMenuData: any = '';
  buttonData: any = '';
  saveModel: any = '';
  measureHeight: any = 0;
  contentHeight: number;
  showFooter: boolean;
  queryId: any = '';
  isSaveData: boolean = false;
  fixedFooter: boolean = false;
  applicationGlobalClass: any = [];
  loggerDebug: { label: string, value: any }[] = [];
  setData(data: any) {
    this.data = data;
    this.invoiceSum.next(this.data);
  }
  saveDebugLog(label: string, value: any) {
    // Add the new item at the beginning of the array
    this.loggerDebug.unshift({ label: label, value: value });

    // Limit the array to maximum 5 items
    if (this.loggerDebug.length > 5) {
      // Remove the oldest item from the array
      this.loggerDebug.pop();
    }
  }
  getData() {
    return this.data;
  }
  onChange(event: any, field: any) {
    this.change.next({ event, field });
  }
  onEventChange(event: any) {
    this.eventChange.next(event);
  }

  saveGridData(data: any) {
    this.gridData.next(data);
  }

  // This variable is used for goTo build page through screen builder
  screenName: any = '';
  //make wrapper of image upload insput used in configuration of image upload
  imageUrl: any;

  element: any;
  getLanguageChange(): Observable<string> {
    return this.languageChange.asObservable();
  }
  setLanguageChange(val: string): void {
    this.languageChange.next(val);
  }

  //This is used for mapping to replace data of specific key
  typeMap: any = {
    cardWithComponents: 'link',
    buttonGroup: 'title',
    button: 'title',
    downloadButton: 'path',
    breakTag: 'title',
    switch: 'title',
    imageUpload: 'source',
    heading: 'text',
    paragraph: 'text',
    alert: 'text',
    progressBar: 'percent',
    video: 'videoSrc',
    audio: 'audioSrc',
    carouselCrossfade: 'carousalConfig',
    tabs: 'title',
    mainTab: 'title',
    mainStep: 'title',
    listWithComponents: 'title',
    listWithComponentsChild: 'title',
    step: 'title',
    kanban: 'title',
    simplecard: 'title',
    div: 'title',
    textEditor: 'title',
    multiFileUpload: 'uploadBtnLabel',
    accordionButton: 'title',
    contactList: 'title',
    divider: 'dividerText',
    toastr: 'toasterTitle',
    rate: 'icon',
    editor_js: 'title',
    rangeSlider: 'title',
    affix: 'title',
    statistic: 'title',
    anchor: 'title',
    modal: 'btnLabel',
    popConfirm: 'btnLabel',
    avatar: 'src',
    badge: 'nzText',
    comment: 'avatar',
    description: 'btnText',
    descriptionChild: 'content',
    segmented: 'title',
    result: 'resultTitle',
    tree: 'title',
    transfer: 'title',
    spin: 'loaderText',
    cascader: 'title',
    drawer: 'btnText',
    skeleton: 'title',
    empty: 'text',
    list: 'title',
    treeView: 'title',
    message: 'content',
    mentions: 'title',
    icon: 'title',
    barChart: 'tableData',
    pieChart: 'tableData',
    videoSrc: 'videoSrc',
  }
  ecryptedValue(property: any, value: any, stringify: any) {
    var result = AES.encrypt(value, this.encryptSecretKey).toString();
    window.localStorage[property] = stringify ? JSON.stringify(result) : result;
  }

  decryptedValue(property: any) {
    if (window.localStorage[property]) {
      let value: any = JSON.parse(window.localStorage[property]);
      var result: any = AES.decrypt(value, this.encryptSecretKey).toString(enc.Utf8);
      return result;
    } else {
      return '';
    }
  }

  checkDomain(domain: string): string {
    const sportspotgermanyDomain = 'sportspotgermany';
    const localIP = 'governance.expocitydubai.com';
    const defaultDomain = 'git3.com';
    // const defaultDomain = 'crm.aiappup.com';
    // const defaultDomain = 'default.com';     
    // const defaultDomain = 'carparking.com';
    // const defaultDomain = 'default.org.com';
    //crm.internal.com is used to used to register company and create application
    // const defaultDomain = 'wexumu@mailinator.com';
    // const defaultDomain = 'NewComp.web.com';
    // const defaultDomain = 'AIAPPUP.com';
    // const defaultDomain = 'carparking.com';
    // const defaultDomain = 'apps.aiappup.com';
    // const defaultDomain = 'crm.aiappup.com';
    // const defaultDomain = 'releasemanagement.com';
    // const defaultDomain = 'cohiryxiq@mailinator.com';
    if (domain.includes(sportspotgermanyDomain) || domain.includes(localIP)) {
      return defaultDomain;
    }

    return domain.split(':')[0];
  }
  makeParentId(api: any) {
    let splitApi;
    let parentId;
    if (api.includes('getexecute-rules/'))
      splitApi = api.split('getexecute-rules/')[1];
    else splitApi = api;
    if (splitApi.includes('/')) {
      const getValue = splitApi.split('/');
      splitApi = getValue[0]
      parentId = getValue[1];
    }
    return { splitApi: splitApi, parentId: parentId }
  }
  findObjectByTypeBase(data: any, type: any) {
    if (data) {
      if (data.type && type) {
        if (data.type === type) {
          return data;
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByTypeBase(child, type);
            if (result !== null) {
              return result;
            }
          }
        }
        return null;
      }
    }
  }
  findObjectByKey(data: any, key: any) {
    if (data) {
      if (data.key && key) {
        if (data.key === key) {
          return data;
        }
        if (data.children && data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByKey(child, key);
            if (result !== null) {
              return result;
            }
          }
        }
      }
    }
    return null;
  }
  recallOnLoad(component: any, mappingId?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (component?.eventActionconfig && Object.keys(component.eventActionconfig).length > 0) {
        const { id, page, pageSize } = component.eventActionconfig;
        if (id) {
          let pagination: any = '';
          let Rulepage = '';
          let RulepageSize = '';
          if (page && pageSize) {
            pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
            Rulepage = `${localStorage.getItem('tablePageNo') || 1}`;
            RulepageSize = `${localStorage.getItem('tablePageSize') || 10}`;
          }
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', id, mappingId, Rulepage, RulepageSize);
          this.saveDebugLog('recallApi', RequestGuid)
          this.socketService.Request(jsonData);
          const subscription = this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
                resolve(res.parseddata.apidata);
              }
            },
            error: (error: any) => {
              subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
              console.error(error);
              reject({ isSuccess: false, error: error });
            }
          })
        }
      } else {
        reject({ isSuccess: false, error: 'Action not found' });
      }
    });
  }

}

