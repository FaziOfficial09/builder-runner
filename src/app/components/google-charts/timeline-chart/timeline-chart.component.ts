import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-timeline-chart',
  templateUrl: './timeline-chart.component.html',
  styleUrls: ['./timeline-chart.component.scss']
})
export class TimelineChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.Timeline;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {

    this.chartData = this.charts.tableData.map((data: any) => [data.label, data.value, new Date(data.startDate), new Date(data.endDate)]);
    console.log(this.chartData)
  }
  convertIntoDate(date: any) {

    if (!date) {
      return null;
    }
    const startDateArray = date.split('/').map((str: any) => parseInt(str.trim(), 10));
    const startDate = startDateArray.length ? new Date(startDateArray[0], startDateArray[1], startDateArray[2]) : null;
    return startDate;
  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      setTimeout(() => {
        this.chartData = data?.data.map((data: any) => {
          // Check if startdate is a valid date, otherwise use current date
          const startDate = data.startdate ? new Date(data.startdate) : new Date();

          // Check if enddate is a valid date, otherwise use current date
          const endDate = data.enddate ? new Date(data.enddate) : new Date();

          // Check if label exists, otherwise use empty string
          const label = data.label || '';

          // Check if value exists, otherwise use empty string
          const value = data.value || '';

          return [label, value, startDate, endDate];
        });
      }, 100);
    }
    return data;
  }

}
