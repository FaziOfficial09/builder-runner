import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'st-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
  @Input() type: any;
  @Input() icon: any;
  @Input() size: any;
  @Input() color: any;
  @Input() hoverIconColor: any;
  @Input() iconClass: any;
  @Input() applicationThemeClasses: any;
  @Input() appGlobalClass: any;
  constructor() { }
  mainColor: any;

  ngOnInit(): void {
    
    this.color;
    this.icon;
    this.size;
    this.type;
  }


  applyHoverColor() {

  }
  applyColor(allow: boolean) {
    
    if (allow) {
      this.mainColor = this.color;
      this.color = this.hoverIconColor;
    } else {
      this.color = this.mainColor;
    }
  }
}
