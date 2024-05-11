import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'src/app/models/chart';

@Component({
  selector: 'st-sales-card',
  templateUrl: './sales-card.component.html',
  styleUrls: ['./sales-card.component.scss']
})
export class SalesCardComponent implements OnInit {

 @Input() salesdata: any;
 defaultName:string;
  constructor() { }
  revenueChart: ChartType = {
    series: [{
      data: [10, 20, 15, 40, 20, 50, 70, 60, 90, 70, 110]
    }],
    chart: {
      type: 'bar',
      height: 50,
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
      },
    },
    tooltip: {
      fixed: {
        enabled: false
      }
    },
    colors: ['#038edc'],
  };
  ngOnInit(): void {

    this.salesdata;

  }
  defaultFilter(filterData:any,check:any){


    // if(this.salesdata.length > 0){
    //   this.defaultName = this.salesdata[0].section[0].defaultfilter
    // }
  }
}
