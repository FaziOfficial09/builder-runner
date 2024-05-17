import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, Optional } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { TreeNode } from 'src/app/models/treeNode';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { ref, string, date, any, number, object } from 'joi';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElementData } from 'src/app/models/element';
import { Location } from '@angular/common';
import { SocketService } from 'src/app/services/socket.service';
import * as Joi from 'joi';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {
  @Input() sections: any;
  @Input() isDrawer: boolean = false;
  @Input() mappingId: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() resData: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Output() traverseChangeEmit: EventEmitter<any> = new EventEmitter();
  @Output() sectionRepeatEmit: EventEmitter<any> = new EventEmitter();
  @Output() notify: EventEmitter<any> = new EventEmitter();
  requestSubscription: Subscription;
  dataModel: any = {};
  validationCheckStatus: any = [];
  setErrorToInput: any = [];
  @Input() joiValidationData: TreeNode[] = [];
  schemaValidation: any;
  ruleObj: any = {};
  ruleValidation: any = {};
  saveLoader: boolean = false;
  constructor(public dataSharedService: DataSharedService,
    private toasterService: ToasterService,
    private socketService: SocketService, private cd: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private router: Router, private location: Location) {
  }

  ngOnInit(): void {
    this.clearValues();
    this.screenName;
    this.requestSubscription = this.dataSharedService.sectionSubmit.subscribe({
      next: (res) => {
        if (res && this.dataSharedService.buttonData) {
          const checkButtonExist = this.findObjectById(this.sections, res?.buttonData?.id);
          if (checkButtonExist?.appConfigurableEvent) {
            this.mappingId = res.mappingId;
            // event?.stopPropagation();
            let makeModel: any = {};
            console.log('checkButtonExist?.detailSave : ' + checkButtonExist?.detailSave)
            if (checkButtonExist?.detailSave == true) {
            } else {
              this.formlyModel = this.dataSharedService.saveModel;
            }
            // const filteredNodes = this.filterInputElements(this.sections.children[1].children);
            // for (let item in this.formlyModel) {
            //   filteredNodes.forEach((element) => {
            //     if (item == element.formly[0].fieldGroup[0].key) {
            //       makeModel[item] = this.formlyModel[item]
            //     }
            //   });
            // }
            makeModel = this.formlyModel;
            this.dataModel = makeModel;
            if (Object.keys(makeModel).length > 0) {
              for (const key in this.dataModel) {
                if (this.dataModel.hasOwnProperty(key)) {
                  const value = this.getValueFromNestedObject(key, this.formlyModel);
                  if (value !== undefined) {
                    this.dataModel[key] = this.dataModel[key] ? this.dataModel[key] : value;
                  }
                }
              }
            }
            if (Object.keys(makeModel).length > 0) {
              this.dataModel = this.convertModel(this.formlyModel);
              const allUndefined = Object.values(this.formlyModel).every((value) => value === undefined);
              if (!allUndefined) {
                if (res?.buttonData?.isSubmit) {
                  this.joiValidation();
                  if (this.joiValidationData.length > 0) {
                    if (this.validationCheckStatus.length == 0) {
                      this.saveData(res?.buttonData);
                    }
                  } else {
                    this.saveData(res?.buttonData);
                  }
                }
              }

            }
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  getValueFromNestedObject(key: string, obj: any): any {
    const keys = key.split('.');
    let value = obj;
    for (const k of keys) {
      if (!value || !value.hasOwnProperty(k)) {
        return undefined;
      }
      value = value[k];
    }
    return value;
  }
  traverseAndChange(node: any, type: string) {
    let obj = {
      node: node,
      type: type
    }
    this.traverseChangeEmit.emit(obj);
  }
  sectionRepeat(data: any) {
    this.sectionRepeatEmit.emit(data);
  }
  isButtonIdExist(data: any[], targetId: string): boolean {
    for (const item of data) {
      if (item.type === 'button' && item.id === targetId) {
        return true;
      }
      if (item.children && item.children.length > 0) {
        if (this.isButtonIdExist(item.children, targetId)) {
          return true;
        }
      }
    }
    return false;
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
  saveData(data: any) {
    if (data?.detailSave) {
      let oneModelData = this.convertModel(this.dataModel);
      this.addDetailGrid(oneModelData, data);
    } else {
      this.sectionDataSave(data);
    }

  }

  handleAction(event: any, empData: any, data: any) {
    if (event) {
      this.dataSharedService.pagesLoader.next(true);
      this.saveLoader = false; // Set the loader to true when initiating the action

      const model = {
        screenId: this.screenName,
        postType: (event.rule.includes('post_')) ? 'post' : 'put',
        modalData: empData.modalData
      };
      this.dataSharedService.buttonData = '';

      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', event.arid);
      const jsonData1 = {
        postType: (event.rule.includes('post_')) ? 'post' : 'put',
        modalData: empData.modalData, metaInfo: jsonData.metaInfo
      };
      this.dataSharedService.saveDebugLog('HandleAction', RequestGuid)
      this.socketService.Request(jsonData1);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res) {
              try {
                if (res.isSuccess) {
                  this.toasterService.checkToaster(data, model.postType === 'put' ? 'update' : 'success');

                  let externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')) : null;
                  if (externalLogin) {
                    if (externalLogin?.login) {
                      externalLogin['submit'] = true;
                      this.dataSharedService.ecryptedValue('externalLogin', JSON.stringify(externalLogin), true);
                    }
                  }

                  if (data.saveRouteLink && data.saveredirect == '_blank' && this.dataSharedService.currentMenuLink !== '/ourbuilder' && (model.postType === 'post' || model.postType === 'put')) {
                    let tableName: any = '';
                    if (res?.[0]) {
                      tableName = res[0].tableName ? res[0].tableName.split('.')[1].split('_')[0] : '';
                    }

                    if (window.location.href.includes('addcustomclearanceFsy') || window.location.href.includes('addpif') || window.location.href.includes('addcar')
                      || window.location.href.includes('addapprovalrisk')) {
                      this.router.navigate(['/pages/' + data.saveRouteLink]).then(() => {
                        // Reload the entire application to re-render all components
                        this.location.replaceState('/pages/' + data.saveRouteLink);
                        if (!externalLogin?.login)
                          window.location.reload();
                      });
                    }
                    else {
                      let tableData = this.findObjectByTypeBase(this.sections, "gridList");
                      this.tempTableData = [];
                      if (tableData) {
                        tableData.tableData = [];
                        tableData.data = [];
                        tableData.targetId = '';
                        tableData.displayData = []
                      }
                      this.router.navigate(['/pages/' + data.saveRouteLink]);
                    }
                    return;
                  } else if (data.saveredirect == 'modal') {
                    this.dataSharedService.saveredirect.next(data)
                  }

                  if (model.postType === 'post') {

                    let tableName: any = '';
                    if (res[0]) {
                      tableName = res[0].tableName ? res[0].tableName.split('.')[1].split('_')[0] : '';
                    }
                    if (tableName) {
                      this.recursiveUpdate(this.formlyModel, tableName, res);
                    }
                    if (window.location.href.includes('spectrum.com')) {
                      this.dataSharedService.spectrumControlNull.next(true);
                    }
                  }
                  // else {
                  //   this.dataSharedService.gridDataLoad = true;
                  // }

                  this.dataSharedService.gridDataLoad = true;
                  this.dataSharedService.isSaveData = true;
                  let findCommentsDiv = this.findObjectByKey(this.sections, 'section_comments_drawer');
                  if (findCommentsDiv && this.mappingId) {
                    let mapApi = findCommentsDiv['mapApi'].includes(`/${this.mappingId}`) ? findCommentsDiv['mapApi'] : `${findCommentsDiv['mapApi']}/${this.mappingId}`;
                    let obj: any = {
                      control: findCommentsDiv,
                      mapApi: mapApi,
                      mappingId: this.mappingId
                    }
                    this.dataSharedService.commentsRecall.next(obj)
                  }
                  if (!this.isDrawer && model.postType != 'put') {
                    // this.dataSharedService.drawerClose.next(true);
                    // this.dataSharedService.drawerVisible = false;
                    this.setInternalValuesEmpty(this.dataModel);
                    this.setInternalValuesEmpty(this.formlyModel);
                    this.formlyModel = { ...this.formlyModel };
                    this.form.patchValue(this.formlyModel);
                    this.dataSharedService.refreshModel.next(this.formlyModel);

                    // this.dataSharedService.formlyShowError.next(false)
                    this.dataSharedService.formlyShowError.next(false)
                  }
                  this.dataSharedService.callDataIntaskManager.next(true);
                  this.getFromQuery(data);
                  if (window.location.href.includes('taskmanager.com')) {
                    this.dataSharedService.taskmanagerDrawer.next(true);
                  }
                } else {
                  this.toasterService.checkToaster(data, 'error');
                }
              } catch (innerErr) {
                this.toasterService.checkToaster(data, 'error');
                console.error(innerErr);
              }
              finally {
                this.dataSharedService.pagesLoader.next(false);
                this.saveLoader = false; // Always set the loader to false after processing the response
              }
            }
          }
        },
        error: (err) => {
          // Handle the error
          this.toasterService.checkToaster(data, 'error');
          console.error(err);
          this.dataSharedService.pagesLoader.next(false);
          this.saveLoader = false; // Ensure to set the loader to false in case of error
        },
      });
    }
  }

  sectionDataSave(data: any) {
    const buttonConfig = this.findObjectByKey(this.sections, data.key);

    if (!buttonConfig) return;

    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    const oneModelData = this.convertModel(this.dataModel);
    console.log(oneModelData)
    if (Object.keys(oneModelData).length === 0) return;

    const postEvent = data.appConfigurableEvent.find((item: any) => item.rule.includes('post_'));
    const putEvent = data.appConfigurableEvent.find((item: any) => item.rule.includes('put_'));
    if (!postEvent && !putEvent) {
      return
    }
    const empData = {
      screenId: this.screenName,
      modalData: oneModelData
    };
    for (const key in empData.modalData) {
      if (empData.modalData[key] === undefined || empData.modalData[key] === null) {
        empData.modalData[key] = '';
      }
    }


    let id = Object.keys(empData.modalData).find(
      key => empData.modalData.hasOwnProperty(key) && (key.endsWith('.id')) && empData.modalData[key]
    );
    if (this.tempTableData) {
      for (const key in this.tempTableData) {
        if (this.tempTableData.hasOwnProperty(key)) {
          const getDetailData = this.groupDataDetailTable(this.tempTableData[key]);
          empData.modalData[key] = getDetailData.data[getDetailData.tableName];
        }
      }

    }
    console.log(empData.modalData)
    id = data?.dataTable ? empData.modalData[data?.dataTable + '.id'] : id;
    if (id === undefined) {
      // if (!checkPermission?.creates && this.dataSharedService.currentMenuLink !== '/ourbuilder') {
      //   alert("You do not have permission");
      //   return;
      // }
      this.requestSubscription = this.activatedRoute.params.subscribe((params: Params) => {
        if (params["id"]) {
          for (const key in empData.modalData) {
            if (key.includes('id') && key != 'id') {
              empData.modalData[key] = params["id"];
            }
          }
        }
      });
      this.handleAction(postEvent, empData, data);

    } else {
      if (!checkPermission?.updates && this.dataSharedService?.currentMenuLink !== '/ourbuilder' && !(localStorage.getItem('externalLogin') || false)) {
        alert("You do not have permission");
        return;
      }

      this.handleAction(putEvent, empData, data);
    }
  }
  groupDataDetailTable(inputArray: any[]): any {
    const groupedData: any = {};
    let tableName: any = '';
    inputArray.forEach(item => {
      const getTableName = Object.keys(item)[0];
      const parts = getTableName.split('.');
      const itemT: any = {};
      const newKey1 = parts[0]; // Get the key before the dot
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const parts = key.split('.');
          itemT[parts[1]] = item[key];
        }
      }
      if (!groupedData[newKey1]) {
        groupedData[newKey1] = [];
      }
      groupedData[newKey1].push(itemT);
      tableName = newKey1;
    });
    const obj = {
      data: groupedData,
      tableName: tableName
    }
    return obj;
  }

  convertModel(model: any, parentKey = "") {
    const convertedModel: any = {};

    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        const value = model[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        // if (Array.isArray(value)) {
        //   convertedModel[newKey] = value.join(',');
        // }
        if (Array.isArray(value)) {
          convertedModel[newKey] = value.join(',');
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

  temporyGrid() {
    let tableData = this.findObjectByTypeBase(this.sections, "gridList");
    this.assignGridRules(tableData);
  }
  async getFromQuery(data: any) {
    let findClickApi = data?.appConfigurableEvent?.find((item: any) => item.rule.includes('get'))
    if (findClickApi) {
      // let url = `knex-query/getexecute-rules/${findClickApi.id}`;
      // url = this.mappingId ? `${url}/${this.mappingId}` : url;
      let tableData = this.findObjectByKey(this.sections, findClickApi.targetid);
      if (tableData) {
        let pagination: any = ''; let Rulepage = ''; let RulepageSize = '';
        if (tableData.serverSidePagination) {
          pagination = '?page=' + localStorage.getItem('tablePageNo') || 1 + '&pageSize=' + localStorage.getItem('tablePageSize') || 10;
          Rulepage = `${localStorage.getItem('tablePageNo') || 1}`;
          RulepageSize = `${localStorage.getItem('tablePageSize') || 10}`;
        }
        this.saveLoader = true;
        // let savedGroupData = await this.dataService.getNodes(JSON.parse(appid), this.screenName, "Table");
        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', findClickApi?.id, this.mappingId, Rulepage, RulepageSize, data);
        this.dataSharedService.saveDebugLog('getFromQuery', RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({

          next: async (res) => {
            this.saveLoader = false;
            if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              if (tableData && res?.isSuccess) {
                if (res.data.length > 0) {

                  if (window.location.href.includes('marketplace.com')) {
                    res.data = res.data.map((item: any) => ({
                      id: item.id, // Rename id to id
                      name: item.name,
                      categoryId: item.categoryId,
                      categoryName: item.categoryDetails?.[0]?.name, // Access the name property from categoryDetails
                      subcategoryId: item.subcategoryId,
                      subcategoryName: item.subcategoryDetails?.[0]?.name, // Access the name property from subcategoryDetails
                      thumbnailimage: item.thumbnailimage,
                      // ...rest
                    }));
                  }

                  let saveForm = JSON.parse(JSON.stringify(res.data[0]));
                  const firstObjectKeys = Object.keys(saveForm);
                  let tableKey = firstObjectKeys.map(key => ({ name: key }));
                  let obj = firstObjectKeys.map(key => ({ name: key, key: key }));
                  tableData.tableData = [];
                  saveForm.id = tableData.tableData.length + 1;
                  res.data.forEach((element: any) => {
                    element.id = (element?.id)?.toString();
                    tableData.tableData?.push(element);
                  });
                  // pagniation work start
                  if (!tableData.end) {
                    tableData.end = 10;
                  }
                  tableData.pageIndex = 1;
                  tableData.totalCount = res.count;
                  tableData['masteTotalCount'] = res.count;
                  tableData.serverApi = this.mappingId;
                  tableData.targetId = '';
                  tableData.displayData = tableData.tableData.length > tableData.end ? tableData.tableData.slice(0, tableData.end) : tableData.tableData;
                  // pagniation work end
                  if (!tableData?.tableHeaders) {
                    tableData.tableHeaders = obj;
                    tableData['tableKey'] = tableKey
                  }
                  if (tableData?.tableHeaders.length == 0) {
                    tableData.tableHeaders = obj;
                    tableData['tableKey'] = tableKey
                  }
                  else {
                    if (JSON.stringify(tableData['tableKey']) !== JSON.stringify(tableKey)) {
                      const updatedData = tableKey.filter(updatedItem =>
                        !tableData.tableHeaders.some((headerItem: any) => headerItem.key === updatedItem.name)
                      );
                      if (updatedData.length > 0) {
                        updatedData.forEach(updatedItem => {
                          tableData.tableHeaders.push({ id: tableData.tableHeaders.length + 1, key: updatedItem.name, name: updatedItem.name, });
                        });
                        tableData['tableKey'] = tableData.tableHeaders;
                      }
                    }
                  }

                  // Make DataType
                  let propertiesWithoutDataType = tableData.tableHeaders.filter((check: any) => !check.hasOwnProperty('dataType'));
                  if (propertiesWithoutDataType.length > 0) {
                    let formlyInputs = this.filterInputElements(this.sections.children[1].children);

                    if (formlyInputs && formlyInputs.length > 0) {
                      propertiesWithoutDataType.forEach((head: any) => {
                        let input = formlyInputs.find(a => a.formly[0].fieldGroup[0].key.includes('.') ? a.formly[0].fieldGroup[0].key.split('.')[1] == head.key : a.formly[0].fieldGroup[0].key == head.key);

                        if (input) {
                          head['dataType'] = input.formly[0].fieldGroup[0].type;
                          head['subDataType'] = input.formly[0].fieldGroup[0].props.type;
                          head['title'] = input.title;
                        }
                      });

                      tableData.tableHeaders = tableData.tableHeaders.concat(propertiesWithoutDataType.filter((item: any) => !tableData.tableHeaders.some((objItem: any) => objItem.key === item.key)));
                      // tableData.tableHeaders = obj;
                    }
                  }
                  let CheckKey = tableData.tableHeaders.find((head: any) => !head.key)
                  if (CheckKey) {
                    for (let i = 0; i < tableData.tableHeaders.length; i++) {
                      if (!tableData.tableHeaders[i].hasOwnProperty('key')) {
                        tableData.tableHeaders[i].key = tableData.tableHeaders[i].name;
                      }
                    }
                  }
                  // let getData = savedGroupData[savedGroupData.length - 1];
                  let getData: any = '';
                  if (getData?.data) {
                    if (getData.data.length > 0) {
                      let groupingArray: any = [];
                      let updateTableData: any = [];
                      getData.data.forEach((elem: any) => {
                        let findData = tableData.tableHeaders.find((item: any) => item.key == elem);
                        if (findData) {
                          updateTableData = this.groupedFunc(elem, 'add', findData, groupingArray, tableData.displayData, tableData.tableData, tableData.tableHeaders);
                        }
                      })
                      tableData.tableData = updateTableData;
                      tableData.displayData = tableData.tableData.length > tableData.end ? tableData.tableData.slice(0, tableData.end) : tableData.tableData;
                      tableData.tableHeaders.unshift({
                        name: 'expand',
                        key: 'expand',
                        title: 'Expand',
                      });
                      tableData.totalCount = tableData.tableData
                    } else {
                      // tableData.tableHeaders = tableData.tableHeaders.filter((head: any) => head.key != 'expand')
                    }

                  } else {
                    // tableData.tableHeaders = tableData.tableHeaders.filter((head: any) => head.key != 'expand')

                  }
                  tableData.pageIndex = 1;
                  if (tableData?.serverSidePagination) {
                    const start = (tableData.pageIndex - 1) * 10;
                    // const end = start + 10;
                    // this.start = start == 0 ? 1 : ((tableData.pageIndex * 10) - 10) + 1;
                    // this.end = this.displayData.length == tableData.end ? (tableData.pageIndex * tableData.end) : tableData.totalCount;
                  } else {
                    const start = (tableData.pageIndex - 1) * 10;
                    const end = start + 10;
                    tableData.displayData = tableData.tableData.slice(start, end);
                    tableData.totalCount = tableData.tableData.length;
                  }

                  //This is used when use expand icon from options of grid config to call api.
                  if (tableData.tableHeaders.some((header: any) => header.key === 'expand')) {
                    tableData.tableData = tableData.tableData.map((row: any) => ({
                      'expand': false,
                      ...row
                    }));
                    tableData.displayData = tableData.displayData.map((row: any) => ({
                      'expand': false,
                      ...row
                    }));

                  }
                }
                // this.assignGridRules(tableData);
              }
            }
            this.saveLoader = false;
          }, error: (error: any) => {
            console.error(error);
            this.toasterService.checkToaster(data, 'error');
            this.saveLoader = false;
          }
        });
      }
    }
  }
  tempTableData: any = {};
  addDetailGrid(data: any, btnConfig: any, clear?: any) {
    if (clear) {
      let tableData = this.findObjectByKey(this.sections, btnConfig.detailSaveGrid);
      this.tempTableData = {};
      tableData.tableData = [];
      tableData.data = [];
      tableData.targetId = '';
      tableData.displayData = []
      tableData.totalCount = tableData.tableData.length;

    }
    else {
      const filteredObject = Object.keys(data).reduce((acc: any, key) => {
        if (key.startsWith(btnConfig?.detailTableName)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      if (filteredObject) {
        let tableData = this.findObjectByKey(this.sections, btnConfig.detailSaveGrid);
        if (tableData) {
          if (filteredObject) {
            if (this.tempTableData[btnConfig?.detailTableName] == undefined) {
              this.tempTableData[btnConfig?.detailTableName] = []
            }
            this.tempTableData[btnConfig?.detailTableName].push(filteredObject);
            let saveForm = JSON.parse(JSON.stringify(this.tempTableData[btnConfig?.detailTableName][0]));
            const firstObjectKeys = Object.keys(saveForm);
            // let tableKey = firstObjectKeys.map(key => ({ name: key }));
            let obj = firstObjectKeys.map(key => ({ name: key, key: key }));
            tableData.tableData = [];
            saveForm.id = tableData.tableData.length + 1;
            this.tempTableData[btnConfig?.detailTableName].forEach((element: any, index: any) => {
              const updatedElement = { id: (index + 1).toString(), ...element };
              tableData.tableData?.push(updatedElement);
            });
            obj.unshift({
              name: 'id',
              key: 'id',
            })
            // pagniation work start
            if (!tableData.end) {
              tableData.end = 10;
            }
            tableData.pageIndex = 1;
            // tableData.serverApi = url;
            tableData.data = tableData.tableData;
            tableData.targetId = '';
            tableData.displayData = tableData.tableData.length > tableData.end ? tableData.tableData.slice(0, tableData.end) : tableData.tableData;
            // pagniation work end
            tableData.totalCount = tableData.tableData.length;
            if (!tableData?.tableHeaders) {
              tableData.tableHeaders = obj;
              tableData['tableKey'] = obj
            }
            if (tableData?.tableHeaders.length == 0) {
              tableData.tableHeaders = obj;
              tableData['tableKey'] = obj
            }
            else {
              if (JSON.stringify(tableData['tableKey']) !== JSON.stringify(obj)) {
                const updatedData = obj.filter(updatedItem =>
                  !tableData.tableHeaders.some((headerItem: any) => headerItem.key === updatedItem.name)
                );
                if (updatedData.length > 0) {
                  updatedData.forEach(updatedItem => {
                    tableData.tableHeaders.push({ id: tableData.tableHeaders.length + 1, key: updatedItem.name, name: updatedItem.name, });
                  });
                  tableData['tableKey'] = tableData.tableHeaders;
                }
              }
            }
            // Make DataType
            let propertiesWithoutDataType = tableData.tableHeaders.filter((check: any) => !check.hasOwnProperty('dataType'));
            if (propertiesWithoutDataType.length > 0) {
              let formlyInputs = this.filterInputElements(this.sections.children[1].children);

              if (formlyInputs && formlyInputs.length > 0) {
                propertiesWithoutDataType.forEach((head: any) => {
                  let input = formlyInputs.find(a => a.key == head.key);

                  if (input) {
                    head['dataType'] = input.formly[0].fieldGroup[0].type;
                    head['subDataType'] = input.formly[0].fieldGroup[0].props.type;
                    head['title'] = input.title;
                  }
                });

                tableData.tableHeaders = tableData.tableHeaders.concat(propertiesWithoutDataType.filter((item: any) => !tableData.tableHeaders.some((objItem: any) => objItem.key === item.key)));
              }
            }
            tableData.tableHeaders = tableData.tableHeaders.filter((head: any) => head.key != 'expand');
            const filteredObject1 = Object.keys(this.formlyModel).reduce((acc: any, key) => {
              if (key.startsWith(btnConfig?.detailTableName)) {
                acc[key] = this.formlyModel[key];
              }
              return acc;
            }, {});
            this.setInternalValuesEmpty(filteredObject1);
            this.setInternalValuesEmpty(filteredObject1);
            this.form.patchValue(filteredObject1);
          }
        }
      }
    }

  }
  groupedFunc(data: any, type: any, header: any, groupingArray: any, displayData: any, tableData: any, tableHeaders: any) {
    header['grouping'] = type === 'add' ? data : '';

    if (type === 'add')
      groupingArray.push(data);

    if (groupingArray.length === 0) {
      tableHeaders = tableHeaders.filter((a: any) => a.name !== 'expand');
    } else {
      // Reset displayData and tableHeaders before re-grouping
      displayData = [];
      tableHeaders = tableHeaders.filter((a: any) => a.name !== 'expand');
      // Apply grouping for each column in the groupingArray
      return this.groupData(tableData, 0, groupingArray, tableData, tableHeaders);
    }

  }
  groupData(data: any[], index: number, groupingArray: any, tableData: any, tableHeaders: any): any {
    if (index < groupingArray.length) {
      const groupColumn = groupingArray[index];

      if (index === 0) {
        // Group the data by the specified column
        const groupedData = this.groupByColumn(data, groupColumn, index, groupingArray);

        // Update the displayData and tableHeaders for the current level
        tableData = tableData.concat(groupedData);
        tableHeaders.unshift({
          name: 'expand',
          key: 'expand',
          title: 'Expand',
        });

        // Continue grouping for the next column
        return this.groupData(groupedData, index + 1, groupingArray, tableData, tableHeaders);
      }
      else {
        data.forEach((update: any) => {
          if (update.children) {
            const groupedChildren = this.groupByColumn(update.children, groupColumn, index, groupingArray);
            update.children = groupedChildren; // Update children with grouped data
            // Recursively apply grouping to children
            this.groupData(update.children, index + 1, groupingArray, tableData, tableHeaders);
          }
        });
      }
    }

    return data; // Return the grouped data when all columns are processed
  }

  groupByColumn(data: any, columnName: string, index: number, groupingArray: any) {
    const groupedData: any = {};
    data.forEach((element: any) => {
      const groupValue = element[columnName];
      const parentValue = groupingArray[index - 1]; // Previous grouping value

      if (!groupedData[parentValue]) {
        groupedData[parentValue] = [];
      }

      if (!groupedData[parentValue][groupValue]) {
        groupedData[parentValue][groupValue] = {
          expand: false,
          children: [],
        };
      }

      const group = groupedData[parentValue][groupValue];
      group.children.push(element);
      group.expand = false;

      // If it's the first level of grouping, add the parent value
      if (index === 0) {
        group['parent'] = parentValue;
      }
    });
    const result = Object.keys(groupedData).map((parentKey: string) => {
      const parentGroup = groupedData[parentKey];
      return Object.keys(parentGroup).map((groupKey: string) => {
        const groupData = parentGroup[groupKey];
        const secondObj = groupData.children[0];
        const firstObj = JSON.parse(JSON.stringify(groupData));
        for (const key in secondObj) {
          if (secondObj.hasOwnProperty(key)) {
            // Check if the property does not exist in the first object
            if (!firstObj.hasOwnProperty(key)) {
              // Assign the property from the second object to the first object
              firstObj[key] = secondObj[key];
            }
          }
        }
        return firstObj;
      });
    }).flat(); // Flatten the nested arrays

    return result;
  }

  gridRulesData: any;
  assignGridRules(data: any) {
    if (this.gridRulesData?.data.length > 0) {
      this.gridRules(this.gridRulesData, data);
    }
    else {
      // this.requestSubscription = this.applicationServices.getNestCommonAPIById('cp/GridBusinessRule', this.screenId).subscribe(((getRes: any) => {
      //   if (getRes.isSuccess) {
      //     if (getRes.data.length > 0) {
      //       this.gridRulesData = getRes;
      //       this.gridRules(getRes, data);
      //     }
      //   } else
      //     this.toastr.error(getRes.message, { nzDuration: 3000 });
      // }));
    }
  }
  gridRules(getRes: any, data: any) {

    let gridFilter = getRes.data.filter((a: any) => a.gridType == 'Body');
    for (let m = 0; m < gridFilter.length; m++) {
      if (gridFilter[m].gridKey == data.key && data.tableData) {
        const objRuleData = JSON.parse(gridFilter[m].businessRuleData);
        for (let index = 0; index < objRuleData.length; index++) {
          // const elementv1 = objRuleData[index].ifRuleMain;
          const elementv1 = objRuleData[index];
          let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv1.target);
          if (checkType.length == 0) {
            console.log("No obj Found!")
          }
          else {
            for (let j = 0; j < data.tableData.length; j++) {
              //query
              let query: any = '';
              objRuleData[index].ifRuleMain.forEach((element: any, ruleIndex: number) => {
                if (objRuleData[index].ifRuleMain.length > 1) {
                  if (element.oprator == 'NotNull') {
                    if (!query) {
                      query = " ( 1==1"
                    } else {
                      query += " ( 1==1"
                    }
                  }
                  else {
                    let firstValue = data.tableData[j][element.ifCondition] ? data.tableData[j][element.ifCondition] : "0";
                    let appendString = element.conditional.length > 0 ? " ( " : ' ';
                    if (ruleIndex == 0) {
                      query = appendString + firstValue + element.oprator + element.getValue
                    } else {
                      query += appendString + firstValue + element.oprator + element.getValue
                    }
                  }
                  for (let k = 0; k < element.conditional.length; k++) {
                    const conditionElement = element.conditional[k];
                    let check = data.tableData[j][conditionElement.condifCodition] ? data.tableData[j][conditionElement.condifCodition] : '0';
                    query += ' ' + conditionElement.condType + ' ' + check + conditionElement.condOperator + conditionElement.condValue;
                    if (k + 1 == element.conditional.length)
                      query += " ) " + element.condType
                  }
                }
                else {
                  if (element.oprator == 'NotNull')
                    query = "1==1"
                  else {
                    let firstValue = data.tableData[j][element.ifCondition] ? data.tableData[j][element.ifCondition] : "0";
                    query = firstValue + element.oprator + element.getValue
                  }
                  for (let k = 0; k < element.conditional.length; k++) {
                    const conditionElement = element.conditional[k];
                    let check = data.tableData[j][conditionElement.condifCodition] ? data.tableData[j][conditionElement.condifCodition] : '0';
                    query += ' ' + conditionElement.condType + ' ' + check + conditionElement.condOperator + conditionElement.condValue;
                  }
                }
              });
              let checkCondition = false;
              if (objRuleData[index].ifRuleMain.length > 1) {
                checkCondition = this.evaluateGridCondition(query)
              } else {
                checkCondition = this.evaluateGridConditionMain(query)
              }
              if (checkCondition) {
                for (let k = 0; k < elementv1.getRuleCondition.length; k++) {
                  const elementv2 = elementv1.getRuleCondition[k];
                  if (elementv1.getRuleCondition[k].referenceOperator != '') {
                    data.tableData[j][elementv1.target] = this.evaluateGridConditionOperator(`${data.tableData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${data.tableData[j][elementv2.target]}`);
                    data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                  }
                  else {
                    if (k > 0) {
                      data.tableData[j][elementv1.target] = this.evaluateGridConditionOperator(`${data.tableData[j][elementv1.target]} ${elementv1.getRuleCondition[k - 1].referenceOperator} ${data.tableData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${data.tableData[j][elementv2.target]}`);
                      data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                    }
                    else
                      data.tableData[j][elementv1.target] = this.evaluateGridConditionOperator(`${data.tableData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${data.tableData[j][elementv2.target]}`);
                    data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                  }
                  if (elementv2.multiConditionList.length > 0) {
                    for (let l = 0; l < elementv2.multiConditionList.length; l++) {
                      const elementv3 = elementv2.multiConditionList[l];
                      const value = data.tableData[j][elementv1.target];
                      data.tableData[j][elementv1.target] = this.evaluateGridConditionOperator(`${value} ${elementv3.oprator} ${data.tableData[j][elementv3.target]}`);
                      // this.data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                    }
                  }
                }
                for (let k = 0; k < elementv1.thenCondition.length; k++) {
                  const elementv2 = elementv1.thenCondition[k];
                  for (let l = 0; l < elementv2.getRuleCondition.length; l++) {
                    const elementv3 = elementv2.getRuleCondition[l];
                    data.tableData[j][elementv2.thenTarget] = this.evaluateGridConditionOperator(`${data.tableData[j][elementv3.ifCondition]} ${elementv3.oprator} ${data.tableData[j][elementv3.target]}`);
                    if (elementv3.multiConditionList.length > 0) {
                      for (let m = 0; m < elementv3.multiConditionList.length; m++) {
                        const elementv4 = elementv3.multiConditionList[m];
                        const value = data.tableData[j][elementv2.thenTarget];
                        data.tableData[j][elementv2.thenTarget] = this.evaluateGridConditionOperator(`${value} ${elementv4.oprator} ${data.tableData[j][elementv4.target]}`);
                        // this.data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    let headerFilter = getRes.data.filter((a: any) => a.gridType == 'Header');
    for (let m = 0; m < headerFilter.length; m++) {
      if (headerFilter[m].gridKey == data.key && data.tableData) {
        for (let index = 0; index < headerFilter[m].businessRuleData.length; index++) {
          const elementv1 = headerFilter[m].businessRuleData[index];
          let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv1.target);
          if (checkType.length == 0) {
            // const filteredData = this.filterTableData(elementv1)
            // const result = this.makeAggregateFunctions(filteredData, elementv1.target);
            // elementv1.getRuleCondition.forEach((elementv2: any) => {
            //   element = this.applyAggreateFunctions(elementv2, element, result, 'gridHeaderSum')
            // });
          }
          else {
            data.tableHeaders.forEach((element: any) => {
              if (element.key == checkType[0]) {
                element['gridHeaderSum'] = 0;
                const filteredData = this.filterTableData(elementv1, data)
                const result = this.makeAggregateFunctions(filteredData, elementv1.target)
                elementv1.getRuleCondition.forEach((elementv2: any) => {
                  element = this.applyAggreateFunctions(elementv2, element, result, 'gridHeaderSum')
                });
                for (let k = 0; k < elementv1.thenCondition.length; k++) {
                  const elementv2 = elementv1.thenCondition[k];
                  for (let l = 0; l < elementv2.getRuleCondition.length; l++) {
                    const elementv3 = elementv2.getRuleCondition[l];
                    let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv3.ifCondition);
                    if (checkType.length == 0) {
                      console.log("No obj Found!")
                    }
                    else {
                      const resultData = this.makeAggregateFunctions(filteredData, elementv3.ifCondition)
                      data.tableHeaders.forEach((element: any) => {
                        if (element.key == checkType[0]) {
                          element = this.applyAggreateFunctions(elementv3, element, resultData, 'gridHeaderSum')
                        }
                      })
                    }
                  }
                }
              }
              else {
                if (!element.gridHeaderSum)
                  element['gridHeaderSum'] = '';
              }
            });
          }
        }
      }
    }
    let footerFilter = getRes.data.filter((a: any) => a.gridType == 'Footer');
    for (let m = 0; m < footerFilter.length; m++) {
      if (footerFilter[m].gridKey == data.key && data.tableData) {
        for (let index = 0; index < footerFilter[m].businessRuleData.length; index++) {
          const elementv1 = footerFilter[m].businessRuleData[index];
          let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv1.target);
          if (checkType.length == 0) {
            console.log("No obj Found!")
          }
          else {
            data.tableHeaders.forEach((element: any) => {
              if (element.key == checkType[0]) {
                element['gridFooterSum'] = 0;
                const filteredData = this.filterTableData(elementv1, data)
                const result = this.makeAggregateFunctions(filteredData, elementv1.target)
                elementv1.getRuleCondition.forEach((elementv2: any) => {
                  element = this.applyAggreateFunctions(elementv2, element, result, 'gridFooterSum')
                });
                for (let k = 0; k < elementv1.thenCondition.length; k++) {
                  const elementv2 = elementv1.thenCondition[k];
                  for (let l = 0; l < elementv2.getRuleCondition.length; l++) {
                    const elementv3 = elementv2.getRuleCondition[l];
                    let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv3.ifCondition);
                    if (checkType.length == 0) {
                      console.log("No obj Found!")
                    }
                    else {
                      const resultData = this.makeAggregateFunctions(filteredData, elementv3.ifCondition)
                      data.tableHeaders.forEach((element: any) => {
                        if (element.key == checkType[0]) {
                          element = this.applyAggreateFunctions(elementv3, element, resultData, 'gridFooterSum')
                        }
                      })
                    }
                  }
                }
              }
              else {
                if (!element.gridHeaderSum)
                  element['gridHeaderSum'] = '';
              }
            });
          }
        }
      }
    }
  }
  private isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  evaluateGridConditionOperator(condition: string): any {
    const operators: { [key: string]: (a: any, b: any) => any } = {
      "+": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a + b : null,
      "-": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a - b : null,
      "*": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a * b : null,
      "/": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a / b : null,
      "%": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a % b : null,
    };

    const parts = condition.split(/(\+|-|\*|\/|%)/).map(part => part.trim());
    const leftOperand = parts[0];
    const operator = parts[1];
    const rightOperand = parts[2];

    const leftValue = this.isNumeric(leftOperand) ? Number(leftOperand) : null;
    const rightValue = this.isNumeric(rightOperand) ? Number(rightOperand) : null;

    return operators[operator](leftValue, rightValue);
  }
  evaluateGridConditionMain(condition: string): boolean {
    const operators: { [key: string]: (a: any, b: any) => boolean } = {
      "==": (a: any, b: any) => a == b,
      "!=": (a: any, b: any) => a != b,
      ">=": (a: any, b: any) => a >= b,
      "<=": (a: any, b: any) => a <= b,
      "=": (a: any, b: any) => a === b,
      ">": (a: any, b: any) => a > b,
      "<": (a: any, b: any) => a < b,
      "null": (a: any, b: any) => a === null,
      "contains": (a: any, b: any) => a.includes(b),
    };

    const logicalOperatorsRegex = /\s+(AND|OR)\s+/;
    const conditionParts = condition.split(logicalOperatorsRegex);

    const evaluateExpression = (expr: string): boolean => {
      const [leftOperand, operator, rightOperand] = expr.split(/(==|!=|>=|<=|=|>|<|null|contains)/).map(part => part.trim());

      if (!operators[operator]) {
        throw new Error(`Unknown operator: ${operator}`);
      }

      return operators[operator](leftOperand, rightOperand);
    };

    const evaluateCondition = (condition: string): boolean => {
      if (condition.includes("AND")) {
        const subConditions = condition.split(" AND ");
        return subConditions.every(subCondition => evaluateCondition(subCondition));
      } else if (condition.includes("OR")) {
        const subConditions = condition.split(" OR ");
        return subConditions.some(subCondition => evaluateCondition(subCondition));
      } else {
        return evaluateExpression(condition);
      }
    };

    return evaluateCondition(condition);
  }

  evaluateGridCondition(condition: any): boolean {
    const operators: { [key: string]: (a: any, b: any) => boolean } = {
      "==": (a: any, b: any) => a == b,
      "!=": (a: any, b: any) => a != b,
      ">=": (a: any, b: any) => a >= b,
      "<=": (a: any, b: any) => a <= b,
      "=": (a: any, b: any) => a === b,
      ">": (a: any, b: any) => a > b,
      "<": (a: any, b: any) => a < b,
      "null": (a: any, b: any) => a === null,
      "contains": (a: any, b: any) => a.includes(b),
    };

    const evaluateExpression = (expr: string): boolean => {
      if (!expr.includes(' false ') && !expr.includes(' true ')) {
        const [leftOperand, operator, rightOperand] = expr.trim().split(/(==|!=|>=|<=|=|>|<|null|contains)/).map(part => part.trim());

        let leftValue: any = leftOperand;
        if (leftOperand) {
          leftValue = leftOperand;
        } else if (leftOperand === 'null') {
          leftValue = null;
        }

        let rightValue: any = rightOperand;
        if (rightOperand) {
          rightValue = rightOperand;
        } else if (rightOperand === 'null') {
          rightValue = null;
        }

        if (!operators[operator]) {
          throw new Error(`Unknown operator: ${operator}`);
        }

        return operators[operator](leftValue, rightValue);
      }
      else {
        if (expr.includes(' false ')) {
          return false;
        } else {
          return true;
        }
      }



    };

    const processSubCondition = (subCondition: string): boolean => {
      const stack: string[] = [];
      let currentExpression = '';

      for (const char of subCondition) {
        if (char === '(') {
          if (currentExpression) {
            stack.push(currentExpression);
            currentExpression = '';
          }
          stack.push(char);
        } else if (char === ')') {
          if (currentExpression) {
            stack.push(currentExpression);
            currentExpression = '';
          }
          let innerExpression = '';
          while (stack.length > 0 && stack[stack.length - 1] !== '(') {
            innerExpression = stack.pop() + innerExpression;
          }
          stack.pop(); // Remove the opening parenthesis from the stack

          const innerResult = processSubCondition(innerExpression);
          stack.push(innerResult.toString());
        } else {
          currentExpression += char;
        }
      }

      if (currentExpression) {
        stack.push(currentExpression);
      }

      return evaluateCondition(stack.join(' '));
    };

    const evaluateCondition = (condition: any): boolean => {
      if (condition.includes("OR")) {
        const subConditions = condition.split(" OR ");
        return subConditions.some((subCondition: any) => processSubCondition(subCondition));
      } else if (condition.includes("AND")) {
        const subConditions = condition.split(" AND ");
        return subConditions.every((subCondition: any) => processSubCondition(subCondition));
      } else {
        return evaluateExpression(condition);
      }
    };

    return processSubCondition(condition);
  }

  parseOperand(operand: string): any {
    const trimmedOperand = operand.trim();
    if (/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(trimmedOperand)) {
      return Number(trimmedOperand); // Parse as number if it's a valid numeric string
    }
    return trimmedOperand; // Return as string otherwise
  }
  applyAggreateFunctions(elementv3: any, element: any, resultData: any, value: any) {
    if (elementv3.oprator == 'sum')
      element[value] = resultData?.sum;
    else if (elementv3.oprator == 'count')
      element[value] = resultData?.count;
    else if (elementv3.oprator == 'avg') {
      element[value] = resultData.avg
    }
    else if (elementv3.oprator == 'min')
      element[value] = resultData.min
    else if (elementv3.oprator == 'max')
      element[value] = resultData.max;
    return element;
  }
  filterTableData(elementv1: any, data: any) {
    let filterData = data.tableData.filter((item: any) => {
      const condition = item[elementv1.ifCondition];
      const value = elementv1.getValue;

      switch (elementv1.oprator) {
        case ">=":
          return condition >= value;
        case ">":
          return condition > value;
        case "<=":
          return condition <= value;
        case "<":
          return condition < value;
        case "==":
          return condition === value;
        case "!=":
          return condition !== value;
        default:
          return false;
      }
    });
    return filterData;
  }
  makeAggregateFunctions(filteredData: any, elementv1: any) {
    let getData = filteredData.reduce((accumulator: any, currentValue: any, index: any, array: any) => {
      accumulator.count++;
      accumulator.sum += currentValue[elementv1];
      accumulator.min = Math.min(accumulator.min, currentValue[elementv1]);
      accumulator.max = Math.max(accumulator.max, currentValue[elementv1]);

      if (index === array.length - 1) {
        accumulator.avg = accumulator.sum / accumulator.count;
      }

      return accumulator;
    },
      {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0,
      }
    );
    return getData;
  }
  findObjectByTypeBase(data: any, type: any) {
    if (data) {
      if (data.type && type) {
        if (data.type === type) {
          return data;
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByTypeBase(child, type);
            if (result !== null) {
              return result;
            }
          }
        }
        return null;
      }
    }
  }
  setInternalValuesEmpty = (obj: any) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.setInternalValuesEmpty(obj[key]);
      }
      else if (Array.isArray(obj[key])) {
        obj[key].forEach((element: any) => {
          if (element) {
            for (const key1 in element) {
              element[key1] = '';
            }
          }
        });
      }
      else {
        obj[key] = '';
      }
    }
  };
  setInternalModelValuesEmpty = (obj: any): any => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = this.setInternalModelValuesEmpty(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((element: any) => {
          if (element) {
            for (const key1 in element) {
              element[key1] = '';
            }
          }
        });
      } else {
        obj[key] = '';
      }
    }
    return obj;
  };

  submit() {
    this.dataModel = this.formlyModel;
  }
  joiValidation() {
    let modelObj: any = [];
    this.ruleValidation = {};
    let filterdFormly: any = this.filterInputElements(this.sections.children[1].children);
    let filteredInputNodes = filterdFormly.filter((item: any) => !item.hideExpression);
    if (this.joiValidationData.length > 0) {
      let detailTableKeys: string[] = Object.keys(this.tempTableData);
      for (let j = 0; j < filteredInputNodes.length; j++) {
        if (filteredInputNodes[j].formlyType != undefined) {
          let jsonScreenRes: any = this.joiValidationData.filter(a => a.key == filteredInputNodes[j].formly[0].fieldGroup[0].key);
          if (jsonScreenRes.length > 0) {
            if (detailTableKeys.includes(jsonScreenRes[0].key.split('.')[0])) {
              return null;
            }
            const getKeyValue = jsonScreenRes[0].key.includes('.') ? this.formlyModel[jsonScreenRes[0].key.split('.')[0]][jsonScreenRes[0].key.split('.')[1]] : this.formlyModel[jsonScreenRes[0].key];
            if (jsonScreenRes[0].type === "text") {
              const { minlength, maxlength } = jsonScreenRes[0];
              const minLimit: any = typeof minlength !== 'undefined' ? minlength : 0;
              const maxLimit: any = typeof maxlength !== 'undefined' ? maxlength : 0;
              // this.ruleObj = {
              //   [jsonScreenRes[0].key]: Joi.string().min(parseInt(minLimit, 10)).max(parseInt(maxLimit, 10)),
              // };
              modelObj[jsonScreenRes[0].key] = getKeyValue && typeof getKeyValue === 'string' ? getKeyValue.trim() : getKeyValue;
              if (!minLimit && !maxLimit) {
                if (modelObj[jsonScreenRes[0].key] instanceof Date) {
                  this.ruleObj = {
                    [jsonScreenRes[0].key]: Joi.date().iso().required()
                  };
                } else if (typeof modelObj[jsonScreenRes[0].key] === 'string') {
                  this.ruleObj = {
                    [jsonScreenRes[0].key]: Joi.string().required()
                  };
                } else {
                  this.ruleObj = {
                    [jsonScreenRes[0].key]: Joi.any().required()
                  };
                }
              }
              else {
                let schema = Joi.string();

                if (minlength !== undefined) {
                  schema = schema.min(parseInt(minlength, 10));
                }
                if (maxlength !== undefined) {
                  schema = schema.max(parseInt(maxlength, 10));
                }

                this.ruleObj = {
                  [jsonScreenRes[0].key]: schema,
                };
              }
            }
            else if (jsonScreenRes[0].type === "number") {
              modelObj[jsonScreenRes[0].key] = getKeyValue;
              const { minlength, maxlength } = jsonScreenRes[0];

              let schema = Joi.number().integer();

              if (minlength !== undefined) {
                schema = schema.min(parseInt(minlength, 10));
              }

              if (maxlength !== undefined) {
                schema = schema.max(parseInt(maxlength, 10));
              }

              this.ruleObj = {
                [jsonScreenRes[0].key]: schema,
              };
            }

            else if (jsonScreenRes[0].type == "pattern") {
              modelObj[jsonScreenRes[0].key] = jsonScreenRes[0].key.includes('.') ? this.formlyModel[jsonScreenRes[0].key.split('.')[0]][jsonScreenRes[0].key.split('.')[1]] : this.formlyModel[jsonScreenRes[0].key];

              this.ruleObj = {
                [jsonScreenRes[0].key]: Joi.string().pattern(new RegExp(jsonScreenRes[0].pattern)),
              }
            }
            else if (jsonScreenRes[0].type == "reference") {
              modelObj[jsonScreenRes[0].key] = jsonScreenRes[0].key.includes('.') ? this.formlyModel[jsonScreenRes[0].key.split('.')[0]][jsonScreenRes[0].key.split('.')[1]] : this.formlyModel[jsonScreenRes[0].key];

              modelObj[jsonScreenRes[0].reference] = this.formlyModel[jsonScreenRes[0].reference];
              this.ruleObj = {
                [jsonScreenRes[0].key]: Joi.ref(typeof jsonScreenRes[0].reference !== 'undefined' ? jsonScreenRes[0].reference : ''),
              }
            }
            else if (jsonScreenRes[0].type == "email") {
              modelObj[jsonScreenRes[0].key] = jsonScreenRes[0].key.includes('.') ? this.formlyModel[jsonScreenRes[0].key.split('.')[0]][jsonScreenRes[0].key.split('.')[1]] : this.formlyModel[jsonScreenRes[0].key];
              let emailtypeallow = jsonScreenRes[0].emailtypeallow
              if (typeof emailtypeallow === 'string') {
                emailtypeallow = emailtypeallow ? (emailtypeallow.includes(',') ? emailtypeallow.split(',') : [emailtypeallow]) : []
              }
              const minDomainSegments = Math.max(0, Number.isInteger(emailtypeallow.length) ? emailtypeallow.length : 0);
              const schema = {
                [jsonScreenRes[0].key]: Joi.string().email({ minDomainSegments, tlds: { allow: emailtypeallow } }),
              };
              this.ruleObj = schema;
            }
            Object.assign(this.ruleValidation, this.ruleObj);
          }
        }

      }
      this.schemaValidation = Joi.object(Object.assign({}, this.ruleValidation));
      this.validationChecker(modelObj);

    }
    return true;
  }
  validationChecker(object: any) {
    let filterdFormly: any = this.filterInputElements(this.sections.children[1].children);
    let filteredNodes: any = filterdFormly.filter((item: any) => !item.hideExpression);
    filteredNodes.forEach((item: any) => {
      if (item.formly) {
        // item.formly[0].fieldGroup[0].props.error = null;
        if (item.formly[0].fieldGroup[0].props) {
          item.formly[0].fieldGroup[0].props['additionalProperties'].requiredMessage = null;
        }
      }
    });

    this.validationCheckStatus = [];
    const cc = this.schemaValidation.validate(Object.assign({}, object), { abortEarly: false });
    if (cc?.error) {
      this.setErrorToInput = JSON.parse(JSON.stringify(cc.error.details));
      filteredNodes.forEach((V2: any, index: number) => {
        const key = V2.formly[0].fieldGroup[0].key;
        const matchingError = this.setErrorToInput.find((error: any) => error.context.key === key);

        if (matchingError && V2.formly[0].fieldGroup[0].props) {
          const props = V2.formly[0].fieldGroup[0].props;
          props.additionalProperties.requiredMessage = matchingError.message.replace(matchingError.context.key, props.label);
          this.validationCheckStatus.push(props.additionalProperties.requiredMessage);
        }
      });

      if (this.validationCheckStatus.length > 0) {
        this.dataSharedService.formlyShowError.next(true);
      }
      this.cd.detectChanges();
    }
  }
  findObjectByType(data: any, key: any) {
    if (data.type === key) {
      return data;
    }
    for (let child of data.children) {
      let result: any = this.findObjectByType(child, key);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }
  findObjectById(data: any, key: any) {
    if (data) {
      if (data.id && key) {
        if (data.id === key) {
          return data;
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectById(child, key);
            if (result !== null) {
              return result;
            }
          }
        }
        return null;
      }
    }
  }
  findObjectByKey(data: any, key: any) {
    if (data) {
      if (data.key && key) {
        if (data.key === key) {
          return data;
        }
        if (data.children && data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByKey(child, key);
            if (result !== null) {
              return result;
            }
          }
        }
      }
    }
    return null;
  }

  recursiveUpdate(obj: any, tableName: any, res: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object') {
          // If the property is an object, recurse into it
          this.recursiveUpdate(obj[key], tableName, res);
        } else if (key === tableName + 'id') {
          // Check if the property key matches the condition
          obj[key] = res[0].id; // Update the property value
        }
      }
    }
  }
  ngOnDestroy(): void {
    if (this.requestSubscription)
      this.requestSubscription.unsubscribe();
  }
  clearValues() {
    this.formlyModel = {};
  }
}
