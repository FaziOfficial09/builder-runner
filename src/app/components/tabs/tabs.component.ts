import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
  @Input() tabs: any;
  selectedIndex = 0;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  getData: any = [];
  constructor(public dataSharedService: DataSharedService) {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {
    document.documentElement.style.setProperty('--selected-tab-color', this.tabs?.selectedTabColor || '#1890ff');
  }
  handleTabChange(index: number) {
    console.log('Selected tab index: ', index);
    // add your code here to handle the tab change
  }
  handleIndexChange(e: number): void {
    console.log(e);
  }
  handleTabSelect(index: any, data?: any) {
    this.tabs.selectedIndex = index;
    console.log('Selected tab index: ', index);
    // add your code here to handle the tab select event
  }
  tabClick(data?: any) {
    const findEvent: any = this.tabs?.appConfigurableEvent?.find((item: any) => item?.action == 'click');
    if (findEvent) {
      const event = {
        component: this.tabs,
        value: data.value,
        formly: false
      }
      this.dataSharedService.gridLoadById.next(event);
      return;

    }
    // add your code here to handle the tab select event
  }
  closeTab({ index }: { index: number }): void {

    this.tabs.children.splice(index, 1);
    this.tabs.nodes = this.tabs.children.length;
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
        return {
          label: item.name || item[propertyNames[1]],
          value: item.id || item[propertyNames[0]],
        };
      });
      this.getData = finalObj;
      if (this.getData.length > 0) {
        this.tabClick(this.getData[0])
      }
    }
    // Your processing logic here
    return data;
  }
}
