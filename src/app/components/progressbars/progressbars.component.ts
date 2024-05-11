import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-progressbars',
  templateUrl: './progressbars.component.html',
  styleUrls: ['./progressbars.component.scss']
})

/**
 * Progressbars components
 */
export class ProgressbarsComponent implements OnInit {
  current = {
    '--width': '10px !important',
  }
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  @Input() progressBarData: any;

  constructor() { }

  ngOnInit(): void {

    this.progressBarData;
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'UI Elements' },
      { label: 'Progress Bars', active: true }
    ];
  }


}
