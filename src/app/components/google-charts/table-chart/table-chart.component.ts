import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-table-chart',
  templateUrl: './table-chart.component.html',
  styleUrls: ['./table-chart.component.scss']
})
export class TableChartComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.Table;
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
      this.charts['columnNames'] = [];
      const headerRow = Object.keys(data?.data?.[0]);
      this.charts.columnNames = headerRow;
      // Extracting the data rows
      const dataRows = data?.data?.map((obj: any) => headerRow.map(key => obj[key]));
      this.chartData = dataRows;
      this.charts.tableData = dataRows;
      // setTimeout(() => {
      //   data?.data?.forEach((element:any) => {
      //     const value  = Object.values(element);
      //     this.chartData.push(value);
      //   });
      //   // this.chartData = data?.data?.map((data: any) => {
      //   //   const values = Object.keys(data)
      //   //     .filter(key => key.startsWith('value'))
      //   //     .map(key => Number(data[key]));
      //   //   return [data?.label, ...values];
      //   // });
      // }, 100);
    }
    return data;
  }
}
