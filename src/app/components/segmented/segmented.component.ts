import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-segmented',
  templateUrl: './segmented.component.html',
  styleUrls: ['./segmented.component.scss']
})
export class SegmentedComponent {
  @Input() item: any;
  @Input() mappingId: any;
  selectedIndex: any = 0;
  handleIndexChange(e: number): void {
    console.log(e);
  }
  moreLoadedDisabled: boolean = false
  constructor(public dataSharedService: DataSharedService,
    private toasterService: ToasterService,
    private cd: ChangeDetectorRef) {
    this.processData = this.processData.bind(this);
  }
  // Query
  //   SELECT 
  //   ROW_NUMBER() OVER () as id,
  //     'Daily' as "label"
  // from dev_test.sample
  ngOnInit(): void {
    if (this.mappingId && this.item?.eventActionconfig && Object.keys(this.item.eventActionconfig).length > 0) {
      this.item.eventActionconfig['parentId'] = this.mappingId;
    };
    this.selectedIndex = this.item.defaultSelectedIndex
    this.addPagination(this.item?.numberOfRecords);
  };
  onClose(data: any, index: any): void {
    data.options = data.options.filter((_: any, i: any) => i != index);
  }
  processData(res: any) {
    if (res?.data.length > 0) {
      this.item.options = res?.data;
      this.resulteCreate(res);
    } else if (res?.data.length == 0) {
      this.item.options = [];
    }
    return res;
  }
  addPagination(numberOfRecords: any) {
    localStorage.removeItem('tablePageNo');
    localStorage.removeItem('tablePageSize');
    this.item['searchValue'] = '';
    if (numberOfRecords && this.item.showLoadMore) {
      localStorage.setItem('tablePageNo', '1');
      localStorage.setItem('tablePageSize', numberOfRecords);
      this.item.eventActionconfig['page'] = 1;
      this.item.eventActionconfig['pageSize'] = numberOfRecords;
      const length = parseInt(this.item.options.length, 10); // Convert string to number
      const numberOfRecordsInNum = parseInt(this.item?.numberOfRecords, 10) || 0; // Convert string to number and handle undefined/null case
      const total = length + numberOfRecordsInNum;
      if(this.item.defaultSelectedIndex  > total|| total == this.item.defaultSelectedIndex){
        this.item.defaultSelectedIndex = 0;
      }
    }
  }
  handleLoadMore() {
    if (this.item?.eventActionconfig && Object.keys(this.item.eventActionconfig).length > 0) {
      const length = parseInt(this.item.options.length, 10); // Convert string to number
      const numberOfRecords = parseInt(this.item?.numberOfRecords, 10) || 0; // Convert string to number and handle undefined/null case
      const total = length + numberOfRecords;
      this.addPagination(total);
      this.dataSharedService.recallOnLoad(this.item)
        .then((response: any) => {
          if (response.isSuccess) {
            this.toasterService.checkToaster(this.item, 'retrive');
            this.item.options = response.data;
            this.resulteCreate(response);
          } else {
            if (response?.error == 'Action not found') return;
            this.toasterService.checkToaster(this.item, 'error');
            this.item.options = [];
          }
        })
        .catch((error: any) => {
          console.error("Error occurred:", error);
          this.toasterService.checkToaster(this.item, 'error');
          this.item.options = false;
        });
    }
    else {
      if (this.item.options.length > 0) {
        const numberOfRecords = parseInt(this.item?.numberOfRecords, 10) || 0; // Convert string to number and handle undefined/null case
        const selectedRecords = this.item.options.slice(0, numberOfRecords);
        this.item.options.push(...selectedRecords);
      }
    }
  }
  resulteCreate(res: any) {
    if ((res?.count < this.item.options.length) || (res?.count == this.item.options.length)) {
      this.moreLoadedDisabled = true;
    }
    if ((this.item.defaultSelectedIndex > this.item.options.length) || (this.item.defaultSelectedIndex == this.item.options.length)) {
      this.selectedIndex = 0;
    }
  }
}
