import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'st-layout-tabs-dropdown',
  templateUrl: './layout-tabs-dropdown.component.html',
  styleUrls: ['./layout-tabs-dropdown.component.scss']
})
export class LayoutTabsDropdownComponent implements OnInit {
  @Input() layoutTabsDropdownData: any;
  @Input() theme: any;
  tempData: any;
  moreMenu: any = [];
  isActiveShow: any;
  isActiveShowChild: any;
  hoverActiveShow: any;
  constructor(private router: Router,  private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    debugger
    this.tempData = JSON.parse(JSON.stringify(this.layoutTabsDropdownData));
    // window.onresize = () => {
    //   this.controlMenu();
    // };
    if (this.layoutTabsDropdownData.children.length > 6) {
      this.layoutTabsDropdownData['aboveSevenTab'] = this.layoutTabsDropdownData.children.slice(6);
      this.layoutTabsDropdownData.children = this.layoutTabsDropdownData.children.slice(0, 6);
    }
    if (window.location.href.includes('/pages')) {
      const urlSegments = window.location.href.split('/');
      let findMenu = this.layoutTabsDropdownData.children.find((menu: any) => menu.link == `/pages/${urlSegments[urlSegments.length - 1].trim()}`);
      if (findMenu && this.layoutTabsDropdownData.children.length > 0) {
        this.screenLoad(findMenu, true);
      }
      else if (this.layoutTabsDropdownData.children.length > 0) {
        this.screenLoad(this.layoutTabsDropdownData.children[0], true);
      }
    }
  }
  screenLoad(data: any, allow: boolean) {
    const idToUpdate = allow ? 'isActiveShow' : 'isActiveShowChild';
    this[idToUpdate] = data.id;

    if (data.link && !window.location.href.includes('/menu-builder')) {
      const routerLink = data.link.includes('/pages/') ? data.link : '/pages/' + data.link;
      this.router.navigate([routerLink]);
    }
  }
  setHovered(value: any, event: any) {
    event.stopPropagation();
    if (!value) {
      document.documentElement.style.setProperty('--inPageHoverColor', this.theme['child']['hoverBgColor']);
    }
  }
  // controlMenu() {

  //   const screenWidth = window.innerWidth;
  //   let arrayList = [];
  //   this.moreMenu = [];
  //   this.layoutTabsDropdownData.children = this.tempData.children;
  //   arrayList = this.layoutTabsDropdownData.children;
  //   if (screenWidth <= 789) {
  //     if (this.layoutTabsDropdownData.children.length > 2) {
  //       this.moreMenu = this.layoutTabsDropdownData.children.slice(2);
  //       this.layoutTabsDropdownData.children = arrayList.slice(0, 2)
  //     }
  //   } else {
  //     this.layoutTabsDropdownData.children = this.tempData.children
  //     // this.moreMenu = [];
  //   }
  // }

}
