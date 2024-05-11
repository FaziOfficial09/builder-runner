import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-stepped-area-chart',
  templateUrl: './stepped-area-chart.component.html',
  styleUrls: ['./stepped-area-chart.component.scss']
})
export class SteppedAreaChartComponent implements OnInit {
  @Input() charts: any;
  @Input() chartData: any;
  chartType = ChartType.SteppedAreaChart;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.label, Number(data.value1), Number(data.value2), Number(data.value3), Number(data.value4)]);
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
        const { minValue, maxValue } = this.calculateMinMax(this.chartData);
        this.updateChartOptions(minValue, maxValue);
      }, 100);
    }
    return data;
  }
  calculateMinMax(data: any[]): { minValue: number, maxValue: number } {
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;

    for (const row of data) {
      for (let i = 1; i < row.length; i++) {
        const value = row[i];
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }

    return { minValue, maxValue };
  }

  updateChartOptions(minValue: number, maxValue: number) {
    const numTicks = 5; // Adjust this according to your preference
    const tickIncrement = (maxValue - minValue) / (numTicks - 1);
    const ticks = Array.from({ length: numTicks }, (_, index) => minValue + index * tickIncrement);

    this.charts.options = {
      vAxis: {
        minValue: minValue,
        maxValue: maxValue,
        ticks: ticks
      }
    };
  }
}
