import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-combo-chart',
  templateUrl: './combo-chart.component.html',
  styleUrls: ['./combo-chart.component.scss']
})
export class ComboChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.ComboChart;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.label, Number(data.col1), Number(data.col2), Number(data.col3), Number(data.col4), Number(data.col5), Number(data.col6)]);
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
