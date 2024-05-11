import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-app-side-menu',
  templateUrl: './app-side-menu.component.html',
  styleUrls: ['./app-side-menu.component.scss']
})
export class AppSideMenuComponent implements OnInit {
  @Input() selectedTheme: any;
  @Input() mobileView: any;
  @Input() menuItems: any = [];
  @Output() notify: EventEmitter<any> = new EventEmitter();
  newMenuArray: any = false;
  menuChildArrayTwoColumn: any = [];
  moduleData: any = [];
  selectApplicationModuleData: any = [];
  requestSubscription: Subscription;
  checked: false
  isActiveShow: any;
  hoverActiveShow: any;
  currentUrl = "";
  currentUser: any;
  openMap: { [name: string]: boolean } = {
    sub1: true,
    sub2: false,
    sub3: false
  };
  commentForm: FormGroup;
  newcomment: any = '';
  newCommentRes: any = '';
  showAllComments = false;
  commentEdit = false;
  showRply = '';
  commentEditObj: any = {};
  assignToresponse: any = '';
  constructor( private router: Router,
    public dataSharedService: DataSharedService,private formBuilder: FormBuilder) { }
  ngOnInit(): void {
    document.documentElement.style.setProperty('--my-color1', this.selectedTheme['hoverBgColor']);
    this.currentUser = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    if (!window.location.href.includes('/menu-builder')) {
      window.onresize = () => {
        this.changeHtlmenuAtMblView();
      };
    }
    this.commentForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }
  }

  setHovered(value: any, event: any) {
    event.stopPropagation();
    // if (!value) {
    //   document.documentElement.style.setProperty('--my-color1', this.selectedTheme['hoverBgColor']);
    // }
    if (this.selectedTheme.sideBarSize == 'smallHoverView' && (this.selectedTheme.layout == 'vertical' || this.selectedTheme.layout == 'rtl')) {
      if (!this.selectedTheme.checked) {
        this.selectedTheme.isCollapsed = value;
      }
    }
  }

  makeMenuData() {
    let arrayList = [];
    this.menuItems = this.selectedTheme.allMenuItems;
    arrayList = this.menuItems;
    this.selectedTheme.allMenuItems = [];
    this.selectedTheme.newMenuArray = [];
    if (this.menuItems.length > 7 && this.selectedTheme.layout == 'horizental') {
      this.selectedTheme.newMenuArray = [{
        label: "More",
        icon: "down",
        id: 'menu_428605c1',
        key: 'menu_0f7d1e4e',
        children: []
      }]
      const withOutTitle = this.menuItems.filter((a: any) => a.isTitle != true);
      this.selectedTheme.newMenuArray[0].children = withOutTitle.slice(7);
      this.selectedTheme.allMenuItems = arrayList.filter((a: any) => a.isTitle != true).slice(0, 7);
    }
    else {
      this.selectedTheme.allMenuItems = arrayList;
    }
  }
  loadTabsAndButtons(event: MouseEvent, data: any, pushInTwoColumn?: any, allowHideInMblView?: any, twoColumnSecondColumn?: any) {
    if (this.mobileView && allowHideInMblView) {
      this.selectedTheme.isCollapsed = true;
    }
    if (allowHideInMblView) {
      this.isActiveShow = data.id;
    }
    event.stopPropagation();
    if (data.application) {
      this.dataSharedService.selectApplication = data.id;
      this.selectApplicationModuleData = this.moduleData.filter((item: any) => item.applicationName == data.title);
      this.notify.emit(this.selectApplicationModuleData);
    }
    else {
      this.notify.emit(data);
      let checkTabs: any = data.children.find((child: any) => child.type == 'mainTab');
      if (data.link && !checkTabs && !window.location.href.includes('/menu-builder')) {
        if (data.link.includes('#')) {
          this.dataSharedService.moveLink.next(data.link)
        } else {
          this.dataSharedService.currentMenuLink = data.link;
          localStorage.setItem('screenId', this.dataSharedService.currentMenuLink);
          this.router.navigate([data.link]);
        }
      }
      else if (this.selectedTheme.layout == 'twoColumn') {
        let menus = data.children.filter((child: any) => child.type == 'input')
        if (menus.length > 0 && pushInTwoColumn) {
          this.selectedTheme['menuChildArrayTwoColumn'] = [];
          this.selectedTheme['isCollapsed'] = false;
          this.selectedTheme['menuChildArrayTwoColumn'].push(...menus);
        }
        else if (!twoColumnSecondColumn) {
          this.selectedTheme['isCollapsed'] = true;
        }

      }
    }
  }
  changeHtlmenuAtMblView() {
    const screenWidth = window.innerWidth;
    let arrayList = [...this.menuItems];
    // this.selectedTheme.allMenuItems = [];
    this.selectedTheme.newMenuArray = [];
    if (this.menuItems.length > 7 && this.selectedTheme.layout === 'horizental' && screenWidth > 768) {
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
  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }

  handleContextMenu(event: MouseEvent, item: any) {

    // event.stopPropagation();
    // event.preventDefault();
    this.dataSharedService.rightClickMenuData = item;
    console.log("Right-click event occurred!");
  }
}


