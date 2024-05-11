import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-scatter-chart',
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss']
})
export class ScatterChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.ScatterChart;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.id, data.value]);
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      setTimeout(() => {
        // data?.data?.forEach((element: any) => {
        //   const value  = Object.values(element);
        //   const values: any[] = value.map((value: any) => {
        //     return Number.isInteger(+value) ? +value : value;
        //   });
        //   this.chartData.push(values);
        // });
        this.chartData = data?.data?.map((data: any) => {
          const values = Object.keys(data)
            .filter(key => key.startsWith('value'))
            .map(key => Number(data[key]));
          return [data?.label, ...values];
        });
      }, 100);
    }
    return data;
  }


}
