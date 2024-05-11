import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';
@Component({
  selector: 'st-sankey-chart',
  templateUrl: './sankey-chart.component.html',
  styleUrls: ['./sankey-chart.component.scss']
})
export class SankeyChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.Sankey;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData;
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

    }
    return data;
  }

}
