import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-histogram-chart',
  templateUrl: './histogram-chart.component.html',
  styleUrls: ['./histogram-chart.component.scss']
})
export class HistogramChartComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.Histogram;
  @Input() chartData:any;
  options: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.label, data.value]);
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
