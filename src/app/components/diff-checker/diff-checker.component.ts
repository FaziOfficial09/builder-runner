import { Component, Input } from '@angular/core';
import { diff, Config, DiffPatcher, formatters, Delta } from "jsondiffpatch";

@Component({
  selector: 'st-diff-checker',
  templateUrl: './diff-checker.component.html',
  styleUrls: ['./diff-checker.component.scss']
})
export class DiffCheckerComponent {
  @Input() item: any;
  @Input() mappingId: any;
  nodes: any = {};
  private jsondiffpatch = new DiffPatcher();

  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {
    if (this.mappingId && this.item?.eventActionconfig && Object.keys(this.item.eventActionconfig).length > 0) {
      this.item.eventActionconfig['parentId'] = this.mappingId;
    }
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      let propertyNames = Object.keys(data?.data[0]);
      let result = data?.data?.map((item: any) => {
        let newObj: any = {};
        let propertiesToGet: string[];
        if ('id' in item && 'name' in item) {
          propertiesToGet = ['id', 'name'];
        } else {
          propertiesToGet = Object.keys(item).slice(0, 2);
        }
        propertiesToGet.forEach((prop) => {
          newObj[prop] = item[prop];
        });
        return newObj;
      });

      let finalObj = result.map((item: any) => {
        if(item[propertyNames[1]].length > 0){
          return {
            changeContent: item[propertyNames[1]].length > 0 ? (this.jsondiffpatch.diff(item.name || item[propertyNames[1]], item.id || item[propertyNames[0]])) : [],
            currentFileContent: item.id || item[propertyNames[0]]
          };
        }else{
          return {
            changeContent: item[propertyNames[1]].length > 0 ? (this.jsondiffpatch.diff(item.name || item[propertyNames[1]], item.id || item[propertyNames[0]])) : [],
            currentFileContent: item.id || item[propertyNames[0]]
          };
        }
       
      });

      this.item['content'] = finalObj;
    }
    // Your processing logic here
    return data;
  }
}
