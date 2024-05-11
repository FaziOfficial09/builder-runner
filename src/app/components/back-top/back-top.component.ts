import { Component, Input, OnInit , HostListener} from '@angular/core';

@Component({
  selector: 'st-back-top',
  templateUrl: './back-top.component.html',
  styleUrls: ['./back-top.component.scss']
})
export class BackTopComponent implements OnInit {
  @Input() backTopData: any;


  showScroll: boolean;
 showScrollHeight = 50;
  hideScrollHeight = 50;

  constructor() { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (
      (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop
      ) > this.showScrollHeight
    ) {
      this.showScroll = true;
    } else if (this.showScroll &&
      (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop) < this.hideScrollHeight
    ) {
      this.showScroll = false;
    }
  }

  ngOnInit() {
    this.showScrollHeight = this.backTopData.showScrollHeight;
    this.hideScrollHeight = this.backTopData.showScrollHeight;
  }

  scrollToTop() {
    (function smoothscroll() {
      const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - (currentScroll / 5));
      }
    })();
  }


}
