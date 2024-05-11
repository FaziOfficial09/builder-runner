import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  initLoading = true; // bug
  data: any[] = [];
  list: any = [];
  constructor(public dataSharedService: DataSharedService,
    private toasterService: ToasterService,
    private socketService: SocketService) {
    this.processData = this.processData.bind(this);
  }
  @Input() listData: any;
  @Input() mappingId: any;
  //   Query
  //   SELECT 
  //     ROW_NUMBER() OVER () as id,
  //     'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png' as "avatar",
  //     'Mr Felicíssimo Porto' as "name",
  //     'https://ng.ant.design' as "lastNameHref",
  //     'Ant Design, a design language for background applications, is refined by Ant UED Team' as "description",
  //     'felicissimo.porto@example.com' as "email",
  //     'male' as "gender",
  //     'Content' as "content",
  //     'BR' as "nat"
  // FROM 
  //     dev_test.sample
  ngOnInit(): void {
    this.listData;
    this.data = this.listData.options;
    this.list = this.listData.options;
    this.initLoading = false;

    if (this.mappingId && this.listData?.eventActionconfig && Object.keys(this.listData.eventActionconfig).length > 0) {
      this.listData.eventActionconfig['parentId'] = this.mappingId;
    }
    this.addPagination(this.listData?.numberOfRecords);
  }
  onLoadMore(): void {
    if (this.listData?.eventActionconfig && Object.keys(this.listData.eventActionconfig).length > 0) {
      const length = parseInt(this.list.length, 10); // Convert string to number
      const numberOfRecords = parseInt(this.listData?.numberOfRecords, 10) || 0; // Convert string to number and handle undefined/null case
      const total = length + numberOfRecords;
      this.addPagination(total);
      this.dataSharedService.recallOnLoad(this.listData)
        .then((response: any) => {
          if (response.isSuccess) {
            this.toasterService.checkToaster(this.listData, 'retrive');
            this.list = response.data;
          } else {
            if (response?.error == 'Action not found') return;
            this.toasterService.checkToaster(this.listData, 'error');
            this.list = [];
          }
        })
        .catch((error: any) => {
          console.error("Error occurred:", error);
          this.toasterService.checkToaster(this.listData, 'error');
          this.data = []; // Handle error by setting data to an empty array
          this.list = false;
        });
    }
    else {
      this.listData.isLoad = true;
      this.data = this.data.concat(this.listData.options);
      this.list = [...this.data];
      this.listData.isLoad = false;
    }

  }

  edit(item: any): void {
    // this.msg.success(item.email);
  }
  processData(data: any) {
    if (data?.data.length > 0) {
      this.list = data?.data;
    }
    return data;
  }
  addPagination(numberOfRecords: any) {
    localStorage.removeItem('tablePageNo');
    localStorage.removeItem('tablePageSize');
    this.listData['searchValue'] = '';
    if (this.listData.isLoad && numberOfRecords) {
      localStorage.setItem('tablePageNo', '1');
      localStorage.setItem('tablePageSize', numberOfRecords);
      this.listData.eventActionconfig['page'] = 1;
      this.listData.eventActionconfig['pageSize'] = numberOfRecords;
    }
  }
}
