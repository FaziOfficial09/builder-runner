import { Component, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'st-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent {
  @Input() item: any;
  @Input() mappingId: any;
  constructor() {
    this.processData = this.processData.bind(this);
  }
  //   Query
  //   SELECT 
  //     'red' as "tagColor",
  //     'twitter' as "icon",
  //     'Twitter' as "title"
  // from dev_test.sample;
  ngOnInit(): void {
    if (this.mappingId && this.item?.eventActionconfig && Object.keys(this.item.eventActionconfig).length > 0) {
      this.item.eventActionconfig['parentId'] = this.mappingId;
    }
  };
  onClose(data: any, index: any): void {
    data.options = data.options.filter((_: any, i: any) => i != index);
  }
  processData(res: any) {
    if (res?.data.length > 0) {
      this.item.options = res?.data
    } else if (res?.data.length == 0) {
      this.item.options = [];
    }
    return res;
  }
}
