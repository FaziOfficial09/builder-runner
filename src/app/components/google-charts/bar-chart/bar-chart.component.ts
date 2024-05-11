import { Component, Input, OnInit } from '@angular/core';
import { ChartType, Formatter } from 'angular-google-charts';
@Component({
  selector: 'st-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.Bar;
  chartColumns: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {

    // this.charts.columnNames.push({ role: 'style', type: 'string' }, { role: 'annotation', type: 'string' })
    this.chartData = this.charts.tableData;
    this.charts.options.title = this.charts?.title
  }


  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      this.charts.columnNames = [];
      setTimeout(() => {

        const headerRow = Object.keys(data?.data?.[0]);
        this.charts.columnNames = headerRow;
        // Extracting the data rows
        const dataRows = data?.data?.map((obj:any) => headerRow.map(key => obj[key]));
        this.chartData  = dataRows;
        this.charts.tableData = dataRows;
      }, 100);
    }
    return data;
  }
}
