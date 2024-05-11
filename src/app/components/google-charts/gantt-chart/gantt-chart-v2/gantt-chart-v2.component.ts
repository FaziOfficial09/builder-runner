
import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import Gantt from 'frappe-gantt-angular15';

@Component({
  selector: 'st-gantt-chart-v2',
  templateUrl: './gantt-chart-v2.component.html',
  styleUrls: ['./gantt-chart-v2.component.scss']
})
export class GanttChartV2Component implements OnInit, AfterViewInit {

  @ViewChild('gantt') ganttElement!: ElementRef;
  @Input() charts: any;
  @Input() chartData: any;
  gantt: any;

  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngAfterViewInit(): void {
    if (this.ganttElement) {
      const navtiveElement = this.ganttElement.nativeElement;
      this.gantt = new Gantt(navtiveElement, this.charts.tableData, this.charts);
    }
  }

  ngOnInit(): void {

  }
  ngOnChanges() {
    // This method will be called whenever the value of 'inputValue' changes
    if (this.ganttElement) {
      const navtiveElement = this.ganttElement.nativeElement;
      this.gantt = new Gantt(navtiveElement, this.charts.tableData, this.charts);
    }

  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      const transforData = data?.data?.map((res: any) =>
      ({
        ...res,
        start:res?.startdate,
        end:res?.enddate
      }))
      if (this.ganttElement) {
        const navtiveElement = this.ganttElement.nativeElement;
        this.gantt = new Gantt(navtiveElement,transforData, this.charts);
      }
    }
    return data;
  }

  config: any = {
    header_height: 50,
    column_width: 30,
    step: 24,
    view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
    bar_height: 20,
    bar_corner_radius: 3,
    arrow_curve: 5,
    padding: 18,
    view_mode: 'Day',
    date_format: 'YYYY-MM-DD',
    language: 'en',
    custom_popup_html: ''
  };
}
