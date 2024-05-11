import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent implements OnInit {
  @Input() descriptionData : any;
  constructor() { 
    this.processData = this.processData.bind(this);
  }
  // Query
  // select label as title ,value as content from dev_test.sample
  ngOnInit(): void {
    // this.descriptionData
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      this.descriptionData.children = data?.data;
    }
    return data;
  }
}
