import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-column-chart',
  templateUrl: './column-chart.component.html',
  styleUrls: ['./column-chart.component.scss']
})
export class ColumnChartComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.ColumnChart;
  @Input() chartData: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {

    // this.charts.columnNames.push({ role: 'style', type: 'string' }, { role: 'annotation', type: 'string' })
    this.chartData = this.charts.tableData;
  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      this.charts['columnNames'] = [];
      const headerRow = Object.keys(data?.data?.[0]);
      this.charts.columnNames = headerRow;
      // Extracting the data rows
      const dataRows = data?.data?.map((obj: any) => headerRow.map(key => Number.isInteger(+obj[key]) ? +obj[key] : obj[key]));
      this.chartData = dataRows;
      this.charts.tableData = dataRows;

    }
    return data;
  }
}
