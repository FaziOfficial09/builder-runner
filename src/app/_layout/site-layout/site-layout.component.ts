import { ChangeDetectorRef, Component, Input, OnInit, ViewContainerRef, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, Subscription, filter, forkJoin } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CommentModalComponent } from 'src/app/components';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { JwtService } from 'src/app/shared/jwt.service';
import { SocketService } from 'src/app/services/socket.service';


@Component({
  selector: 'st-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.scss']
})
export class SiteLayoutComponent implements OnInit {
  @Input() menuItems: any = [];
  @Input() selectedTheme: any;
  headerHeight: number;
  footerHeight: number;
  @ViewChild('footerContainer') footerContainer: ElementRef;
  dynamic: number;
  currentHeader: any = undefined;
  logo: any;
  currentFooter: any = undefined;
  defaultPage: any;
  tabs: any = [];
  dropdown: any = [];
  modules: any = [];
  menuList: any = [];
  getTaskManagementIssues: any = [];
  requestSubscription: Subscription;
  loader: boolean = false;
  currentWebsiteLayout = "";
  currentUrl: any = "";
  fullCurrentUrl = "";
  currentUser: any;
  domainData: any;
  isShowContextMenu = false;
  hideHeaderFooterMenu = false;
  externalLogin: boolean = false
  constentMarging: any = '0px';
  newSelectedTheme = {
    menuMode: 'inline',
    layout: 'vertical',
    colorScheme: 'light',
    layoutWidth: 'fluid',
    sideBarSize: 'default',
    siderBarView: 'sidebarViewDefault',
    sieBarColor: 'light',
    siderBarImages: '',
    checked: false,
    theme: false,
    isCollapsed: false,
    newMenuArray: [],
    menuChildArrayTwoColumn: [],
    isTwoColumnCollapsed: false,
    allMenuItems: [],
    showMenu: true,
    font: 'font-roboto',
    backGroundColor: '#ffffff',
    textColor: '#6f777d',
    activeBackgroundColor: '#e6f7ff',
    activeTextColor: '#6f777d',
    hoverTextColor: '#ffffff',
    titleSize: '15',
    iconColor: '#6f777d',
    hoverIconColor: '#ffffff',
    activeIconColor: '#6f777d',
    iconSize: '15',
    hoverBgColor: '#3b82f6'
  }
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  constructor(private renderer: Renderer2, private el: ElementRef, public dataSharedService: DataSharedService,
    private toastr: NzMessageService, private router: Router, private activatedRoute: ActivatedRoute, private cd: ChangeDetectorRef, private modalService: NzModalService,
    public socketService: SocketService,
    private viewContainerRef: ViewContainerRef, private authService: AuthService, private jwtService: JwtService,) {
    this.requestSubscription = this.dataSharedService.localhostHeaderFooter.subscribe({
      next: (res) => {
        if (res) {
          this.getMenuBHeaderName(res, false);
        }
      },
      error: (err) => {
        console.error(err);
      }
    })
  }


  ngOnInit(): void {

    this.dataSharedService.measureHeight = 0;
    // this.getTaskManagementIssuesFunc(JSON.parse(localStorage.getItem('appid')!));

    this.currentUser = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    let externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
    this.requestSubscription = this.dataSharedService.collapseMenu.subscribe({
      next: (res) => {
        if (res) {
          this.selectedTheme.isCollapsed = !this.selectedTheme.isCollapsed;
          if (!this.selectedTheme.isCollapsed && this.selectedTheme.layout === 'twoColumn') {
            this.selectedTheme['menuChildArrayTwoColumn'] = []
          }
        } else {
          this.currentHeader = undefined;
          this.currentFooter = undefined;
        }
      },
      error: (err) => {
        console.error(err);
      }
    })

    this.currentUrl = window.location.host;
    if (this.currentUrl.includes('localhost')) {
      this.currentWebsiteLayout = "backend_application";
      if (!window.location.href.includes('/menu-builder')) {
        this.selectedTheme = this.selectedTheme;
        this.getApplications();
      }
    }
    //http://spectrum.com/
    this.fullCurrentUrl = this.dataSharedService.checkDomain(window.location.host);
    this.currentUrl = this.dataSharedService.checkDomain(window.location.host);

    if (window.location.search.includes('token=')) {
      localStorage.clear();
      const getToken = window.location.search.split('token=')[1];
      const body = { page: window.location.pathname }
      localStorage.setItem('screenBuildId', window.location.pathname);
      localStorage.setItem('screenId', window.location.pathname);
      this.socketService.setSocketExternal(getToken);
      const { newGuid, metainfocreate } = this.socketService.makeJsonDataExternal('2020');
      const Add = { body, metaInfo: metainfocreate }       
      this.dataSharedService.saveDebugLog('sitelayoutInit',newGuid)
      this.socketService.Request(Add);
      this.socketService.OnResponseMessage().subscribe((response: any) => {
        if (response.parseddata.requestId == newGuid && response.parseddata.isSuccess) {
          response = response.parseddata.apidata;
          if (response.isSuccess) {
            let external: any = { login: false, submit: false, link: '', }
            this.dataSharedService.ecryptedValue('externalLogin', JSON.stringify(external), true);
            this.authService.setAuth(response.data);
            this.getMenuByDomainName(this.currentUrl, true);
            this.router.navigate([window.location.pathname]);
          }
          else {
            if (response?.isPermission) {
              this.router.navigate(['permission-denied']);
              this.externalLogin = true;
            }
            else {
              this.jwtService.saveToken(getToken);
              window.localStorage['authToken'] = JSON.stringify(getToken);
              let external: any = {
                login: true, submit: false, link: response.data[0].pageLink,
              }
              this.globalTheme();
              this.dataSharedService.ecryptedValue('externalLogin', JSON.stringify(external), true);
              this.dataSharedService.ecryptedValue('username', response.data[0].username, true);
              this.externalLogin = true;
              this.router.navigate([window.location.pathname]);

            }
          }
        }

      })
    }
    else {
      if (externalLogin == false) {
        this.getMenuByDomainName(this.currentUrl, true);
        this.requestSubscription = this.dataSharedService.urlModule.subscribe(({ aplication, module }) => {

          if (module) {
            setTimeout(() => {
              const filteredMenu = this.menuList.filter((item: any) => item.appid == module);
              if (filteredMenu.length > 0) {
                this.selectedTheme = filteredMenu[0].selectedTheme;
                this.selectedTheme.allMenuItems = filteredMenu[0].menuData;
                if (!filteredMenu[0].selectedTheme?.showMenu) {
                  this.selectedTheme.showMenu = true;
                }
                this.makeMenuData();
              } else {
                this.selectedTheme.allMenuItems = [];
              }
            }, 100);

          } else if (aplication == '' && module == '') {
            // this.getApplications();
          }
          this.tabs = [];
        });
      }
      else {
        let externalPageLink = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).link : '';
        if (window.location.pathname == `/${externalPageLink}`) {
          this.globalTheme();
          this.router.navigate([window.location.pathname]);
        } else {
          this.router.navigate(['/permission-denied']);
        }
        this.externalLogin = true;
      }
    }
    // this.fullCurrentUrl = window.location.host.includes('spectrum') ? '172.23.0.8' : window.location.host.split(':')[0];
    // this.currentUrl = window.location.host.includes('spectrum') ? '172.23.0.8' : window.location.host.split(':')[0];

    // if (!this.currentUrl.includes('localhost')) {
    //   let check = this.currentUrl.includes(':');
    //   if (check) {
    //     this.currentUrl = this.currentUrl.split(':')[0];
    //     this.getMenuByDomainName(this.currentUrl, true);
    //   } else {
    //     this.getMenuByDomainName(this.currentUrl, true);
    //   }
    // }

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateHeaderHeight();
    }, 20000)

    // const container = this.footerContainer.nativeElement;
    // if (container.classList.contains('dynamic-footer') || container.classList.contains('dynamic-footer-website')) {
    //   this.dynamic = true;
    // }

  }


  updateHeaderHeight() {
    if (this.el.nativeElement.querySelector('#HEADER')) {
      const headerElement = this.el.nativeElement.querySelector('#HEADER');
      this.headerHeight = headerElement.clientHeight;
      const layoutElement = this.el.nativeElement.querySelector('.content-container');
      this.renderer.setStyle(layoutElement, 'height', `calc(100vh - ${this.headerHeight + 10}px)`);
    }

    if (this.el.nativeElement.querySelector('#FOOTER')) {
      const footerElement = this.el.nativeElement.querySelector('#FOOTER');
      this.footerHeight = footerElement.clientHeight;
      console.log(this.footerHeight);
    }

    if (this.el.nativeElement.querySelector('#Content') && this.footerHeight) {
      ;
      const contentElement = this.el.nativeElement.querySelector('#Content');
      this.dataSharedService.contentHeight = contentElement.clientHeight;
      this.constentMarging = this.footerHeight.toString() + 'px';
      // Corrected assignment without spaces around the value and !important after the semicolon
      // contentElement.style.marginBottom = this.footerHeight.toString() + 'px';

      console.log(contentElement.style.marginBottom);
    }



    this.dataSharedService.measureHeight = window.innerHeight - (this.headerHeight + this.footerHeight + 10);

    // Extract the numeric values from the strings
    console.log(this.dataSharedService.measureHeight);
    this.dataSharedService.showFooter = true;
    // if (this.dataSharedService.measureHeight < this.dataSharedService.contentHeight) {
    //   this.dataSharedService.showFooter = false;
    //   console.log(false);
    // } else {
    //   console.log(true);
    //   this.dataSharedService.showFooter = true;
    // }
  }



  getMenuByDomainName(domainName: any, allowStoreId: boolean) {

    try {
      this.loader = true;
      const { jsonData, newGuid } = this.socketService.makeJsonDataById('application', domainName, '2004');
      this.dataSharedService.saveDebugLog('getMenuByDomainName',newGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess) {
              this.domainData = res.data;
              if (res.data.appication) {
                this.currentWebsiteLayout = res.data.appication.application_Type ? res.data.appication.application_Type : 'backend_application';
              }
              // document.documentElement.style.setProperty('--primaryColor', res.data.appication?.primaryColor);
              // document.documentElement.style.setProperty('--secondaryColor', res.data.appication?.secondaryColor);
              this.dataSharedService.applicationDefaultScreen = res.data['default'] ? res.data['default'].navigation : '';
              this.logo = res.data.appication['image'];
              this.dataSharedService.headerLogo = res.data.appication['image'];
              // if (allowStoreId) {
              //   localStorage.setItem('appid', JSON.stringify(res.data?.appication?._id));
              //   localStorage.setItem('orgid', JSON.stringify(res.data?.department?.orgid));
              // }
              if (res.data['applicationGlobalClasses']) {
                this.dataSharedService.applicationGlobalClass = res.data['applicationGlobalClasses'];
              }
              this.currentWebsiteLayout = res.data.appication['applicationtype'] ? res.data.appication['applicationtype'] : 'backend_application';
              this.currentHeader = res.data['header'] ? res.data['header']['screendata'] : '';
              this.currentFooter = res.data['footer'] ? res.data['footer']['screendata'] : '';
              if (res.data['menu']) {
                // if (res.data['menu']?.selectedtheme) {
                //   this.selectedTheme = res.data['menu'].selectedtheme;
                //   // const theme = res.data['menu'].selectedtheme;
                //   // this.selectedTheme['isCollapsed'] = !theme['isCollapsed'];
                // }
                if (!window.location.href.includes('/menu-builder')) {
                  this.isShowContextMenu = true;
                  let getMenu = res.data['menu'] ? res.data['menu']['menudata']?.json : '';
                  let selectedTheme = res.data['menu'] ? res.data['menu'].selectedtheme : {};
                  if (getMenu) {
                    this.selectedTheme = selectedTheme;
                    this.selectedTheme.allMenuItems = getMenu;
                    this.menuItems = getMenu;
                    // this.getComments();
                    if (selectedTheme?.layout == 'horizental') {
                      this.makeMenuData();
                    }

                  }
                  if (this.currentWebsiteLayout == 'website') {
                    this.dataSharedService.menus = this.selectedTheme;
                    this.dataSharedService.menus.allMenuItems = getMenu;
                  }
                }
              }
              this.hideHeaderFooterMenu = window.location.href.includes('pdId=true') ? true : false;
              // Example usage:
              if (!window.location.href.includes('/pages') && res.data?.default?.navigation && !window.location.href.includes('/menu-builder')) {
                this.router.navigate(['/pages/' + res.data?.default?.navigation]);
              }
              if (this.selectedTheme) {

                const urlSegments = window.location.href.split('/');
                let url = !window.location.href.includes('/pages') ? `/pages/${res.data?.default?.navigation}` : `/pages/${urlSegments[urlSegments.length - 1].trim()}`;
                const parentMenu = this.findParentMenu(this.selectedTheme.allMenuItems, url);
                if (parentMenu && parentMenu.type == "mainTab") {
                  this.tabs.push(parentMenu);
                }
              }
              this.loader = false;
              this.getUserPolicyMenu();
            }
          }
        },
        error: (err) => {
          // console.error(err);
          // this.toastr.error("An error occurred", { nzDuration: 3000 });
          this.loader = false; // Set loader to false in case of an error to avoid infinite loading
        }
      });
    }
    catch (error) {
      // console.error(error);
      // this.toastr.error("An error occurred", { nzDuration: 3000 });
      this.loader = false; // Set loader to false in case of an error to avoid infinite loading
    }
  }

  getMenuBHeaderName(domainName: any, allowStoreId: boolean) {

    try {
      this.loader = true;
      const { jsonData, newGuid } = this.socketService.makeJsonDataById('application', domainName, '2004');
      this.socketService.Request(jsonData);
      this.dataSharedService.saveDebugLog('getMenuBHeaderName',newGuid)
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata
            if (res.isSuccess) {
              this.currentHeader = res.data['header'] ? res.data['header']['screendata'] : '';
              this.loader = false;
            }
          }
        },
        error: (err) => {
          console.error(err);
          // this.toastr.error("An error occurred", { nzDuration: 3000 });
          this.loader = false; // Set loader to false in case of an error to avoid infinite loading
        }
      });
    }
    catch (error) {
      console.error(error);
      // this.toastr.error("An error occurred", { nzDuration: 3000 });
      this.loader = false; // Set loader to false in case of an error to avoid infinite loading
    }
  }


  jsonStringifyWithObject(data: any) {
    return (
      JSON.stringify(data, function (key, value) {
        if (typeof value == 'function') {
          let check = value.toString();
          if (check.includes('model =>'))
            return check.replace('model =>', '(model) =>');
          else return check;
        } else {
          return value;
        }
      }) || '{}'
    );
  }
  loadTabsAndButtons(data: any) {
    this.tabs = [];
    // this.dropdown = [];
    this.modules = [];
    this.selectedTheme.menuChildArrayTwoColumn = [];
    if (Array.isArray(data)) {
      this.modules = JSON.parse(JSON.stringify(data));
    }
    else if (data.children.length > 0) {
      this.tabs = data.children.filter((child: any) => child)
      // data.isOpen = !data.isOpen;
      // data.children.forEach((i: any) => {
      //   if (this.selectedTheme.layout == 'twoColumn') {
      //     this.selectedTheme.rowClass = 'w-10/12';
      //     this.selectedTheme.menuColumn = 'w-2/12';
      //     this.selectedTheme.menuChildArrayTwoColumn.push(i);
      //   }
      //   if (i.type == 'mainTab') {
      //     this.tabs.push(i);
      //   }
      //   // else if (i.type == 'dropdown') {
      //   //   this.dropdown.push(i);
      //   // }
      // });
    }
  }
  makeMenuData() {
    let arrayList = [...this.menuItems];
    this.selectedTheme.newMenuArray = [];
    if (this.menuItems.length > 7 && this.selectedTheme.layout === 'horizental') {
      this.selectedTheme.newMenuArray = [{
        label: "More",
        icon: "down",
        id: 'menu_428605c1',
        key: 'menu_0f7d1e4e',
        children: []
      }];
      const withoutTitle = this.menuItems.filter((item: any) => !item.isTitle);
      this.selectedTheme.newMenuArray[0].children = withoutTitle.slice(7);
      this.selectedTheme.allMenuItems = arrayList.filter((item) => !item.isTitle).slice(0, 7);
    }
    else if (this.selectedTheme.layout === 'horizental' && this.menuItems.length > 0) {
      this.selectedTheme.allMenuItems = this.menuItems;
    }
  }
  getApplications() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('Department', '2001');
    this.dataSharedService.saveDebugLog('getApplications',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res.data.length > 0) {
              let menus: any = [];
              this.currentWebsiteLayout = "backend_application";
              res.data.forEach((element: any) => {
                let newID = element.appid ? element.appid : element.name.replace(/\s+/g, '-');
                const newNode = {
                  id: newID,
                  key: newID,
                  title: element.name,
                  link: '',
                  icon: "appstore",
                  type: "input",
                  isTitle: false,
                  expanded: true,
                  color: "",
                  application: true,
                  children: [
                  ],
                }
                menus.push(newNode);
              });
              this.selectedTheme = this.newSelectedTheme;
              this.selectedTheme['allMenuItems'] = menus;
            }
          } else
            this.toastr.error(res.message, { nzDuration: 3000 });
        }

      },
      error: (err) => {
        console.error(err);
        this.toastr.error("An error occurred", { nzDuration: 3000 });
      }

    });
  }

  issueReportFun() {
    const modal = this.modalService.create<CommentModalComponent>({
      nzTitle: 'Issue Report',
      nzContent: CommentModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        data: this.dataSharedService.rightClickMenuData,
        // screenName: this.screenName,
        update: null,
        type: 'menu',
      },
      nzFooter: []
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
        res['id'] = res.id;
        delete res.id;
        delete res.__v
          ;
        this.selectedTheme.allMenuItems.forEach((element: any) => {
          if (element.id == this.dataSharedService.rightClickMenuData.id) {
            if (element['issueReport']) {
              element['issueReport'].push(res);
            } else {
              element['issueReport'] = [];
              element['issueReport'].push(res);
            }
            this.cd.detectChanges();
          }

        });
        if (this.selectedTheme['menuChildArrayTwoColumn']) {
          if (this.selectedTheme['menuChildArrayTwoColumn'].length > 0) {
            this.selectedTheme['menuChildArrayTwoColumn'].forEach((element: any) => {
              if (element.id == this.dataSharedService.rightClickMenuData.id) {
                if (element['issueReport']) {
                  element['issueReport'].push(res);
                } else {
                  element['issueReport'] = [];
                  element['issueReport'].push(res);
                }
                this.cd.detectChanges();
              }

            });
          }
        }
      }
    });
  }
  // getComments() {
  //   const { jsonData, newGuid } = this.socketService.makeJsonData('UserComment', '2008', 'menu');
  //   this.socketService.Request(jsonData);
  //   this.socketService.OnResponseMessage().subscribe((res: any) => {
  //     if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
  //       res = res.parseddata.apidata;
  //       if (res.isSuccess) {
  //         let commentList = res.data
  //         this.dataSharedService.menuCommentList = commentList;
  //         this.dataSharedService.menuCommentList.forEach(element => {
  //           this.assignIssue(this.selectedTheme.allMenuItems, element);
  //         });

  //       }
  //     }

  //   })
  // }
  assignIssue(node: any, issue: any) {
    node.forEach((element: any) => {
      if (issue['componentId']) {
        if (element.id == issue['componentId']) {
          let assign = this.getTaskManagementIssues.find((a: any) => a.componentId == element.id)
          if (assign && assign?.status) {
            element['status'] = assign.status;
          }
          if (!element['issueReport']) {
            element['issueReport'] = [];
          }

          element['issueReport'].push(issue);

          if (!element['issueUser']) {
            element['issueUser'] = [issue['createdBy']];
          }
          else {
            if (!element['issueUser'].includes(issue['createdBy'])) {
              // Check if the user is not already in the array, then add them
              element['issueUser'].push(issue.createdBy);
            }
          }
        }

        if (element.children.length > 0) {
          this.assignIssue(element.children, issue);
        }
      }
    });
  }
  getTaskManagementIssuesFunc(appid: string) {
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('UserAssignTask', appid, '2002');
    this.dataSharedService.saveDebugLog('getTaskManagementIssuesFunc',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res.data.length > 0) {
              this.getTaskManagementIssues = res.data;
            }
          }
          else {
            // this.toastr.error(`userAssignTask:` + res.message, { nzDuration: 3000 });
          }
        }
      },
      error: (err) => {
        console.error(err);
        // this.toastr.error("An error occurred", { nzDuration: 3000 });
      }
    })
  }
  getUserPolicyMenu() {

    const { jsonData, newGuid } = this.socketService.makeJsonData('2007', '2007');
    this.dataSharedService.saveDebugLog('getUserPolicyMenu',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res.data.length > 0) {
              this.dataSharedService.getUserPolicyMenuList = res.data;
            }
          }
          else {
            this.toastr.error(`getUserPolicyMenu:` + res.message, { nzDuration: 3000 });
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("An error occurred", { nzDuration: 3000 });
      }
    })
  }
  ngOnDestroy() {
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
  }
  findParentMenu(menus: any[], link: string): any {
    for (const menu of menus) {
      if (menu.link === link) {
        return null; // No parent for the root menu
      }

      if (menu.children && menu.children.length > 0) {
        const childWithLink = menu.children.find((child: any) => child.link === link);

        if (childWithLink) {
          return menu;
        }

        const parent = this.findParentMenu(menu.children, link);

        if (parent !== null) {
          return parent;
        }
      }
    }

    return null;
  }
  globalTheme() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('applicationglobalclass', '2001');
    this.dataSharedService.saveDebugLog('globalTheme',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.dataSharedService.applicationGlobalClass = res.data;
          this.loader = false;
        }
      },
      error: (err) => {
        this.loader = false;
      },
    });
  }
 

}

