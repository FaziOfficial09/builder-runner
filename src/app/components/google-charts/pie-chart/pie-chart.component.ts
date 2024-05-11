import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.PieChart;
  constructor() { }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [
      data.name,
      (typeof data.value === 'string' ? parseFloat(data.value) : data.value) ?? 0
    ]);
    
  }

}
