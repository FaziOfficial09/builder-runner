import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.LineChart;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.id, data.col1, data.col2, data.col3]);
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
