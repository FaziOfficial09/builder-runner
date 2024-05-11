import { Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'st-timeline-builder',
  templateUrl: './timeline-builder.component.html',
  styleUrls: ['./timeline-builder.component.scss']
})
export class TimelineBuilderComponent implements OnInit {
  @Input() timelineData: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  constructor() { }

  ngOnInit(): void {

    this.timelineData;
  }

}
