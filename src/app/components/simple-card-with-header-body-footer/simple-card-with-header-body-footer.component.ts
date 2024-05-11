import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'st-simple-card-with-header-body-footer',
  templateUrl: './simple-card-with-header-body-footer.component.html',
  styleUrls: ['./simple-card-with-header-body-footer.component.scss']
})
export class SimpleCardWithHeaderBodyFooterComponent implements OnInit {
  @Input() cardData: any;
  constructor(private router: Router) { }

  ngOnInit(): void {
    
    this.cardData;
  }

  loadURLData(link: any) {
    if (link) {
      let routerLink = "/pages/" + link;
      this.router.navigate([routerLink]);
    }
  }

  showFooter() {
    let buttons = [];
    for (let item of this.cardData.children) {
      if (item.type == 'button' || item.type == 'buttonGroup' || item.type == 'linkButton' || item.type == 'dropdownButton') {
        buttons.push(item);
      }
    }
    if (buttons.length || this.cardData.footerText) {
      return true;
    } else {
      return false;
    }
  }


}
