import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'st-builder-menu-child',
  templateUrl: './builder-menu-child.component.html',
  styleUrls: ['./builder-menu-child.component.scss']
})
export class BuilderMenuChildComponent implements OnInit {

  @Input() menuData: any;
  @Input() data: any;
  @Input() isActiveShow: any;
  @Input() hoverActiveShow: any;
  @Output() menuClick: EventEmitter<any> = new EventEmitter();
  @Output() subClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    console.log(this.menuData)
  }
  menuClickChild(event: MouseEvent, menu: any) {
    event.stopPropagation();
    this.menuClick.emit({ event, menu });
  }
  subClickChild(event: MouseEvent, menu: any) {
    event.stopPropagation();
    this.subClick.emit({ event, menu });
  }
  childMenuClick(value: any) {
    const { event, menu } = value;
    this.menuClickChild(event,menu)
  }
  childMenuSubClick(value: any) {
    const { event, menu } = value;
    this.subClickChild(event,menu)
  }

}
