import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnInit {
  @Input() statisticData: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
  }
  //   Query
  //   SELECT label AS title,
  //        startdate AS value,
  //        'fa fa-user' AS "prefixIcon",
  //        'fa fa-star' AS "suffixIcon"
  // FROM dev_test.sample
  // LIMIT 100;
  processData(res: any) {
    if (res?.data.length > 0) {
      this.statisticData.statisticArray = res?.data;
    }
    return res;
  }
}
