import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})
export class GanttChartComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.Gantt;
  @Input() chartData: any;
  chartOptions: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {

    this.chartData = this.makeData(this.charts.tableData);
    // this.charts.tableData = this.chartData;

  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      this.charts['columnNames'] = [];
      setTimeout(() => {
        const headerRow = Object.keys(data?.data?.[0]);
        this.charts.columnNames = headerRow;
        // Extracting the data rows
        const dataRows = this.makeData(data?.data)
        this.chartData = dataRows;
        this.charts.tableData = dataRows;
      }, 1000);
    }
    return data;
  }
  makeData(originalData: any) {
    const transformedData = originalData.map((item: any) => {
      let transformedItem: any[] = [];
      Object.values(item).forEach((val: any) => {
        if (!val) {
          transformedItem.push(val);
        }
        else if (typeof val === 'number') {
          transformedItem.push(isNaN(val) ? val : Number(val));
        }
        else if (val.includes(',')) {
          const dates = this.isValidDate(val) ? new Date(val) : val
          transformedItem.push(dates);
        } else {
          if (!val) {
            transformedItem.push(val);
          } else
            transformedItem.push(isNaN(val) ? val : Number(val));
        }
      });
      return transformedItem;
    });
    return transformedData;
  }
  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
