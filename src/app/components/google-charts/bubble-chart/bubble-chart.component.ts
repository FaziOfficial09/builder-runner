import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-bubble-chart',
  templateUrl: './bubble-chart.component.html',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.BubbleChart;
  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.id, data.x, data.y, data.temprature]);
    this.charts.options.title = this.charts?.title
  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      setTimeout(() => {
        this.chartData = data?.data?.map((data: any) => {
          const values = Object.keys(data)
            .filter(key => key.startsWith('value'))
            .map(key => Number(data[key]));
          return [data.label, ...values];
        });
      }, 100);
    }
    return data;
  }

}
