import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'st-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit, OnChanges {
  @Input() switchData: any;
  constructor() { }
  ngOnInit(): void {
    this.switchData
  }
  ngOnChanges(changes: any) {
    // document.documentElement.style.setProperty('--my-color', this.switchData.switchCheckedColor);
  }

}
