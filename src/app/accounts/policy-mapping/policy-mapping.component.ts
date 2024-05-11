import { Component, OnInit } from '@angular/core';
import { NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { from } from 'rxjs';
@Component({
  selector: 'st-policy-mapping',
  templateUrl: './policy-mapping.component.html',
  styleUrls: ['./policy-mapping.component.scss']
})
export class PolicyMappingComponent implements OnInit {

  paginatedData: any[] = [];
  modelId: any;
  isSubmit: boolean = false;
  breadCrumbItems!: Array<{}>;
  menuOfDisplayData: any[] = [];
  loading = false;
  searchValue = '';
  pageSize = 10;
  searchIcon = "search";
  pageIndex: any = 1;
  totalItems: number = 0; // Total number of items
  startIndex = 1;
  endIndex: any = 10;

  //detail
  menuList: any[] = [];
  policyMenuList: any;
  applicationMenuList: any[] = [];
  currentUser: any;
  applications: any;
  applicationName: any;
  selectedAppId: any = "";
  applicationid: string = '';
  selectDepartmentName: any = [];
  departmentData: any = [];
  departments: any[] = [];
  saveLoader: boolean = false;
  actionList: any[] = [];
  listOfColumns = [
    {
      name: 'Expand',
      key: 'expand',
      inVisible: true,
      dataField: 'expand',
      isColumnHide: false
    },
    {
      name: 'Menu Name',
      key: 'title',
      searchValue: '',
      inVisible: false,
      dataField: 'title',
      isColumnHide: false
    },
    {
      name: 'Create',
      searchValue: '',
      inVisible: true,
      dataField: 'creates',
      isColumnHide: false
    },
    {
      name: 'Read',
      searchValue: '',
      inVisible: true,
      dataField: 'reades',
      isColumnHide: false
    },
    {
      name: 'Update',
      searchValue: '',
      inVisible: true,
      dataField: 'updates',
      isColumnHide: false
    },
    {
      name: 'Delete',
      searchValue: '',
      inVisible: true,
      dataField: 'deletes',
      isColumnHide: false
    },
    {
      name: 'Hide',
      searchValue: '',
      inVisible: true,
      dataField: 'hideExpression',
      isColumnHide: false
    },
  ];
  flattenedArray: any[] = [];

  constructor(
    private socketService: SocketService,
    public dataSharedService: DataSharedService,
    private toastr: NzMessageService,
    private modalService: NzModalService,
  ) {
  }
  ngOnInit(): void {
    this.totalItems = this.menuOfDisplayData.length;
    this.breadCrumbItems = [
      { label: 'Formly' },
      { label: 'Pages', active: true }
    ];
    this.jsonPolicyModuleList();
    this.getDepartments();
    this.currentUser = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
  }
  policyName = '';
  policyList: any = [];
  jsonPolicyModuleList() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('Policy', '2001');
    this.socketService.Request(jsonData);
    this.dataSharedService.saveDebugLog('jsonPolicyModuleList',newGuid)
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res?.data.length > 0) {
              this.policyList = res.data;
            }
          }
        }
      },
      error: (err) => {
        this.toastr.error(`Policy : An error occured`, { nzDuration: 3000 });
      },
    });
  }

  onSubmit() {
    debugger
    if (!this.policyName) {
      this.toastr.warning(
        'Please Select Policy Name',
        { nzDuration: 2000 }
      );
      return;
    } else {
      if (this.menuList.length == 0) {
        this.toastr.warning(
          'Please Select Menu',
          { nzDuration: 2000 }
        );
        return;
      }
      this.mergeChildren(this.menuList);
      const filteredData = this.findObjectsWithPermissions(this.menuList);

      const jsont = { json: filteredData }
      const jsonData = {
        data: JSON.stringify(jsont),
        policyid: this.policyName,
        applicationid: this.applicationid,
      }
      const newData = filteredData.map(item => ({
        ...item,
        policyid: this.policyName,
        applicationid: this.applicationid,
      }));
      var ResponseGuid: any;
      if (this.isSubmit) {
        const { newGuid, metainfocreate } = this.socketService.metainfocreate();
        ResponseGuid = newGuid;
        const Add = { [`policymapping`]: jsonData, metaInfo: metainfocreate }
        this.dataSharedService.saveDebugLog('policymappingAdd',newGuid)
        this.socketService.Request(Add);
      }
      else {
        const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(this.modelId);
        ResponseGuid = newUGuid;
        const Update = { [`policymapping`]: jsonData, metaInfo: metainfoupdate };
        this.dataSharedService.saveDebugLog('policymappingUpdate',newUGuid)
        this.socketService.Request(Update)
      }
      this.loading = true;
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == ResponseGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.loading = false;
            if (res.isSuccess) {
              // this.getPolicyMenu();
              this.policyMenuList = [];
              this.flattenedArray = [];
              this.policyMenuList = res.data.length > 0 ? res.data[0].data.json || [] : [];
              this.modelId = res.data.length > 0 ? res.data[0].id : '';
              this.isSubmit = res.data.length > 0 ? false : true;
              if (this.policyMenuList.length > 0) {
                let nonReferenceData = JSON.parse(JSON.stringify(this.policyMenuList));
                let nonRelationalData: any = this.flattenArray(nonReferenceData);
                this.policyMenuList = nonRelationalData
              }
              this.updatedMenuList();
              this.toastr.success(res.message, { nzDuration: 3000 });
            } else {
              this.toastr.error(res.message, { nzDuration: 3000 });
            }
          }

        },
        error: (err) => {
          this.loading = false;
          this.toastr.error(`${err.error.message}`, { nzDuration: 3000 });
        },
      });
    }
  }

  findObjectsWithPermissions(data: any[]): any[] {
    const result: any[] = [];
    for (const item of data) {
      if (item.creates || item.updates || item.reades || item.deletes) {
        if (typeof item?.children?.json != 'object') {
          const checkMenu = item?.children?.json?.find((a: any) => a.sqlType == "sql");
          if (checkMenu) {
            const updatedMenu = item?.children?.json?.filter((a: any) => a.isAllow == true);
            item.children.json = updatedMenu;
            result.push(item);
          } else {
            const updatedMenu = JSON.parse(JSON.stringify(item));
            updatedMenu.children.json = [];
            result.push(updatedMenu);
          }
        }
        else {
          const updatedMenu = JSON.parse(JSON.stringify(item));
          updatedMenu.children.json = [];
          result.push(updatedMenu);
        }


      }

      if (item.children && item.children?.json?.length > 0) {
        const childResults = this.findObjectsWithPermissions(item.children?.json);
        result.push(...childResults);
      }
    }
    return result;
  }

// policyMapping Commit
policyMappingCommit() {
  this.loading = true;
  const { jsonData, newGuid } = this.socketService.makeJsonData('policymappingcommit', '2001');
  this.socketService.Request(jsonData);
  this.dataSharedService.saveDebugLog('policyMappingCommit',newGuid)
  this.socketService.OnResponseMessage().subscribe({
    next: (res: any) => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          this.loading = false;
          this.toastr.success(`Policy Mapping: ${res.message}`, { nzDuration: 3000 });
        } else {
          this.toastr.error(`Policy Mapping : ${res.message}`, { nzDuration: 3000 });
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

  downloadJson() {
    let obj = Object.assign({}, this.menuList);
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'file.';
    document.body.appendChild(a);
    a.click();
  }

  handlePageChange(event: number): void {
    this.pageSize = !this.pageSize || this.pageSize < 1 ? 1 : this.pageSize
    this.pageIndex = event;
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.startIndex = start == 0 ? 1 : ((this.pageIndex * this.pageSize) - this.pageSize) + 1;
    this.menuOfDisplayData = this.menuList.slice(start, end);
    this.endIndex = this.menuOfDisplayData.length != this.pageSize ? this.menuList.length : this.pageIndex * this.pageSize;
  }


  onDepartmentChange(departmentId: any) {
    if (departmentId.length === 2) {
      if (departmentId[1] != 'selectApplication') {
        this.selectedAppId = departmentId[1];
        this.getMenus(departmentId[1]);
        this.getActions(departmentId[1]);
      }
    }
    else if (departmentId.length === 1) {
      const selectedNode = this.departmentData.find((a: any) => a.value == departmentId[0]);
      if (selectedNode.children && selectedNode?.children?.length > 0) {
        selectedNode.children = [];
        this.loadData(selectedNode, 0);
      }
    }
  }
  async loadData(node: NzCascaderOption, index: number): Promise<void> {
    if (index === 0 && node.value !== 'selectDepartment') {
      try {
        const { jsonData, newGuid } = this.socketService.makeJsonDataById('Application', node.value, '2002');
        this.dataSharedService.saveDebugLog('loadData',newGuid)
        this.socketService.Request(jsonData);
  
        const response:any = await new Promise((resolve, reject) => {
          const subscription = this.socketService.OnResponseMessage().subscribe(
            (data: any) => {
              subscription.unsubscribe();
              resolve(data);
            },
            (error: any) => {
              subscription.unsubscribe();
              reject(error);
            }
          );
        });
  
        if (response.parseddata.requestId == newGuid && response.parseddata.isSuccess) {
          const res = response.parseddata.apidata;
          if (res.isSuccess) {
            this.applications = res.data;
            const applications = res.data.map((appData: any) => ({
              label: appData.name,
              value: appData.id,
              isLeaf: true,
            }));
  
            let header = {
              label: 'Select Application',
              value: 'selectApplication',
            };
            applications.unshift(header);
            node.children = applications;
          } else {
            this.toastr.error(res.message, { nzDuration: 3000 });
          }
        }
      } catch (err) {
        console.error('Error loading screen data:', err);
        this.toastr.error('An error occurred while loading screen data', { nzDuration: 3000 });
      }
    }
  }
  
  getDepartments() {
    const { jsonData, newGuid } = this.socketService.makeJsonData('Department', '2001');
    this.dataSharedService.saveDebugLog('getDepartments',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res.data.length > 0) {
              this.departments = res.data;
              this.departmentData = res.data?.map((data: any) => {
                return {
                  label: data.name,
                  value: data.id
                };
              });
              // const data = this.departmentData.filter((item: any) => item.label === 'Customer Relation');

              // this.departmentData = data;
              let header = {
                label: 'Select Department',
                value: 'selectDepartment'
              }
              this.departmentData.unshift(header)
            }
            else {
              this.departments = [];
              this.departmentData = [];
            }
          }
          else
            this.toastr.error(res.message, { nzDuration: 3000 }); // Show an error message to the user
        }

      },
      error: (err) => {
        console.error(err); // Log the error to the console
        this.toastr.error("An error occurred", { nzDuration: 3000 }); // Show an error message to the user
      }
    });
  };


  getMenus(id: any) {
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('Menu', id, '2002');
    this.dataSharedService.saveDebugLog('getMenus',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(((res: any) => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          if (res.data.length > 0) {
            this.applicationid = res.data[0].applicationid
            const menuList = res.data[0].menudata?.json;
            const booleanObject = {
              creates: false,
              reades: false,
              updates: false,
              deletes: false,
            };

            const newData = this.applyBooleanToArray(menuList, booleanObject);
            console.log(newData);
            this.applicationMenuList = newData;
          } else {
            this.toastr.warning('No menu againts this', { nzDuration: 3000 });
          }
        } else
          this.toastr.error(res.message, { nzDuration: 3000 });
      }

    }));
  }
  getActions(id: any) {
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('Actionss', id, '2002');
    this.dataSharedService.saveDebugLog('getActions',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(((res: any) => {
      if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        if (res.isSuccess) {
          if (res.data.length > 0) {
            const actionList = res.data;
            const booleanObject = {
              isAllow: false,
            };
            const newData = this.applyActionBooleanToArray(actionList, booleanObject);
            // console.log(newData);
            this.actionList = newData;
          } else {
            this.toastr.warning('No menu againts this', { nzDuration: 3000 });
          }
        } else
          this.toastr.error(res.message, { nzDuration: 3000 });
      }
    }));
  }
  applyActionBooleanToArray(data: any[], booleanObject: any): any[] {
    return data.map((item: any) => {
      const newData = {
        ...item,
        ...booleanObject,
        // expand: false,
      };
      return newData;
    });
  }
  applyBooleanToArray(data: any[], booleanObject: any): any[] {
    return data.map((item: any) => this.applyBooleanToObject(item, booleanObject));
  }
  applyBooleanToObject(data: any, booleanObject: any): any {
    // Apply the booleanObject to the current object
    const newData = {
      ...data,
      ...booleanObject,
      screenId: data.link,
      menuId: data.id,
      expand: false,
    };

    if (data.children && data.children.length > 0) {
      // If the current object has children, apply the booleanObject recursively to each child
      newData.children = data.children.map((child: any) =>
        this.applyBooleanToObject(child, booleanObject)
      );
    }

    return newData;
  }
  getPolicyMenu() {
    if (!this.policyName) {
      this.toastr.error("Please select a policy name", { nzDuration: 3000 });
      return;
    }

    this.loading = true;
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('policymapping', this.policyName, '2002');
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe(
      (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.loading = false;
          this.policyMenuList = [];
          this.flattenedArray = [];
          this.policyMenuList = res.data.length > 0 ? res.data[0].data.json || [] : [];
          this.modelId = res.data.length > 0 ? res.data[0].id : '';
          this.isSubmit = res.data.length > 0 ? false : true;
          if (this.policyMenuList.length > 0) {
            let nonReferenceData = JSON.parse(JSON.stringify(this.policyMenuList));
            let nonRelationalData: any = this.flattenArray(nonReferenceData);
            this.policyMenuList = nonRelationalData
          }
          this.updatedMenuList();
        }
        (error: any) => {
          // Handle HTTP errors or errors from the observable
          console.error("API error:", error);
          this.toastr.error("An error occurred while fetching data from the server", { nzDuration: 3000 });
          this.loading = false;
        }

      }

    );
  }
  updatedMenuList() {
    let updatedData = this.applicationMenuList;
    // this.menuList = JSON.parse(JSON.stringify(updatedData));

    const updatedMenuData = this.mergePolicyIntoMenu(updatedData, this.policyMenuList);
    this.menuList = JSON.parse(JSON.stringify(updatedMenuData));

    // Iterate through obj2
    this.actionList.forEach(element => {
      for (let index = 0; index < this.menuList.length; index++) {
        const menu = this.menuList[index];
        if (menu.screenId === `/pages/${element.moduleId}`) {
          if (!menu.actionChildren) {
            menu.actionChildren = [];
            // Push obj1 object to children array
            menu.actionChildren.push(element);
            break;
          } else {
            const checkIsAlreadyExist = menu.children.find((a: any) => a._id == element._id);
            if (!checkIsAlreadyExist) {
              menu.actionChildren.push(element);
            }
            break;
          }
        }
      }
    });
    console.log(this.menuList);

    // this.handlePageChange(1);

  }
  // Define a function to merge policy data into menu data recursively
  mergePolicyIntoMenu(menuData: any[], policyData: any[]) {
    return menuData.map(menuItem => {
      const matchingPolicyItem = policyData.find(policyItem => policyItem.menuId === menuItem.menuId);

      if (matchingPolicyItem) {
        matchingPolicyItem.screenId = menuItem.link;
        matchingPolicyItem.title = menuItem.title;

        // Merge policy data into the menu item
        const mergedItem = { ...menuItem, ...matchingPolicyItem };

        // Check if the menu item has children and merge recursively
        if (menuItem.children && menuItem.children.length > 0) {
          mergedItem.children = this.mergePolicyIntoMenu(menuItem.children, policyData);
        } else {

        }

        return mergedItem;
      }

      return menuItem; // No policy data found, return menu item as is
    });
  }

  // Call the function to merge policy data into menu data

  // updatedMenuData now contains the merged data

  deleteAllPolicy() {
    if (!this.policyName) {
      this.toastr.warning('Please Select Policy Name', { nzDuration: 2000 });
      return;
    }
    if (this.menuList.length == 0) {
      this.toastr.warning('Please Select Menu', { nzDuration: 2000 });
      return;
    }
    this.modalService.confirm({
      nzTitle: 'Are you sure you want to delete all records?',
      nzClassName: 'custom-modal-class',
      nzCentered: true,
      nzOnOk: () => {
        new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 100);
          const { jsonData, newGuid } = this.socketService.makeJsonDataById('policymapping', this.policyName, '2002');
          this.socketService.Request(jsonData);
          this.dataSharedService.saveDebugLog('deleteAllPolicy',newGuid)
          this.socketService.OnResponseMessage().subscribe(
            {
              next: (res: any) => {
                if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
                  res = res.parseddata.apidata;
                  if (res.isSuccess) {
                    this.getPolicyMenu();
                    this.toastr.success(res.message, { nzDuration: 3000 });
                  } else {
                    this.toastr.error(res.message, { nzDuration: 3000 });
                  }
                }

              },
              error: (err) => {
                this.toastr.error(`${err.error.message}`, { nzDuration: 3000 });
              },
            }
          )
        })
          .catch(() => false)
      },
      nzOnCancel: () => {
        // this.navigation = this.previousscreenid ? this.previousscreenid : this.navigation;
        console.log('User clicked Cancel');
      }
    });
  }
  selectAll() {
    // Update parent values
    if (this.menuOfDisplayData.length > 0) {
      const updatedDat = this.menuOfDisplayData.map((item) => ({
        ...item,
        creates: true,
        updates: true,
        reades: true,
        deletes: true,
        children: this.updateChildren(item.children),
        actionChildren: this.updateChildren(item.actionChildren),
      }));
      this.menuOfDisplayData = updatedDat;
    }

    if (this.menuList) {
      // Update child values
      const updatedData = this.menuList.map((parentItem) => ({
        ...parentItem,
        creates: true,
        updates: true,
        reades: true,
        deletes: true,
        children: this.updateChildren(parentItem.children),
        actionChildren: this.updateChildren(parentItem.actionChildren),
      }));
      this.menuList = updatedData;
    }

  }

  updateChildren(children: any[]): any[] {
    if (!children || !children.length) {
      return [];
    }

    return children.map((childItem) => {
      if (childItem?.actionType) {
        return {
          ...childItem,
          children: this.updateChildren(childItem.children),
        };
      } else {
        return {
          ...childItem,
          creates: true,
          updates: true,
          reades: true,
          deletes: true,
          children: this.updateChildren(childItem.children),
        };
      }
    });
  }
  mergeChildren(items: any[]) {
    items.forEach(item => {
      if (item.children && item.actionChildren) {
        // Merge the two arrays into a new children array
        item.children = [...item.children, ...item.actionChildren];
        // Remove the actionChildren property
        delete item.actionChildren;
      }

      // Recursively call mergeChildren for nested structures
      if (item.children && item.children.length > 0) {
        this.mergeChildren(item.children);
      }
    });
  }
  private flattenArray(inputArray: any[]): any[] {
    const flattenedArray = [];
    const stack = [...inputArray];

    while (stack.length > 0) {
      const item = stack.pop();
      flattenedArray.push(item);

      if (item.children && item.children.length > 0) {
        stack.push(...item.children.reverse());
      }
    }

    return flattenedArray;
  }
}