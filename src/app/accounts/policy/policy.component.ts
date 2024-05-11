import { SocketService } from 'src/app/services/socket.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})

export class PolicyComponent implements OnInit {
  paginatedData: any[] = [];
  model: any;
  jsonPolicyModule: any = [];
  isSubmit: boolean = true;
  breadCrumbItems!: Array<{}>;
  isVisible: boolean = false;
  listOfData: any[] = [];
  listOfDisplayData: any[] = [];
  loading = false;
  searchValue = '';
  pageSize = 10;
  searchIcon = "search";
  fields: any = [];
  options: FormlyFormOptions = {};
  form: any = new FormGroup({});
  pageIndex: any = 1;
  totalItems: number = 0; // Total number of items
  startIndex = 1;
  endIndex: any = 10;
  themeList: any[] = [];
  applicationThemeList: any[] = [];
  listOfColumns = [
    {
      name: 'Policy Id',
      visible: true,
      sortOrder: null,
      sortFn: (a: any, b: any) => a.id.localeCompare(b.id),
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Policy Name',
      visible: false,
      searchValue: '',
      sortOrder: null,
      sortFn: (a: any, b: any) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
    },
    {
      name: 'Action',
      sortOrder: null,
      sortFn: (a: any, b: any) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
    },
  ];
  constructor(
    public dataSharedService: DataSharedService,
    private toastr: NzMessageService,
    private socketService: SocketService
  ) {
  }
  ngOnInit(): void {
    this.totalItems = this.listOfDisplayData.length;
    this.breadCrumbItems = [
      { label: 'Formly' },
      { label: 'Pages', active: true }
    ];
    this.loadPolicyListFields();
    this.jsonPolicyModuleList();
    this.getTheme();
    this.getMenuTheme();
    this.getApplicationTheme();
  }
  getMenuTheme() {
    let id = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')).userId : null;

  }
  jsonPolicyModuleList() {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.makeJsonData('Policy', '2001');
    this.socketService.Request(jsonData);
    this.dataSharedService.saveDebugLog('jsonPolicyModuleList',newGuid)
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.loading = false;
            this.toastr.success(`Policy : ${res.message}`, { nzDuration: 3000 });
            if (res?.data.length > 0) {
              this.listOfDisplayData = res.data;
              this.listOfData = res.data;
              this.jsonPolicyModule = res.data;
              this.handlePageChange(1);
              const nonEmptySearchArray = this.listOfColumns.filter(
                (element: any) => element.searchValue
              );
              nonEmptySearchArray.forEach((element: any) => {
                this.search(element.searchValue, element);
              });
            }
          } else {
            this.toastr.error(`Policy : ${res.message}`, { nzDuration: 3000 });
            this.loading = false;
          }
        }

      },
      error: (err) => {
        this.toastr.error(`Policy : An error occured`, { nzDuration: 3000 });
        this.loading = false;
      },
    });
  }
  policyCommit() {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.makeJsonData('policycommit', '2001');
    this.socketService.Request(jsonData);
    this.dataSharedService.saveDebugLog('policyCommit',newGuid)
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.loading = false;
            this.toastr.success(`Policy : ${res.message}`, { nzDuration: 3000 });
          } else {
            this.toastr.error(`Policy : ${res.message}`, { nzDuration: 3000 });
            this.loading = false;
          }
        }
      },
      error: (err) => {
        this.toastr.error(`Policy : An error occured`, { nzDuration: 3000 });
        this.loading = false;
      },
    });
  }
  openModal() {
    this.form.reset();
    this.isVisible = true;
    if (this.isSubmit) {
      for (let prop in this.model) {
        if (this.model.hasOwnProperty(prop)) {
          this.model[prop] = null;
        }
      }
    }
    if (!this.isSubmit) {
      this.isSubmit = true;
      // this.getDepartment();
      // this.getOrganization();
    }
  }
  handleCancel(): void {
    this.isVisible = false;
  }

  onSubmit() {

    if (!this.form.valid) {
      this.handleCancel();
      return;
    }

    let findDataPolicy = this.listOfDisplayData.find(
      (a) =>
        a.name.toLowerCase() == this.form.value.name.toLowerCase() &&
        a.id != this.model?.id
    );

    if (findDataPolicy) {
      if (findDataPolicy) {
        this.toastr.warning(
          'Policy name already exists in the database. Please choose a different name.',
          { nzDuration: 2000 }
        );
      }
      this.loading = false;
      return;
    } else {
      let obj = {
        applicationId: this.dataSharedService.decryptedValue('applicationId'),
        name: this.form.value.name,
        menuThemeId: this.form.value.menuthemeid,
        applicationTheme: this.form.value.applicationtheme
      };
      var ResponseGuid: any;
      if (this.isSubmit) {
        const { newGuid, metainfocreate } = this.socketService.metainfocreate();
        ResponseGuid = newGuid;
        const Add = { [`Policy`]: obj, metaInfo: metainfocreate }
        this.dataSharedService.saveDebugLog('PolicyAdd',newGuid)
        this.socketService.Request(Add);
      }
      else {
        const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(this.model.id);
        ResponseGuid = newUGuid;
        const Update = { [`Policy`]: obj, metaInfo: metainfoupdate };
        this.dataSharedService.saveDebugLog('PolicyUpdate',newUGuid)
        this.socketService.Request(Update)
      }

      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == ResponseGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess) {
              this.isVisible = false;
              this.jsonPolicyModuleList();
              const message = this.isSubmit ? 'Save' : 'Update';
              this.toastr.success(res.message, { nzDuration: 3000 });
              if (!this.isSubmit) {
                this.isSubmit = true;
              }
              this.handleCancel();
            } else {
              this.toastr.error(res.message, { nzDuration: 3000 });
            }
          }
        },
        error: (err) => {
          this.toastr.error(`${err.error.message}`, { nzDuration: 3000 });
        },
      });
    }
  }


  editItem(item: any) {
    this.model = JSON.parse(JSON.stringify(item));
    this.isSubmit = false;
  }
  deleteRow(id: any): void {
    const { jsonData, newGuid } = this.socketService.deleteModelType('Policy', id);

    this.dataSharedService.saveDebugLog('PolicyDelete',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe((res: any) => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata
        if (res.isSuccess) {
          this.jsonPolicyModuleList();
          this.handlePageChange(1);
          this.toastr.success(`Policy: ${res.message}`, { nzDuration: 2000, });
        } else this.toastr.error(`Policy: ${res.message}`, { nzDuration: 2000, });
      }
    });
  }
  downloadJson() {
    let obj = Object.assign({}, this.jsonPolicyModule);
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'file.';
    document.body.appendChild(a);
    a.click();
  }

  search(event?: any, data?: any): void {

    const inputValue = event?.target ? event.target.value?.toLowerCase() : event?.toLowerCase() ?? '';
    if (inputValue) {
      this.listOfDisplayData = this.listOfData.filter((item: any) => {
        const { name } = data;
        const {
          name: itemName,
        } = item;
        if (name === 'Policy Name') {
          return itemName && name.toLowerCase().indexOf(inputValue) !== -1;
        }
        return false;
      });

      data.searchIcon = 'close';
    } else {
      this.listOfDisplayData = this.listOfData;
      data.searchIcon = 'search';
    }
  }
  loadPolicyListFields() {
    this.fields = [
      {
        fieldGroup: [
          {
            key: 'name',
            type: 'input',
            wrappers: ['formly-vertical-theme-wrapper'],
            defaultValue: '',
            props: {
              label: 'Policy Name',
              placeholder: 'Policy Name...',
              required: true,
            },
          },
        ],
      },
      {
        fieldGroup: [
          {
            key: 'menuthemeid',
            type: 'select',
            wrappers: ["formly-vertical-theme-wrapper"],
            defaultValue: '',
            props: {
              label: 'Menu Theme',
              additionalProperties: {
                allowClear: true,
                serveSearch: false,
                showArrow: true,
                showSearch: true,
              },
              options: this.themeList,
            }
          }
        ]
      },
      {
        fieldGroup: [
          {
            key: 'applicationtheme',
            type: 'select',
            wrappers: ["formly-vertical-theme-wrapper"],
            defaultValue: '',
            props: {
              label: 'Application Theme',
              additionalProperties: {
                allowClear: true,
                serveSearch: false,
                showArrow: true,
                showSearch: true,
              },
              options: this.applicationThemeList,
            }
          }
        ]
      },
    ];
  }
  handlePageChange(event: number): void {
    this.pageSize = !this.pageSize || this.pageSize < 1 ? 1 : this.pageSize
    this.pageIndex = event;
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.startIndex = start == 0 ? 1 : ((this.pageIndex * this.pageSize) - this.pageSize) + 1;
    this.listOfDisplayData = this.listOfData.slice(start, end);
    this.endIndex = this.listOfDisplayData.length != this.pageSize ? this.listOfData.length : this.pageIndex * this.pageSize;
  }

  getTheme() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('MenuTheme', '2001');
    this.dataSharedService.saveDebugLog('getTheme',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.themeList = res.data.map((item: any) => ({
              label: item.name,
              value: item.id
            }));
            this.loadPolicyListFields();
          } else
            this.toastr.error(res.message, { nzDuration: 3000 });
        }

      }, error: (error) => {
        this.toastr.error(JSON.stringify(error), { nzDuration: 3000 });
      }
    });
  }
  getApplicationTheme() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('applicationTheme', '2001');
    this.dataSharedService.saveDebugLog('getApplicationTheme',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.applicationThemeList = res.data.map((item: any) => ({
              label: item.name,
              value: item.id
            }));
            this.loadPolicyListFields();
          } else
            this.toastr.error(res.message, { nzDuration: 3000 });
        }
      }, error: (error) => {
        this.toastr.error(JSON.stringify(error), { nzDuration: 3000 });
      }
    });
  }
}