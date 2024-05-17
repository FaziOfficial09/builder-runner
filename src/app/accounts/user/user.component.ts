import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { RegisterComponent } from '../../auth/register/register.component';
import { SocketService } from 'src/app/services/socket.service';
import { DataSharedService } from 'src/app/services/data-shared.service';


@Component({
  selector: 'st-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  visible = false;
  constructor(
    private toastr: NzMessageService,
    private modal: NzModalService,
    private drawerService: NzDrawerService,
    private socketService: SocketService,
    private dataSharedService :DataSharedService
  ) { }
  ngOnInit(): void {
    this.getUsers()
  }
  loading: boolean = false;
  listOfData: any[] = [];
  listOfDisplayData: any[] = [];
  searchData: any[] = [];
  edit: any = null;
  updateModel: any = {};
  startIndex = 1;
  endIndex: any = 10;
  pageIndex: any = 1;
  pageSize = 10;
  listOfColumns = [
    {
      name: 'User Name',
      key: 'username',
      searchValue: '',
    },
    {
      name: 'Accreditation Number',
      key: 'accreditationnumber',
      visible: false,
      searchValue: '',
    },
    {
      name: 'Status',
      key: 'status',
      searchValue: '',
    },
    {
      name: 'Action',
    },
  ];
  getUsers() {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.makeJsonData('users', '2001');
    this.dataSharedService.saveDebugLog('getUsers',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          this.loading = false;
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.listOfData = res.data;
            this.listOfDisplayData = res.data;
            this.handlePageChange(1,false);
          }
          else {
            this.toastr.error(res.message, { nzDuration: 2000 });
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('some error exception', { nzDuration: 2000 });
      },
    });
  }

  editFunc(data: any) {
    this.edit = data.uid;
    this.updateModel = JSON.parse(JSON.stringify(data));
  }
  cancelEdit(data: any) {
    for (const key in this.updateModel) {
      data[key] = this.updateModel[key];
    }
    // data = this.updateModel;
    this.edit = null;
  }
  saveEdit(data: any) {
    this.edit = null;
    this.loading = true;
    const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(data.uid);
    const Update = { [`users`]: data, metaInfo: metainfoupdate };
    this.dataSharedService.saveDebugLog('saveEdit',newUGuid)
    this.socketService.Request(Update);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newUGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            // this.listOfData = res.data;
            this.getUsers();
          }
          else {
            this.toastr.error(res.message, { nzDuration: 2000 });
          }
          this.loading = false;
        }

      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('some error exception', { nzDuration: 2000 });
      },
    });
  }
  delete(data: any) {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.deleteModelType('users', data.uid);
    this.dataSharedService.saveDebugLog('deleteUser',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata
          this.loading = false;
          if (res.isSuccess) {
            this.getUsers();
          }
          else {
            this.toastr.error(res.message, { nzDuration: 2000 });
          }
        }

      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('some error exception', { nzDuration: 2000 });
      },
    });
  }
  showDeleteConfirm(rowData: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this Record?',
      // nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzClassName: 'deleteRow',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.delete(rowData),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
// user commit
UserCommit() {
  this.loading = true;
  const { jsonData, newGuid } = this.socketService.makeJsonData('userscommit', '2001');
  this.dataSharedService.saveDebugLog('UserCommit',newGuid)
  this.socketService.Request(jsonData);
  this.socketService.OnResponseMessage().subscribe({
    next: (res: any) => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.loading = false;
          this.toastr.success(`User : ${res.message}`, { nzDuration: 3000 });
        } else {
          this.toastr.error(`User : ${res.message}`, { nzDuration: 3000 });
          this.loading = false;
        }
      }
    },
    error: (err) => {
      this.toastr.error(`User : An error occured`, { nzDuration: 3000 });
      this.loading = false;
    },
  });
}

  drawer() {
    const drawerRef = this.drawerService.create<
      RegisterComponent,
      { value: string },
      string
    >({
      // nzTitle: 'Bulk Update',
      nzWidth: 1000,
      nzContent: RegisterComponent,
      nzContentParams: {
        userAddDrawer: true
      },
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });
    drawerRef.afterClose.subscribe((data: any) => {
      if (data) {
        this.getUsers();
      }
    });
  }
  searchValue(event: any, column: any): void {
    const inputValue = event?.target ? event.target.value?.toLowerCase() : event?.toLowerCase() ?? '';
    if (inputValue) {
      this.searchData = this.searchData.filter((item: any) => {
        const { key } = column;
        const { [key]: itemName } = item || {}; // Check if item is undefined, set to empty object if so
        return itemName?.toLowerCase()?.includes(inputValue); // Check if itemName is undefined or null
      });
    }
  }
  search(event?: number): void {
    let checkSearchExist = this.listOfColumns.filter(a => a.searchValue);
    if (checkSearchExist.length > 0) {
      this.searchData = this.listOfData;
      checkSearchExist.forEach(element => {
        this.searchValue(element.searchValue, element)
      });
      this.handlePageChange(event ? event : this.pageIndex , true);
    } else {
      this.searchData = [];
      this.handlePageChange(event ? event : this.pageIndex , false);
    }
  }
  handlePageChange(event: number , searchData : boolean): void {
    this.pageSize = !this.pageSize || this.pageSize < 1 ? 1 : this.pageSize
    this.pageIndex = event;
    this.startIndex = (this.pageIndex - 1) * this.pageSize;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.endIndex = start + this.pageSize;
    const end = start + this.pageSize;
    this.startIndex = start == 0 ? 1 : ((this.pageIndex * this.pageSize) - this.pageSize) + 1;
    if(searchData && this.searchData.length == 0){
      this.listOfDisplayData = this.searchData;
    }else{
      this.listOfDisplayData = this.searchData.length > 0 ? this.searchData.slice(start, end) : this.listOfData.slice(start, end);
    }
    this.endIndex = this.listOfDisplayData.length != this.pageSize ? this.listOfData.length : this.pageIndex * this.pageSize;
  }
}
