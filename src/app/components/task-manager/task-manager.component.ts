import { Component, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, Subscription } from 'rxjs';
import { ElementData } from 'src/app/models/element';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.scss']
})
export class TaskManagerComponent {
  addSection: boolean = false;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() taskManagerData: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() mappingId: any;
  requestSubscription: Subscription;
  saveLoader: boolean = false;
  drawerLoader: boolean = false;
  visible: boolean = false;
  addSubtask: boolean = false;
  editData: any = {};
  drawerData: any = {
    "id": '',
    "parentid": '',
    "task": '',
    "date": '',
    "assignee": '',
    "data": []
  }

  subTask: any = {
    "task": '',
    "date": '',
    "assignee": '',
    "parentid": '',
  }
  subTaskEditId: any = '';
  afterDrawerDataGet: boolean = false;
  comments: any = [];
  parentId: any;
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  constructor(public _dataSharedService: DataSharedService, private toastr: NzMessageService,
    public dataSharedService: DataSharedService,
  ) {
    this.processData = this.processData.bind(this);
    const recallData = this.dataSharedService.callDataIntaskManager.subscribe(res => {
      if (res) {
        this.recallApi();
        this.addSection = false;
        this.addSection = false;
      }
    });
    this.subscriptions.add(recallData);
  }
  ngOnInit() {
    if (this.taskManagerData?.eventActionconfig) {
      this.saveLoader = true
    } else {
      this.saveLoader = false
    }
  }

  listOfDisplayData: any = []
  showAddTask(item: any) {
    item['addTask'] = true
  }
  expand(item: any, head: any) {
    item['expand'] = !item['expand'];
    this.applyDefaultValue();
    // Adding a delay of 500 milliseconds (adjust the delay as needed)
    if (item['expand']) {
      setTimeout(() => {
        this.makeModel(item.id);
        this.dataSharedService.updateModel.next(this.formlyModel)
      }, 100);
    }

    if (head.callApi && item['expand']) {
      let pagination = '';
      let { _id, actionLink, data, headers, parentId, page, pageSize } = this.taskManagerData.eventActionconfig;
      if (page && pageSize) {
        pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
      }
      this.saveLoader = true;
      let itemIdString: string | undefined = item?.id;
      parentId = itemIdString ? parseInt(itemIdString, 10) : 0;
      if (parentId) {
        let url = head.callApi + '/' + parentId;
        // this.requestSubscription = this.applicationService.callApi(`${url}${pagination}`, 'get', data, headers, null).subscribe({
        //   next: (res) => {
        //     this.saveLoader = false;
        //     item['children'] = res.data.map((item: any) => ({ "expand": false, ...item }));
        //   },
        //   error: (error: any) => {
        //     console.error(error);
        //     this.saveLoader = false;
        //     this.toastr.error("An error occurred", { nzDuration: 3000 });
        //   }
        // })
      }
    }
  }

  makeModel(event: any) {
    let newModel = JSON.parse(JSON.stringify(this.formlyModel));
    if (newModel) {
      for (const key in newModel) {
        if (newModel.hasOwnProperty(key)) {
          if (typeof newModel[key] === 'object') {
            newModel[key]['parentid'] = event
          }
          else {
            if (key.includes('parentid')) {
              newModel[key] = event;
            }
          }
        }
      }
    }
    this.formlyModel = newModel;
  }
  processData(res: any) {
    this.saveLoader = false
    if (res) {
      if (res.data.length > 0) {
        this.getFromQueryOnlyTable(res);
      }
    }
    return res;
  }
  getFromQueryOnlyTable(res: any) {
    this.listOfDisplayData = res.data.map((item: any) => ({ "expand": false, ...item }));
    this.taskManagerData['tableHeaders'] = this.taskManagerData['tableHeaders'] ? this.taskManagerData['tableHeaders'] : [];
    if (this.taskManagerData['tableHeaders'].length === 0) {
      this.taskManagerData['tableHeaders'] = Object.keys(this.listOfDisplayData[0] || {}).map(key => ({ name: key, key: key }));
    } else {
      const tableKey = Object.keys(this.listOfDisplayData[0] || {}).map(key => ({ name: key }));
      const updatedData = tableKey.filter(updatedItem =>
        !this.taskManagerData['tableHeaders'].some((headerItem: any) => headerItem.key === updatedItem.name)
      );
      if (updatedData.length > 0) {
        updatedData.forEach(updatedItem => {
          this.taskManagerData['tableHeaders'].push({ id: this.taskManagerData.tableHeaders.length + 1, key: updatedItem.name, name: updatedItem.name, });
        });
      }
    }

    const hasExpandKey = this.taskManagerData['tableHeaders'].some((head: any) => head.key === 'expand');
    if (!hasExpandKey) {
      this.taskManagerData['tableHeaders'].unshift({
        'name': 'expand',
        'key': 'expand',
      });
    }
  }
  addSectionFunc() {
    debugger
    this.addSection = true;
    this.applyDefaultValue();
    this.dataSharedService.updateModel.next(this.formlyModel)
    this.makeModel('');
  }
  close() {
    this.visible = false;
    if (this.afterDrawerDataGet) {
      this.recallApi();
    }
  }
  tdFunc(head: any, item: any, child?: any) {
    debugger
    if (head?.drawer || child) {
      this.mappingId = item?.id;
      if (child == undefined) {
        this.visible = true;
      }
      // this.drawerData['id'] = item?.id;
      // this.drawerData['task'] = item?.task;
      this.drawerData = item;
      this.drawerData['parentid'] = item?.id;
      this.formlyModel['ticketcomments.spectrumissueid'] = item?.id;
      this.dataSharedService.updateModel.next(this.formlyModel)
      this.drawerData = { ...this.drawerData, 'data': [] };
      // this.drawerData['date'] = item?.date;
      // this.drawerData['assignee'] = item?.assignee;

      if (head.callApi) {
        this.recallApiWithId(head.callApi, item.id);
      }
      if (child) {
        let drawerHead = this.taskManagerData.find((header: any) => header?.drawer && header.callApi);
        if (drawerHead) {
          this.recallApiWithId(drawerHead.callApi, item.id);
        }
      }
      this.getComments();
    }
  }
  applyDefaultValue() {
    const filteredNodes = this.filterInputElements(this.taskManagerData.children);
    const newMode = filteredNodes.reduce((acc, node) => {
      const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.defaultValue;
      let formlyKey = node?.formly?.[0]?.fieldGroup?.[0]?.key;
      acc[formlyKey] = formlyConfig;
      return acc;
    }, {});

    this.formlyModel = newMode;
  }
  filterInputElements(data: ElementData[]): any[] {
    const inputElements: ElementData[] = [];
    const visited = new Set(); // To keep track of visited objects

    function traverse(obj: any): void {
      if (visited.has(obj)) return; // If the object is visited, return to prevent infinite loop
      visited.add(obj); // Mark the current object as visited

      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          traverse(item);
        });
      } else if (typeof obj === 'object' && obj !== null) {
        if (obj.formlyType === 'input') {
          inputElements.push(obj);
        }
        Object.values(obj).forEach((value) => {
          traverse(value);
        });
      }
    }

    traverse(data);
    return inputElements;
  }
  addSubTask() {
    this.addSubtask = true;
  }
  save() {
    debugger
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    if (!checkPermission?.creates && this.dataSharedService?.currentMenuLink !== '/ourbuilder') {
      this.toastr.warning("You do not have permission", { nzDuration: 3000 });
      return;
    }
    const postEvent = this.taskManagerData.appConfigurableEvent.find((item: any) => item.rule.includes('post_'));

    const filteredNodes = this.filterInputElements(this.taskManagerData.children);
    if (filteredNodes == undefined) {
      return;
    }

    let actionID = postEvent._id;
    this.drawerLoader = true;
    if (actionID && postEvent && this.addSubtask) {
      let saveData: any = {};
      this.subTask['parentid'] = this.drawerData.parentid;
      if (filteredNodes[0].key.includes('.')) {
        let tableName = filteredNodes[0].key.split('.')[0];
        for (const key in this.subTask) {
          saveData[`${tableName}.${key}`] = this.subTask[key];
        }
      }

      const model: any = {
        screenId: this.screenId,
        postType: 'post',
        modalData: saveData
      };
      // this.applicationServices.addNestCommonAPI('knex-query/execute-rules/' + actionID, model).subscribe({
      //   next: (res) => {
      //     this.drawerLoader = false;
      //     if (res[0]?.error) {
      //       this.toastr.error(res[0]?.error, { nzDuration: 3000 });
      //       return;
      //     }
      //     this.toastr.success('Save Successfully', { nzDuration: 3000 });
      //     // let newObj: any = {};
      //     // for (let key in res[0]) {
      //     //   let newKey = key.split('.')[1];
      //     //   newObj[newKey] = res[0][key];
      //     // }
      //     // this.drawerData.data.push(newObj);
      //     for (const key in this.subTask) {
      //       this.subTask[key] = '';
      //     }
      //     let findApi = this.taskManagerData.tableHeaders.find((head: any) => head?.callApi && head?.drawer);
      //     if (findApi) {
      //       this.recallApiWithId(`${findApi.callApi}`, this.drawerData.id);
      //     }
      //     this.afterDrawerDataGet = true;
      //     this.addSubtask = false;
      //   },
      //   error: (err) => {
      //     // Handle the error
      //     this.toastr.error("An error occurred", { nzDuration: 3000 });
      //     console.error(err);
      //     this.drawerLoader = false; // Ensure to set the loader to false in case of error
      //   },
      // });
    }
  }
  formatDate(event: any) {
    this.drawerData.date = event.toISOString();
  }
  updateTask() {
    let updatedData: any = JSON.parse(JSON.stringify(this.drawerData));
    delete updatedData.data;
    this.afterDrawerDataGet = true;
    this.saveInlineEdit(updatedData)
    // const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    // if (!checkPermission?.create && this.dataSharedService?.currentMenuLink !== '/ourbuilder') {
    //   this.toastr.warning("You do not have permission", { nzDuration: 3000 });
    //   return;
    // }

    // const filteredNodes = this.filterInputElements(this.taskManagerData.children);
    // if (filteredNodes == undefined) {
    //   return;
    // }
    // const putEvent = this.taskManagerData.appConfigurableEvent.find((item: any) => item.rule.includes('put_'));
    // if (putEvent) {
    //   let updatedDrawerData = JSON.parse(JSON.stringify(this.drawerData));
    //   delete updatedDrawerData.data;
    //   let saveData: any = {};
    //   if (filteredNodes[0].key.includes('.')) {
    //     let tableName = filteredNodes[0].key.split('.')[0];
    //     saveData[`${tableName}.id`] = updatedDrawerData['id'];
    //     for (const key in updatedDrawerData) {
    //       saveData[`${tableName}.${key}`] = updatedDrawerData[key];
    //     }
    //   }
    //   const model: any = {
    //     screenId: this.screenId,
    //     postType: 'put',
    //     modalData: saveData
    //   };
    //   this.applicationServices.addNestCommonAPI('knex-query/execute-rules/' + putEvent._id, model).subscribe({
    //     next: (res) => {
    //       this.drawerLoader = false;
    //       if (res[0]?.error) {
    //         this.toastr.error(res[0]?.error, { nzDuration: 3000 });
    //         return;
    //       }
    //       const successMessage = (model.postType === 'post') ? 'Save Successfully' : 'Update Successfully';
    //       this.toastr.success(successMessage, { nzDuration: 3000 });
    //       if (model.postType === 'put' && !res?.isSuccess) {
    //         this.toastr.error(res.message, { nzDuration: 3000 });
    //         return;
    //       }
    //     },
    //     error: (err) => {
    //       // Handle the error
    //       this.toastr.error("An error occurred", { nzDuration: 3000 });
    //       console.error(err);
    //       this.drawerLoader = false; // Ensure to set the loader to false in case of error
    //     },
    //   });
    // }
  }
  edit(item: any) {
    this.subTaskEditId = item.id;
    this.editData = JSON.parse(JSON.stringify(item))
  }

  saveInlineEdit(dataModel: any) {
    let newDataModel = JSON.parse(JSON.stringify(dataModel))
    const putEvent = this.taskManagerData.appConfigurableEvent.find((item: any) => item.rule.includes('put_'));
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.updates && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }

    if (putEvent) {
      if (JSON.stringify(dataModel) != JSON.stringify(this.editData)) {
        if (newDataModel) {
          for (let key in newDataModel) {
            if (newDataModel[key] && Array.isArray(newDataModel[key])) {
              delete newDataModel[key];
            } else if (newDataModel[key] == null) {
              newDataModel[key] = ''
            }
            else if (newDataModel[key] == 'null') {
              newDataModel[key] = ''
            }
          }
          const model = {
            screenId: this.screenName,
            postType: 'put',
            modalData: newDataModel
          };

          let url = putEvent?._id ? `knex-query/executeDelete-rules/${putEvent?._id}` : '';
          if (url) {
            this.drawerLoader = true;
            // this.requestSubscription = this.applicationServices.addNestCommonAPI(url, model).subscribe({
            //   next: (res) => {
            //     if (res.isSuccess) {
            //       this.toastr.success('Update Successfully', { nzDuration: 3000 });
            //       this.subTaskEditId = null;
            //       this.editData = null;
            //     }
            //     else {
            //       this.toastr.warning(res.message, { nzDuration: 3000 });
            //     }
            //     this.drawerLoader = false;
            //   },
            //   error: (err) => {
            //     console.error(err);
            //     this.toastr.error('An error occurred', { nzDuration: 3000 });
            //     this.drawerLoader = false;
            //   }
            // });
          }
        }
      } else {
        this.toastr.warning('Please change the data for update', { nzDuration: 3000 });
      }
    }
    else {
      this.toastr.warning('There is no rule against this', { nzDuration: 3000 });
    }
  }
  cancelEdit(item: any) {
    for (const key in this.editData) {
      item[key] = this.editData[key]
    }
    this.subTaskEditId = null;
    this.editData = null;
  }
  ngOnDestroy(): void {
    try {
      if (this.requestSubscription) {
        this.requestSubscription.unsubscribe();
      }

      if (this.subscriptions) {
        this.subscriptions.unsubscribe();
      }

      this.destroy$.next();
      this.destroy$.complete();
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }
  recallApi() {
    const { _id, actionLink, data, headers, parentId, page, pageSize } = this.taskManagerData.eventActionconfig;
    if (_id) {
      let pagination = ''
      if (page && pageSize) {
        pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
      }
      this.saveLoader = true;
      let url = `knex-query/getexecute-rules/${_id}`;
      // if (this.mappingId) {
      //   url = `knex-query/getexecute-rules/${_id}/${this.mappingId}`
      // }
      // this.requestSubscription = this.applicationService.callApi(`${url}${pagination}`, 'get', data, headers).subscribe({
      //   next: (res) => {
      //     this.saveLoader = false;
      //     this.afterDrawerDataGet = false;
      //     if (res) {
      //       if (res.data.length > 0) {
      //         this.getFromQueryOnlyTable(res);
      //       }
      //     }
      //   },
      //   error: (error: any) => {
      //     console.error(error);
      //     this.saveLoader = false;
      //     this.afterDrawerDataGet = false;
      //     this.toastr.error("An error occurred", { nzDuration: 3000 });
      //   }
      // })
    }
  }
  recallApiWithId(api: any, id: any) {
    let pagination = '';
    let { _id, actionLink, data, headers, parentId, page, pageSize } = this.taskManagerData.eventActionconfig;
    if (page && pageSize) {
      pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
    }
    this.drawerLoader = true;
    let itemIdString: string | undefined = id;
    parentId = itemIdString ? parseInt(itemIdString, 10) : 0;
    // if (parentId) {
    //   let url = api + '/' + parentId;
    //   this.requestSubscription = this.applicationService.callApi(`${url}${pagination}`, 'get', data, headers, null).subscribe({
    //     next: (res) => {
    //       this.drawerLoader = false;
    //       this.drawerData = { ...this.drawerData, 'data': res.data };
    //       // this.drawerData.data = res.data;
    //     },
    //     error: (error: any) => {
    //       console.error(error);
    //       this.drawerLoader = false;
    //       this.toastr.error("An error occurred", { nzDuration: 3000 });
    //     }
    //   })
    // }
  }

  saveComments() {
    debugger
    let taskManagerComment = this.taskManagerData.children.find((child: any) => child.type == 'taskManagerComment');
    if (taskManagerComment) {
      const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
      if (!checkPermission?.creates && this.dataSharedService?.currentMenuLink !== '/ourbuilder') {
        this.toastr.warning("You do not have permission", { nzDuration: 3000 });
        return;
      }
      const postEvent = taskManagerComment.appConfigurableEvent.find((item: any) => item.rule.includes('post_'));
      if (!postEvent) {
        this.toastr.error("No action exist", { nzDuration: 3000 });
        return;
      }
      const oneModelData = this.convertModel(this.formlyModel);
      if (Object.keys(oneModelData).length === 0) return;

      for (const key in oneModelData) {
        if (oneModelData[key] === undefined || oneModelData[key] === null) {
          oneModelData[key] = '';
        }
      }
      const model: any = {
        screenId: this.screenId,
        postType: 'post',
        modalData: oneModelData
      };
      this.drawerLoader = true;
      // if (postEvent._id) {
      //   this.applicationServices.addNestCommonAPI('knex-query/execute-rules/' + postEvent._id, model).subscribe({
      //     next: (res) => {
      //       this.drawerLoader = false;
      //       if (res[0]?.error) {
      //         this.toastr.error(res[0]?.error, { nzDuration: 3000 });
      //         return;
      //       }
      //       this.toastr.success('Save Successfully', { nzDuration: 3000 });
      //       this.getComments();
      //     },
      //     error: (err) => {
      //       // Handle the error
      //       this.toastr.error("An error occurred", { nzDuration: 3000 });
      //       console.error(err);
      //       this.saveLoader = false; // Ensure to set the loader to false in case of error
      //     },
      //   });
      // }
    }
  }
  getComments() {
    let taskManagerComment = this.taskManagerData.children.find((child: any) => child.type == 'taskManagerComment');
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    if (!checkPermission?.creates && this.dataSharedService?.currentMenuLink !== '/ourbuilder') {
      this.toastr.warning("You do not have permission", { nzDuration: 3000 });
      return;
    }
    if (taskManagerComment.eventActionconfig) {
      // if (taskManagerComment.eventActionconfig._id) {
      //   this.drawerLoader = true;
      //   this.applicationServices.callApi('knex-query/getexecute-rules/' + taskManagerComment.eventActionconfig._id, 'get', '', '', this.mappingId).subscribe({
      //     next: (res) => {
      //       this.drawerLoader = false;
      //       if (res.isSuccess) {
      //         this.comments = res.data;
      //         this.toastr.success('Get Successfully', { nzDuration: 3000 });
      //       } else {
      //         this.toastr.success('Error occures in save', { nzDuration: 3000 });
      //       }
      //     },
      //     error: (err) => {
      //       // Handle the error
      //       this.toastr.error("An error occurred", { nzDuration: 3000 });
      //       console.error(err);
      //       this.saveLoader = false; // Ensure to set the loader to false in case of error
      //     },
      //   });
      // }
    }

  }
  convertModel(model: any, parentKey = "") {
    const convertedModel: any = {};
    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        const value = model[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
          convertedModel[newKey] = value;
        }
        else if (typeof value === 'object' && value !== null) {
          Object.assign(convertedModel, this.convertModel(value, newKey));
        }
        else {
          convertedModel[newKey] = value;
        }
      }
    }
    return convertedModel;
  }
  sortedArray: any[] = [];
  sortingData(headerData: any, sortingOrder: any) {
    // Check if the column header is already in the sortedArray
    const header = headerData.key
    const index = this.sortedArray.findIndex(item => item.key === header);
    headerData['isFilterdSortedColumn'] = true;
    if (index !== -1) {
      // Column is already in the sortedArray, toggle the sort order
      this.sortedArray[index].order = sortingOrder;
    }
    else {
      // Column is not in the sortedArray, add it with 'asc' order
      this.sortedArray.push({ key: header, order: 'asc' });
    }

    // Sort the dataArray based on the keys and order in sortedArray
    let data = this.listOfDisplayData;
    data.sort((a: any, b: any) => {
      for (const sortItem of this.sortedArray) {
        const order = sortItem.order;
        const key = sortItem.key;
        const result = this.customSort(a, b, key, order);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
    this.listOfDisplayData = [...data];
  }
  customSort(a: any, b: any, key: string, order: "asc" | "desc"): number {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA < valueB) {
      return order === "asc" ? -1 : 1; // Ascending or Descending
    }
    if (valueA > valueB) {
      return order === "asc" ? 1 : -1; // Ascending or Descending
    }
    return 0;
  }
}
