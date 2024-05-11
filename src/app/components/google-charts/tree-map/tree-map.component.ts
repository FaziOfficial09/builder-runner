import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'st-tree-map',
  templateUrl: './tree-map.component.html',
  styleUrls: ['./tree-map.component.scss']
})
export class TreeMapComponent implements OnInit {
  @Input() charts: any;
  chartType = ChartType.TreeMap;
  @Input() chartData: any;
  constructor() {
    this.processData = this.processData.bind(this);
   }

  ngOnInit(): void {
    this.chartData = this.charts.tableData.map((data: any) => [data.id, data.value1 , data.value2 , data.value3]);
    this.charts.options.title = this.charts?.title
  }

  processData(data: any) {
    if (data?.data?.length > 0) {
      this.chartData = [];
      setTimeout(() => {
        this.chartData = data?.data.map((data: any) => [data.id,data.label, data.value1 , data.value2]);
      }, 1000);
    }
    return data;
  }

}
