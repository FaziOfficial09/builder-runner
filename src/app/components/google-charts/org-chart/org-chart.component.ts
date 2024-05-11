import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.OrgChart;
  @Input() chartData: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      data?.data?.forEach((element:any) => {
        const value  = Object.values(element);
        this.chartData.push(value);
      });
      // setTimeout(() => {

      //   // this.chartData = data?.data?.map((data: any) => {
      //   //   const values = Object.keys(data)
      //   //     .filter(key => key.startsWith('value'))
      //   //     .map(key => Number(data[key]));
      //   //   return [data?.label, ...values];
      //   // });
      // }, 0);
    }
    return data;
  }
}
