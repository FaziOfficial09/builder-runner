import { DatePipe } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ChangeDetectorRef, Component, Input, OnInit, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, Subscription, debounceTime, takeUntil } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { DataService } from 'src/app/services/offlineDb.service';
import { WorkSheet, utils, WorkBook, writeFile } from 'xlsx';
import { QrCodeComponent } from '../qr-code/qr-code.component';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { SocketService } from 'src/app/services/socket.service';
import { NzImageService } from 'ng-zorro-antd/image';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit {
  @Input() itemData: any;
  @Input() tableId: any;
  @Input() form: any;
  @Input() checkType: boolean;
  @Input() configurationTable: boolean = false;
  @Input() isDrawer: boolean = false;
  @Input() tableData: any[] = [];
  @Input() excelReportData: any[] = [];
  @Input() displayData: any[] = [];
  @Input() tableHeaders: any = [];
  @Input() data: any;
  @Input() childDataObj: any;
  editId: string | null = null;
  @Input() screenName: any;
  @Input() mappingId: any;
  @Input() showPagination: any = true;
  @Input() childTable: any = false;
  GridType: string = '';
  index: any;
  screenNameaa: any;
  footerData: any[] = [];
  childKey: any;
  allChecked = false;
  indeterminate = false;
  saveLoader = false;
  scrollX: string | null = null;
  scrollY: string | null = null;
  @Input() screenId: any;
  @Input() formlyModel: any;
  storeRows: any = [];
  storeColums: any = [];
  responsiveTable: boolean = false;
  requestSubscription: Subscription;
  unsubscribe = new Subject<void>();
  searchByGrid$ = new Subject<any>();
  drawerChild: any[] = [];
  nodes: any = [];
  editingEntry: any = null;
  pageSize: any;
  start = 1;
  end: any;
  groupingArray: any = [];
  groupingData: any = [];
  showChild: boolean = false;
  searchValue: any = '';
  progress = 0;
  showProgressBar = false;
  fileUpload: any = '';
  visible: boolean = false;
  checklink: any = '';
  filteringArrayData: any[] = [];
  localStorageGrouping: any[] = [];
  filteringHeadArray: any[] = [];
  rotationDegree: number = -45;
  editData: any;
  deleteditWidth: any = [{ label: 'Edit', width: '60px', key: 'edit' }, { label: 'Delete', width: '', key: 'delete' }, { label: 'Checkbox', width: '', key: 'checkbox' }]
  borderColor = '#3b82f6';
  backgroundColor = 'red';
  boxShadow = '0px 7px 16px rgba(0, 0, 0, 0.14)';
  borderRadius = '8px';
  current = {
    '--border-right': '1px solid red !important',
  }
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  constructor(public _dataSharedService: DataSharedService,
    private dataService: DataService,
    private toasterService: ToasterService,
    private toastr: NzMessageService, private cdr: ChangeDetectorRef,
    public dataSharedService: DataSharedService,
    private router: Router, private http: HttpClient,
    private modal: NzModalService,
    private socketService: SocketService,
    private nzImageService: NzImageService
  ) {
    this.processData = this.processData.bind(this);
    const prevNextRecord = this.dataSharedService.prevNextRecord.subscribe((res: any) => {
      if (res) {
        if (this.screenId == res.screenId && res.tableRowId) {
          this.mappingId = res.tableRowId;
          this.tableData = [];
          this.displayData = [];
          this.recallApi();
        }
      }
    });
    this.subscriptions.add(prevNextRecord);
    this._dataSharedService.gridLoadById.subscribe(res => {
      if (res) {
        const { component, value, formly,data } = res;
        this.loadGridById(component, value, formly,data);
      }
    })
  }
  userDetails: any;
  async ngOnInit(): Promise<void> {
    if (this.mappingId && this.data?.eventActionconfig && Object.keys(this.data.eventActionconfig).length > 0) {
      this.data.eventActionconfig['parentId'] = this.mappingId;
    }
    localStorage.removeItem('tablePageNo');
    localStorage.removeItem('tablePageSize');
    this.data['searchValue'] = '';
    if (this.data.serverSidePagination) {
      localStorage.setItem('tablePageNo', '1');
      localStorage.setItem('tablePageSize', this.data?.end);
      this.data.eventActionconfig['page'] = 1;
      this.data.eventActionconfig['pageSize'] = this.data?.end;
    }
    if (this.data) {
      document.documentElement.style.setProperty('--paginationColor', this.data?.paginationColor || '#2563EB');

    }
    this.userDetails = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;

    this.updateRotationDegree(50); // Rotate to -60 degrees

    // this.updateScrollConfig();
    if (!this.childTable) {
      // this.search(this.data?.searchType ? 'keyup' : 'keyup')
    }
    if (this.data?.eventActionconfig && !this.childTable && Object.keys(this.data.eventActionconfig).length > 0 && !this.configurationTable) {
      this.saveLoader = true;
    }
    this.loadTableData();
    // this.gridInitilize();
    this.getSaveGroupNodes();
    try {
      if (this.data?.tableHeaders) {
        if (this.data?.tableHeaders.length > 0) {
          for (const api of this.data.tableHeaders) {
            if (api.key != "expand")
              await this.handleRowClickApi(api);
          }
        }
      }
    } catch (error) {
      this.toasterService.checkToaster(this.data, 'error');
    }
    this.requestSubscription = this.dataSharedService.taskmanager.subscribe({
      next: (res) => {
        if (this.data.eventActionconfig && res) {
          this.recallApi();
        }
      },
      error: (err) => {
        console.error(err);
        this.saveLoader = false;
      }
    });
    this.searchByGrid$
      .pipe(debounceTime(500), takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.onPageIndexChange(1);
      });
  }
  private async handleRowClickApi(api: any) {
    try {

      if (api?.callApi) {
        let splitApi = api?.callApi.includes('getexecute-rules/') ? api.callApi.split('getexecute-rules/')[1] : api?.callApi;
        let parentId;

        if (splitApi?.includes('/')) {
          const [splitApiValue, parentIdValue] = splitApi.split('/');
          splitApi = splitApiValue;
          parentId = parentIdValue;
        }

        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId);
        this.dataSharedService.saveDebugLog('handleRowClickApi', RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res) => {
            // this.dataSharedService.queryId = '';
            if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              this.saveLoader = false;
              if (res.isSuccess && res.data) {
                api.filterArray = [];
                api.filterSearch = [];
                res.data.forEach((res: any) => {
                  const keys = Object.keys(res);
                  const firstKey = keys[0];
                  const obj = {
                    key: api.key,
                    text: res[firstKey],
                    value: res[firstKey],
                    filter: false,
                  };
                  api.filterArray.push(obj);
                  api.filterSearch.push(obj);
                });
              }
            }

          },
          error: (err) => {
            console.error(err);
            this.saveLoader = false;
            this.toasterService.checkToaster(this.data, 'error');
          }
        })


      }
    } catch (error) {
      console.log(error);
    }
  }
  async getSaveGroupNodes() {
    const appid = localStorage.getItem('appid') || '';
    let groupedNodes: any = []
    //  groupedNodes = await this.dataService.getNodes(this.screenName, JSON.parse(appid), "Table");
    if (groupedNodes.length > 0) {
      this.groupingArray = groupedNodes[groupedNodes.length - 1].data;
    }
  }
  updateModel(data: any) {
    if (this.data?.formType == 'newTab' && this.data?.routeUrl && data.id) {
      if (this.data?.routeUrl.includes('pages')) {
        this.router.navigate([this.data?.routeUrl + '/' + data.id]);
      } else {
        this.router.navigate(['/pages/' + this.data?.routeUrl + '/' + data.id]);
      }
    }
    else if (this.data.doubleClick != false) {
      const dynamicPropertyName = Object.keys(this.form.value)[0]; // Assuming the dynamic property name is the first property in this.form.value
      if (this.form.get(dynamicPropertyName)) {
        let newData: any = JSON.parse(JSON.stringify(data));
        for (const key in data) {
          const filteredData = this.tableHeaders.find((header: any) => header.key === key);

          if (filteredData && filteredData?.dataType === "multiselect") {
            newData[key] = newData[key]?.includes(',') ? newData[key].split(',') : ((newData[key] == undefined || newData[key] == '') ? [] : [newData[key]]);
          }
          else if (filteredData && filteredData?.dataType === "rangePicker") {
            newData[key] = newData[key]?.includes(',') ? newData[key].split(',') : ((newData[key] == undefined || newData[key] == '') ? [] : [newData[key]]);
          }
          else if (filteredData && filteredData?.dataType === "datetime-local") {
            newData[key] = newData[key] ? new Date(newData[key]) : ((newData[key] == undefined || newData[key] == '') ? [] : [newData[key]]);
          }
        }
        let makeModel = JSON.parse(JSON.stringify(this.formlyModel));

        if (this.formlyModel) {
          for (const key in this.formlyModel) {
            if (this.formlyModel.hasOwnProperty(key)) {
              if (typeof this.formlyModel[key] === 'object') {
                for (const key1 in this.formlyModel[key]) {
                  if (newData[key1])
                    makeModel[key][key1] = newData[key1]
                }
              }
              else {
                if (newData[key.split('.')[1]])
                  makeModel[key] = newData[key.split('.')[1]];
              }
            }
          }
        }
        this.formlyModel = makeModel;
        this.form.patchValue(this.formlyModel);
        this.form.get(dynamicPropertyName)?.patchValue(this.formlyModel);
        this.cdr.detach;
        this.cdr.detectChanges;
      }
    }
  }
  onClickRow(api: string, item: any) {
    if (api) {
      // this.requestSubscription = this.builderService.genericApis(api).subscribe({
      //   next: (res: any) => {
      //     this.requestSubscription = this.builderService.genericApisDeleteWithId(api, item.id).subscribe({
      //       next: (res: any) => {
      //         this.requestSubscription = this.builderService.genericApisPost(api, item).subscribe({
      //           next: (res: any) => {
      //             res;
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
      console.log(JSON.stringify(item));
    }
  }
  onClickColumn(api: string, item: any) {
    // this.requestSubscription = this.builderService.genericApisWithId(api, item.key).subscribe({
    //   next: (res: any) => {
    //     this.requestSubscription = this.builderService.genericApisDeleteWithId(api, res[0].id).subscribe({
    //       next: (res: any) => {
    //         this.requestSubscription = this.builderService.genericApisPost(api, item).subscribe({
    //           next: (res: any) => {
    //             res;
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
    console.log("Column Click " + name);
  }
  gridRuleData: any[] = [];
  gridInitilize() {

    // let getRes: any = {
    //   data: [
    //     {
    //       "id": {
    //         "$oid": "649bce85e4823f1628e266c1"
    //       },
    //       "businessRule": [
    //         {
    //           "if": "id == 1",
    //           "then": [
    //             "id == (id-id)"
    //           ]
    //         }
    //       ],
    //       "businessRuleData": '[{"target":"status","opratorForTraget":"==","resultValue":"","ifRuleMain":[{"ifCondition":"status","oprator":"==","isGetValue":true,"getValue":"open","condType":"","conditional":[]}],"thenCondition":[],"getRuleCondition":[{"ifCondition":"status","oprator":"==","target":"status","referenceId":"","referenceOperator":"","referenceColor":"","referenceColumnColor":"#EF4444","condition":"","multiConditionList":[]}]},{"target":"status","opratorForTraget":"==","resultValue":"","ifRuleMain":[{"ifCondition":"status","oprator":"==","isGetValue":true,"getValue":"completed","condType":"","conditional":[]}],"thenCondition":[],"getRuleCondition":[{"ifCondition":"status","oprator":"==","target":"status","referenceId":"","referenceOperator":"","referenceColor":"","referenceColumnColor":"#EF4444","condition":"","multiConditionList":[]}]}]',
    //       "gridKey": "gridlist_5ef02c4b",
    //       "gridType": "Body",
    //       "screenName": "Card",
    //       "screenBuilderId": {
    //         "$oid": "64901e0007e01828b29b0146"
    //       },
    //     }
    //   ]
    // };
    // this.applyBusinessRule(getRes, this.data);
    // this.loadTableData();
    if (this.screenId && this.gridRuleData.length == 0) {
      const { jsonData, newGuid } = this.socketService.makeJsonDataById('GridBusinessRule', this.screenId, '2002');
      this.dataSharedService.saveDebugLog('GridBusinessRule', newGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe(((res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata
          if (res.isSuccess) {
            if (res.data.length > 0) {
              this.gridRuleData = res.data || [];
              // this.formlyModel['input34d5985f']='1313'
              this.applyBusinessRule(res.data, this.data);
            }
            // this.pageChange(1);
            // this.loadTableData();
          } else
            this.toasterService.checkToaster(this.data, 'error');
        }

      }));
    }
    else if (this.gridRuleData.length > 0) {
      this.applyBusinessRule(this.gridRuleData, this.data);
    }
  }
  applyBusinessRule(ruleData: any, data: any) {
    let gridFilter = ruleData.filter((a: any) => a.gridtype == 'Body');
    for (let m = 0; m < gridFilter.length; m++) {
      if (gridFilter[m].gridkey == data.key && this.tableData) {
        const objRuleData = gridFilter[m].businessruledata?.json;
        for (let index = 0; index < objRuleData.length; index++) {
          if (this.tableData.length > 0) {
            // const elementv1 = objRuleData[index].ifRuleMain;
            const elementv1 = objRuleData[index];
            let checkType = Object.keys(this.tableData[0]).filter(a => a == elementv1.target);
            if (checkType.length == 0) {
              console.log("No obj Found!")
            }
            else {
              for (let j = 0; j < this.displayData.length; j++) {
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
                      let firstValue = this.displayData[j][element.ifCondition] ? this.displayData[j][element.ifCondition] : "0";
                      let appendString = element.conditional.length > 0 ? " ( " : ' ';
                      if (ruleIndex == 0) {
                        query = appendString + firstValue + element.oprator + element.getValue
                      } else {
                        query += appendString + firstValue + element.oprator + element.getValue
                      }
                    }
                    for (let k = 0; k < element.conditional.length; k++) {
                      const conditionElement = element.conditional[k];
                      let check = this.displayData[j][conditionElement.condifCodition] ? this.displayData[j][conditionElement.condifCodition] : '0';
                      query += ' ' + conditionElement.condType + ' ' + check + conditionElement.condOperator + conditionElement.condValue;
                      if (k + 1 == element.conditional.length)
                        query += " ) " + element.condType
                    }
                  }
                  else {
                    if (element.oprator == 'NotNull')
                      query = "1==1"
                    else {
                      let firstValue = this.displayData[j][element.ifCondition] ? this.displayData[j][element.ifCondition] : "0";
                      query = firstValue + element.oprator + element.getValue
                    }
                    for (let k = 0; k < element.conditional.length; k++) {
                      const conditionElement = element.conditional[k];
                      let check = this.displayData[j][conditionElement.condifCodition] ? this.displayData[j][conditionElement.condifCodition] : '0';
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
                      if (this.displayData[j][elementv2.ifCondition])
                        this.displayData[j][elementv1.target] = this.evaluateGridConditionOperator(`${this.displayData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${this.displayData[j][elementv2.target]}`);
                      // if (elementv1.getRuleCondition[k].referenceColor)
                      this.displayData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                      this.displayData[j]['textColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                      this.displayData[j]['backColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                      // if (elementv1.getRuleCondition[k].referenceColumnColor) {
                      this.displayData[j]['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                      this.displayData[j]['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                      this.displayData[j]['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                      this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                      // }
                    }
                    else {
                      if (k > 0) {
                        if (this.displayData[j][elementv2.ifCondition])
                          this.displayData[j][elementv1.target] = this.evaluateGridConditionOperator(`${this.displayData[j][elementv1.target]} ${elementv1.getRuleCondition[k - 1].referenceOperator} ${this.displayData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${this.displayData[j][elementv2.target]}`);
                        // if (elementv1.getRuleCondition[k].referenceColor)
                        this.displayData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                        this.displayData[j]['textColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                        this.displayData[j]['backColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                        // if (elementv1.getRuleCondition[k].referenceColor) {
                        this.displayData[j]['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                        this.displayData[j]['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                        this.displayData[j]['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                        this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                        // }
                      }
                      else
                        // if (elementv1.getRuleCondition[k].referenceColor)
                        this.displayData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                      this.displayData[j]['textColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                      this.displayData[j]['backColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                      this.displayData[j]['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                      this.displayData[j]['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                      this.displayData[j]['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                      this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                      if (elementv1.getRuleCondition[k].referenceColumnColor) {
                        // data.tableHeaders.filter((check: any) => !check.hasOwnProperty('dataType'));
                        let head = data.tableHeaders.find((a: any) => a.name == elementv1.target)
                        if (head) {
                          this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                          head['dataType'] = 'objectType';
                          head['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                          head['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                          head['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                        }
                      }
                      else {
                        if (this.displayData[j][elementv2.ifCondition])
                          this.displayData[j][elementv1.target] = this.evaluateGridConditionOperator(`${this.displayData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${this.displayData[j][elementv2.target]}`);

                      }
                    }
                    if (elementv2.multiConditionList.length > 0) {
                      for (let l = 0; l < elementv2.multiConditionList.length; l++) {
                        const elementv3 = elementv2.multiConditionList[l];
                        const value = this.displayData[j][elementv1.target];
                        this.displayData[j][elementv1.target] = this.evaluateGridConditionOperator(`${value} ${elementv3.oprator} ${this.displayData[j][elementv3.target]}`);
                        // if (elementv1.getRuleCondition[k].referenceColumnColor) {
                        this.displayData[j]['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                        this.displayData[j]['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                        this.displayData[j]['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                        this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                        // }
                      }
                    }
                  }
                  for (let k = 0; k < elementv1.thenCondition.length; k++) {
                    const elementv2 = elementv1.thenCondition[k];
                    for (let l = 0; l < elementv2.getRuleCondition.length; l++) {
                      const elementv3 = elementv2.getRuleCondition[l];
                      this.displayData[j][elementv2.thenTarget] = this.evaluateGridConditionOperator(`${this.displayData[j][elementv3.ifCondition]} ${elementv3.oprator} ${this.displayData[j][elementv3.target]}`);
                      if (elementv3.multiConditionList.length > 0) {
                        for (let m = 0; m < elementv3.multiConditionList.length; m++) {
                          const elementv4 = elementv3.multiConditionList[m];
                          const value = this.displayData[j][elementv2.thenTarget];
                          this.displayData[j][elementv2.thenTarget] = this.evaluateGridConditionOperator(`${value} ${elementv4.oprator} ${this.displayData[j][elementv4.target]}`);
                          // if (elementv1.getRuleCondition[k].referenceColumnColor) {
                          this.displayData[j]['columnColor'] = elementv1.getRuleCondition[k].referenceColor;
                          this.displayData[j]['columnTextColor'] = elementv1.getRuleCondition[k].referenceTextColor;
                          this.displayData[j]['columnBackColor'] = elementv1.getRuleCondition[k].referenceBackColor;
                          this.displayData[j]['colorDataType'] = this.displayData[j][elementv1.target];
                          // }
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
    }
    let headerFilter = ruleData.filter((a: any) => a.gridType == 'Header');
    for (let m = 0; m < headerFilter.length; m++) {
      if (headerFilter[m].gridKey == data.key && this.tableData) {
        for (let index = 0; index < headerFilter[m].businessRuleData.length; index++) {
          const elementv1 = headerFilter[m].businessRuleData[index];
          let checkType = Object.keys(this.tableData[0]).filter(a => a == elementv1.target);
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
                    let checkType = Object.keys(this.tableData[0]).filter(a => a == elementv3.ifCondition);
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
    let footerFilter = ruleData.filter((a: any) => a.gridType == 'Footer');
    for (let m = 0; m < footerFilter.length; m++) {
      if (footerFilter[m].gridKey == data.key && this.tableData) {
        for (let index = 0; index < footerFilter[m].businessRuleData.length; index++) {
          const elementv1 = footerFilter[m].businessRuleData[index];
          let checkType = Object.keys(this.tableData[0]).filter(a => a == elementv1.target);
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
                    let checkType = Object.keys(this.tableData[0]).filter(a => a == elementv3.ifCondition);
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
  evaluateGridConditionOperator(condition: string): any {
    const operators: { [key: string]: (a: any, b: any) => any } = {
      "+": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a + b : null,
      "-": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a - b : null,
      "*": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a * b : null,
      "/": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a / b : null,
      "==": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a == b : null,
      "%": (a: any, b: any) => this.isNumeric(a) && this.isNumeric(b) ? a % b : null,
    };

    const parts = condition.split(/(\+|-|\*|\/|%|==)/).map(part => part.trim());
    const leftOperand = parts[0];
    const operator = parts[1];
    const rightOperand = parts[2];

    const leftValue = this.isNumeric(leftOperand) ? Number(leftOperand) : null;
    const rightValue = this.isNumeric(rightOperand) ? Number(rightOperand) : null;

    return operators[operator](leftValue, rightValue);
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
  columnName: any;
  isHeaderVisible = false;
  // addColumn(): void {
  //   this.isVisible = true;
  // };
  // handleOk(): void {
  addColumn(): void {
    const id = this.tableData.length - 1;
    const newRow = JSON.parse(JSON.stringify(this.tableData[0]));
    newRow["id"] = this.tableData[id].id + 1;
    this.tableData.push(newRow);
    this.displayData = [...this.tableData];
    // if (this.tableData.length > 0) {
    //   const firstObjectKeys = Object.keys(this.tableData[0]);
    //   for (let index = 0; index < firstObjectKeys.length; index++) {
    //     const element = firstObjectKeys[index];
    //     if (element.toLocaleLowerCase() == this.columnName.toLocaleLowerCase())
    //       return alert('this Column is already Exsist')
    //   }
    //   this.tableHeaders.push(
    //     {
    //       name: this.columnName,
    //       sortOrder: null,
    //       // sortFn: "(a, b) => a.name.localeCompare(b.name)",
    //       sortDirections: [
    //         "ascend",
    //         "descend",
    //         null
    //       ],
    //       "filterMultiple": true
    //     });
    //   for (let j = 0; j < this.data.tableData.length; j++) {
    //     this.data.tableData[j][this.columnName.charAt(0).toLowerCase() + this.columnName.slice(1)] = 0;
    //   }
    //   this.loadTableData();
    //   this.columnName = null;
    // }
    // this.isVisible = false;
  }

  addRow(): void {
    if (this.configurationTable == false || this.configurationTable == undefined) {
      if (this.displayData.length > 0) {
        let findAddrow = this.findInlineSaveExist(this.displayData);
        if (findAddrow) {
          this.toasterService.checkToaster(this.data, 'warning');
          // this.toastr.warning('You already add the row and did not save it', { nzDuration: 3000 });
          return;
        }
      }
    }
    if (this.tableData.length == 0) {
      if (this.tableHeaders.length > 0) {
        const resizingData = localStorage.getItem(this.screenId);
        if (resizingData) {
          const parseResizingData = JSON.parse(resizingData);
          this.tableHeaders.forEach((element1: any) => {
            const matchingElement = parseResizingData.find((element: any) => element.key === element1.key);
            if (matchingElement) {
              element1.width = matchingElement.width;
            }
          });
        }
        let obj: any = {};
        this.tableHeaders.forEach((item: any) => {
          if (item.key == 'expand') {
            obj[item.key] = false;
          }
          else if (item.key == 'parentid') {
            obj[item.key] = this.mappingId ? this.mappingId : '';
          }
          else {
            obj[item.key] = '';
          }
        });
        if (this.configurationTable) {
          this.tableData.push(obj);
        }
        else if (this.childDataObj) {
          if (this.childDataObj.rowObj) {
            let newRecord = this.childDataObj.rowObj;
            newRecord['editabeRowAddNewRow'] = true;
            newRecord['expand'] = false;
            this.tableData.push(newRecord);
          } else {
            obj['editabeRowAddNewRow'] = true;
            this.tableData.push(obj);
          }
        }
        else {
          obj['editabeRowAddNewRow'] = true;
          this.tableData.push(obj);
        }
      }
      this.displayData = [...this.tableData];
      return;
    }
    const id = this.displayData.length - 1;
    if (id == -1) {
      let row = {
        id: 1, name: '',
      }
      this.displayData = [...this.tableData, row];
    }
    else {
      if (this.tableData.length == 0) {
        this.tableData = [...this.displayData]
      }
      const newRow = JSON.parse(JSON.stringify(this.tableData[0]));
      newRow["id"] = this.tableData[id].id + 1;
      delete newRow?.id;
      newRow['editabeRowAddNewRow'] = true;
      this.tableData.unshift(newRow);
      this.displayData = [...this.tableData];
      if (!this.pageSize)
        this.pageSize = this.data.end;
      this.updateDisplayData();
    }
  };
  deleteRow(item: any): void {
    let data = JSON.parse(JSON.stringify(item));
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.deletes && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }
    delete data.children;
    delete data.expand;
    if (this.screenName != undefined) {
      if (this.data?.appConfigurableEvent && this.data?.appConfigurableEvent?.length > 0) {
        // Find the 'delete' event in appConfigurableEvent
        const deleteEvent = this.data.appConfigurableEvent.find((item: any) => item.rule.includes('delete'));

        if (deleteEvent) {
          this.saveLoader = true;
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('5007', deleteEvent.id);
          const jsonData1 = {
            postType: 'put',
            modalData: data, metaInfo: jsonData.metaInfo
          };
          this.dataSharedService.saveDebugLog('delete', RequestGuid)
          this.socketService.Request(jsonData1);
          this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              this.saveLoader = false;
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                if (res.isSuccess) {
                  // Data successfully deleted
                  // this.handleDataDeletion(data);
                  // this.pageChange(this.pageSize);
                  this.recallApi();
                  this.toasterService.checkToaster(this.data, 'success');
                } else {
                  this.toasterService.checkToaster(this.data, 'error');
                  // Data not updated
                  // this.toastr.warning(res.message || "Data is not updated", { nzDuration: 3000 });
                }
              }

            },
            error: (err) => {
              this.saveLoader = false;
              this.toasterService.checkToaster(this.data, 'error');
            }
          });
        }
      } else {
        // Handle the case where appConfigurableEvent is not defined
        this.handleDataDeletion(data);
      }
    }
    else {
      this.handleDataDeletion(data);
      this.toasterService.checkToaster(this.data, 'success');
    }
  };

  async startEdit(data: any): Promise<void> {
    if (data?.editabeRowAddNewRow == true) { return; }
    this.editId = data.id;
    let newData = JSON.parse(JSON.stringify(data))
    this.editData = newData;
    try {
      const filteredHeaders = this.tableHeaders.filter((item: any) => item.dataType === 'repeatSection' && item.callApi);
      if (filteredHeaders && filteredHeaders.length > 0) {
        filteredHeaders.forEach((header: any) => {
          if (!this.displayData.some(item => item.hasOwnProperty(header.key + '_list'))) {
            try {
              // this.dataSharedService.pagesLoader.next(true);
              let splitApi;
              let parentId;
              if (header?.callApi.includes('getexecute-rules/'))
                splitApi = header?.callApi.split('getexecute-rules/')[1];
              else splitApi = header?.callApi;
              if (splitApi.includes('/')) {
                const getValue = splitApi.split('/');
                splitApi = getValue[0]
                parentId = getValue[1];
              }

              const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId);
              this.dataSharedService.saveDebugLog('startEdit', RequestGuid)
              this.socketService.Request(jsonData);
              this.socketService.OnResponseMessage().subscribe({
                next: (res) => {
                  // this.dataSharedService.queryId = '';
                  if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                    this.dataSharedService.pagesLoader.next(false);
                    res = res.parseddata.apidata;
                    if (res.data?.length > 0) {
                      const propertyNames = Object.keys(res.data[0]);
                      const result = res.data.map((item: any) => {
                        const newObj: any = {};
                        const propertiesToGet: string[] = ('id' in item && 'name' in item) ? ['id', 'name'] : Object.keys(item).slice(0, 2);
                        propertiesToGet.forEach((prop) => {
                          newObj[prop] = item[prop];
                        });
                        return newObj;
                      });

                      const finalObj = result.map((item: any) => ({
                        label: item.name || item[propertyNames[1]],
                        value: item.name || item[propertyNames[1]],
                      }));
                      this.makeOptions(this.displayData, header.key + '_list', finalObj);
                      let newData = this.displayData.find((a: any) => a.id == data.id)
                      this.editData = { ...newData };
                    }
                  }

                },
                error: (err) => {
                  console.error(err);
                  this.dataSharedService.pagesLoader.next(false);
                  this.toasterService.checkToaster(this.data, 'error');
                }
              })
            } catch (err) {
              this.dataSharedService.pagesLoader.next(false);
              console.error(err); // Log the error to the console
              this.toasterService.checkToaster(this.data, 'error');
            }
          }
        });
      }
    } catch (error) {
      console.error("An error occurred in try-catch:", error);
      // Handle the error appropriately, e.g., show an error message to the user.
    }
  }

  stopEdit(): void {
    this.editId = null;
  }

  loadTableData() {
    this.getResizingAndColumnSortng();
    if (this.tableData.length > 0) {
      if (!this.tableData[0].id) {
        let newId = 0;
        this.tableData = this.tableData.map((j: any) => {
          newId++;
          return {
            id: newId,
            ...j,
          };
        });
      }
      if (!this.data['tableKey'] || this.data['tableKey']?.length == 0) {
        const firstObjectKeys = Object.keys(this.tableData[0]);
        this.data['tableKey'] = firstObjectKeys.map(key => ({ key: key }));
      }
      this.data['tableKey'] = this.data['tableKey'].filter((header: any) => header.name !== 'color');
      this.data['tableKey'] = this.data['tableKey'].filter((header: any) => header.name !== 'children');
      this.footerData = this.tableHeaders;
      if (!this.tableHeaders || !this.footerData) {
        this.tableHeaders = this.data['tableKey'];
        this.footerData = this.data['tableKey'];
      }
      // if (!this.tableData.some((a: any) => a.children)) {
      //   this.tableHeaders = this.tableHeaders.filter((head: any) => head.name !== 'expand');
      // }
    }
    if (this.tableHeaders.length > 0) {
      if (this.tableHeaders.some((header: any) => ['srNo', 'dataType', 'isAllowGrouping'].includes(header.key)) && this.data) {
        this.data['startFreezingNumber'] = 3;
      }
    }


    if (!this.data) {
      const newNode = {
        nzFooter: "",
        nzTitle: "",
        nzPaginationPosition: "bottom",
        nzPaginationType: "default",
        nzLoading: false,
        nzFrontPagination: true,
        start: 1,
        end: 10,
        nzShowPagination: true,
        nzBordered: true,
        showColumnHeader: true,
        noResult: false,
        nzSimple: false,
        nzSize: 'default',
        nzShowSizeChanger: false,
        showCheckbox: false,
        expandable: false,
        fixHeader: false,
        rowClickApi: true,
        tableScroll: false,
        fixedColumn: false,
        sort: true,
        filter: true,
      }
      this.data = newNode;
    }
    if (this.tableData.length > 0 && this.childDataObj) {
      if (!this.data.end) {
        this.data.end = 10;
      }
      this.data.pageIndex = 1;
      this.data.totalCount = this.childDataObj.count;
      this.data.masteTotalCount = this.childDataObj.count;
      this.showPagination = true;
      // this.pageChange(1);
    }

  }
  handleCancel(): void {
    this.isHeaderVisible = false;
  }
  showModal(type: any): void {
    this.GridType = type;
    this.isHeaderVisible = true;
  }
  handleOk(): void {
    this.isHeaderVisible = false;
  }
  getSumOfRow(data: any) {
    if (data.sum) {
      if (this.tableData.some((item: any) => item.hasOwnProperty(data.key.toLowerCase()))) {
        const sum = this.tableData.reduce((acc: any, curr: any) => {
          acc += curr[data.key.toLowerCase()];
          return acc;
        }, 0);
        return sum;
      } else {
        return '';
      }
      return 0
    }
    else {
      return '';
    }
  }
  getHeader() {
    if (this.tableData) {
      const firstObjectKeys = Object.keys(this.tableData[0]);
      this.data['tableKey'] = firstObjectKeys.map(key => ({ name: key }));
      this.data['tableKey'] = this.data['tableKey'].filter((header: any) => header.name !== 'color');
    }
  }
  getChildrenData() {
    const childKeys = this.tableData.reduce((acc: any, obj: any) => {
      if (obj.children) {
        obj.children.forEach((child: any) => {
          Object.keys(child).forEach(key => {
            if (!acc.includes(key)) {
              acc.push(key);
            }
          });
        });
      }
      return acc;
    }, []);
    return childKeys;
  }
  save() {

    this.editId = '';
    if (this.configurationTable) {
      this._dataSharedService.setData(this.displayData);
      if (this.data.doubleClick == false)
        this._dataSharedService.saveGridData(this.displayData);
      this.toasterService.checkToaster(this.data, 'success');
    } else {
      let findInlineSave = this.findInlineSaveExist(this.displayData);
      if (findInlineSave) {
        if (this.data.appConfigurableEvent)
          if (this.data.appConfigurableEvent.length > 0) {
            let findAction = this.data.appConfigurableEvent.find((a: any) => a.componentfrom == this.data.key && a.rule.includes('post_') && a.action == 'click');
            if (findAction) {
              delete findInlineSave.id;
              const model = {
                screenId: this.screenName,
                postType: 'post',
                modalData: findInlineSave
              };
              this.saveLoader = true;
              const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', findAction.arid);
              const jsonData1 = {
                postType: 'post',
                modalData: findInlineSave, metaInfo: jsonData.metaInfo
              };
              this.dataSharedService.saveDebugLog('save', RequestGuid)
              this.socketService.Request(jsonData1);

              this.socketService.OnResponseMessage().subscribe({
                next: (res) => {
                  if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                    res = res.parseddata.apidata;
                    if (res) {
                      this.saveLoader = false;
                      if (res[0]?.error) {
                        this.toasterService.checkToaster(this.data, 'error');
                        return;
                      }
                      const successMessage = (model.postType === 'post') ? 'Save Successfully' : 'Update Successfully';
                      this.toasterService.checkToaster(this.data, 'success');
                      this.recallApi();
                    }
                  }
                },
                error: (err) => {
                  // Handle the error
                  this.toasterService.checkToaster(this.data, 'error');
                  console.error(err);
                  this.dataSharedService.pagesLoader.next(false);
                  this.saveLoader = false; // Ensure to set the loader to false in case of error
                },
              });
            }
          }
      }
    }
  }

  checkAll(value: boolean): void {
    this.tableData.forEach((data: any) => {
      if (!data.disabled) {
        data.checked = value;
      }
    });
    this.refreshStatus();
  }

  refreshStatus(): void {
    const validData = this.tableData.filter((value: any) => !value.disabled);
    const allChecked = validData.length > 0 && validData.every((value: any) => value.checked === true);
    const allUnChecked = validData.every((value: any) => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = !allChecked && !allUnChecked;
  }
  getChildKeys(obj: any): any {
    const keys: any = {};
    const firstObjectKeys = Object.keys(obj);
    keys.parent = firstObjectKeys.map(key => ({ name: key }));
    if (obj.children) {
      keys.children = this.getChildKeys(obj.children[0])
    }
    return keys;
  }

  getParentChildrenKeys(data: any[]): any[] {
    const result: any[] = [];
    if (data.length > 0) {
      const keys = this.getChildKeys(data[0]);
      result.push(keys);
    };
    return result;
  }

  isMyDataArray(data: any): boolean {
    return Array.isArray(data);
  }
  isEditing(entry: any): boolean {
    return this.editingEntry === entry;
  }

  editValue(entry: any): void {
    this.editingEntry = entry;
  }

  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }
  generateSqlQuery(input: any[]): string {
    return input
      .map(({ key, value }) => {
        const valuesArray = value.split(',').map((val: any) => `'${val}'`).join(', ');
        return `${key} IN (SELECT unnest(ARRAY[${valuesArray}]))`;
      })
      .join(' AND ');
  }

  onPageIndexChange(index: number): void {
    if (this.tableHeaders.length === 0) {
      const firstObjectKeys = Object.keys(this.tableData[0]);
      this.data['tableKey'] = firstObjectKeys.map(key => ({ name: key })).filter(header => header.name !== 'color' && header.name !== 'children');
      this.tableHeaders = this.data['tableKey'];
      this.footerData = this.tableHeaders;
    }

    if (this.data.serverSidePagination) {
      let pagination = `?page=${index}&pageSize=${this.data?.end}`;
      let Rulepage: any = index;
      let RulepageSize: any = this.data?.end;

      if (this.data['searchValue']) {
        pagination += `&search=${this.data['searchValue']}`;
      }
      let filtersData = null;
      if (this.filteringHeadArray.length > 0) {
        const transformedOutput = this.filteringHeadArray.map(({ key, filterArray }) => ({
          key,
          value: filterArray.filter(({ filter }: any) => filter).map(({ value }: any) => value).join(',')
        }));
        filtersData = this.generateSqlQuery(transformedOutput);
        pagination += `&filters=${filtersData}`;
        Rulepage = localStorage.getItem('tablePageNo') || 1;
        RulepageSize = localStorage.getItem('tablePageSize') || 10;
      }

      this.pageSize = this.data.end;
      this.saveLoader = true;

      if (this.data?.targetId) {
        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', this.data.eventActionconfig.arid, this.data?.targetId, Rulepage, RulepageSize);
        this.dataSharedService.saveDebugLog('onPageIndexChange', RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (response) => {
            if (response.parseddata.requestId === RequestGuid && response.parseddata.isSuccess) {
              response = response.parseddata.apidata;
              this.handleSocketResponse(response);
            }
          },
          error: (error) => {
            this.handleSocketError(error);
          }
        });
      } else {
        let url = 'knex-query/getexecute-rules/' + this.data.eventActionconfig.arid;
        if (this.childDataObj) {
          let findExpandKeyHead = (this.data.tableHeaders || this.tableHeaders).find((head: any) => head.key == 'expand');
          if (findExpandKeyHead) {
            url = findExpandKeyHead.callApi + '/' + this.childDataObj.arid;
          }
        }
        let splitApi = url.includes('getexecute-rules/') ? url.split('getexecute-rules/')[1] : url;
        let parentId;

        if (splitApi.includes('/')) {
          const [splitApiValue, parentIdValue] = splitApi.split('/');
          splitApi = splitApiValue;
          parentId = parentIdValue;
        }

        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId, Rulepage, RulepageSize, null, null, this.data['searchValue'], filtersData);
        this.dataSharedService.saveDebugLog('onPageIndexChange', RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (response) => {
            if (response.parseddata.requestId === RequestGuid && response.parseddata.isSuccess) {
              response = response.parseddata.apidata;
              this.handleSocketResponse(response);
            }
          },
          error: (error) => {
            this.handleSocketError(error);
          }
        });
      }
    } else {
      this.pageChange(index);
    }
  }

  private handleSocketResponse(response: any): void {
    this.saveLoader = false;
    if (response.isSuccess) {
      this.tableData = response.data.map((element: any) => {
        element.id = element.id?.toString();
        return this.data.tableHeaders.some((header: any) => header.key === 'expand') ? { 'expand': false, ...element } : element;
      });

      this.displayData = this.tableData;
      this.updateGridPagination();
      this.gridInitilize();
    }
  }

  private handleSocketError(error: any): void {
    this.saveLoader = false;
    this.toasterService.checkToaster(this.data, 'error');
  }

  pageChange(index: number) {
    this.data.pageIndex = index;
    if (!this.pageSize)
      this.pageSize = this.data.end ? this.data.end : this.tableData.length;
    this.updateDisplayData();
  }
  updateDisplayData(): void {
    if (this.data?.serverSidePagination) {
      const start = (this.data.pageIndex - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.start = start == 0 ? 1 : ((this.data.pageIndex * this.pageSize) - this.pageSize) + 1;
      this.end = this.displayData.length == this.data.end ? (this.data.pageIndex * this.data.end) : this.data.totalCount;
    } else {
      const start = (this.data.pageIndex - 1) * this.pageSize;
      const end = start + this.pageSize;

      this.start = start === 0 ? 1 : (this.data.pageIndex * this.pageSize) - this.pageSize + 1;
      this.displayData = this.tableData.slice(start, end);
      this.end = this.displayData.length !== this.data.end ? this.tableData.length : this.data.pageIndex * this.pageSize;

      this.data.totalCount = this.tableData.length;
    }
    //old
    // const start = (this.data.pageIndex - 1) * this.pageSize;
    // const end = start + this.pageSize;

    // this.start = start === 0 ? 1 : (this.data.pageIndex * this.pageSize) - this.pageSize + 1;
    // this.displayData = this.tableData.slice(start, end);
    // this.end = this.displayData.length !== this.data.end ? this.tableData.length : this.data.pageIndex * this.pageSize;


    // seperate
    // this.data.totalCount = this.tableData.length;

    // Updating this.tableData directly without creating a new reference
    // this.tableData = JSON.parse(JSON.stringify(this.tableData)); // Avoid reassigning if not necessary
    // this.displayData = JSON.parse(JSON.stringify(this.displayData)); // Avoid reassigning if not necessary

    // Trigger change detection by marking for check and applying change detection
    // this.cdr.markForCheck();
    // this.cdr.detectChanges();
  }

  updateGridPagination() {
    const start = (this.data.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.start = start == 0 ? 1 : ((this.data.pageIndex * this.pageSize) - this.pageSize) + 1;
    this.end = this.displayData.length == this.data.end ? (this.data.pageIndex * this.data.end) : this.data.totalCount;
    // this.data.totalCount = this.tableData.length;
  }

  checkTypeData(item: any, header: any) {
    if (header?.key == 'expand') {
      if (item?.expand) {
        item.expand = false;
      } else {
        item.expand = true;
        this.callExpandAPi(item, item.expand);
      }
    } else {
      if (header?.callApi != '' && header?.callApi != null && (header?.dataType != 'repeatSection' || header?.dataType == '' || header?.dataType == undefined)) {
        this.showChild = false;
        if (this.data?.openComponent == 'drawer') {
          this.editId = null;
          this.dataSharedService.taskmanagerDrawer.next(false);
          const drawer = this.findObjectByTypeBase(this.data, "drawer");
          if (drawer?.eventActionconfig) {
            let newData: any = JSON.parse(JSON.stringify(item));
            const dataTitle = this.data.title ? this.data.title + '.' : '';
            newData['parentid'] = newData.id;
            const userData = JSON.parse(localStorage.getItem('user')!);
            newData.id = '';
            newData['organizationid'] = this.dataSharedService.decryptedValue('orgid') || '';
            newData['applicationid'] = this.dataSharedService.decryptedValue('appid') || '';
            newData['createdby'] = userData.username;
            // Get the current date and time
            const currentDate = new Date();

            // Format the date and time as "YYYY-MM-DD HH:mm:ss.sss"
            const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}.${currentDate.getMilliseconds().toString().padStart(3, '0')}`;

            // Now, you can save 'formattedDate' in your SQL database
            newData.datetime = formattedDate;


            for (const key in newData) {
              if (Object.prototype.hasOwnProperty.call(newData, key)) {
                if (newData[key] == null) {
                  this.formlyModel[dataTitle + key] = '';
                } else {
                  this.formlyModel[dataTitle + key] = newData[key];
                }
                for (const obj of [this.formlyModel, /* other objects here */]) {
                  if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj[key] = newData[key];
                  }
                }
              }
            }
            drawer.eventActionconfig['parentId'] = item.id;
          }
          if (window.location.href.includes('/pages')) {
            if (this.drawerChild.length == 0 && drawer.children.length > 0) {
              this.drawerChild = JSON.parse(JSON.stringify(drawer.children))
            }
            drawer.children = JSON.parse(JSON.stringify(this.drawerChild));

            if (window.location.href.includes('/pages')) {
              this.data = JSON.parse(JSON.stringify(this.data));
            }
          }

          this.showChild = true;
          drawer['visible'] = true;
        }
      }
      else if (this.configurationTable) {
        this.startEdit(item)
      }
    }

  }
  openQrCode(data: any, item: any) {
    if (data == 'N/A') {
      this.toasterService.checkToaster(this.data, 'error');
      this.toastr.warning('Request is not approved!', {
        nzDuration: 3000,
      });
      return;
    }
    else if (data) {
      const modal =
        this.modal.create<QrCodeComponent>({
          nzTitle: 'Qr Code Scan',
          nzWidth: '250px',
          nzContent: QrCodeComponent,
          nzComponentParams: {
            model: data,
            item: item,
          },
          // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
          nzFooter: [],
        });
      // const instance = modal.getContentComponent();
      modal.afterClose.subscribe((res) => {
        if (res) {

        }
      });
    }
    else {
      this.toasterService.checkToaster(this.data, 'error');
      // this.toastr.warning('Path did not exist', {
      //   nzDuration: 3000,
      // });
    }
  }
  drawOpen: boolean = false;
  loadApiData(check: number): void {
    this.drawOpen = false;
    const storedPageIndex = parseInt(localStorage.getItem('tablePageNo')!) || 1;

    if (check) {
      this.drawOpen = true;

      if (this.data.pageIndex !== 1 || check !== -1) {
        this.data.pageIndex = storedPageIndex + check;
        this.onPageIndexChange(this.data.pageIndex);
      }
    } else {
      this.onPageIndexChange(storedPageIndex);
    }
  }

  transform(dateRange: string): any {
    if (dateRange) {
      if (dateRange.includes('GMT+0500') && dateRange) {
        // Split the date range by ","
        const dateParts = dateRange.split(',');

        if (dateParts.length >= 2) {
          // Extract the start and end date parts
          const startDate = dateParts[0].trim();
          const endDate = dateParts[1].trim();

          // Format the start and end dates
          const formattedStartDate = this.formatDate(startDate);
          const formattedEndDate = this.formatDate(endDate);

          // Return the formatted date range
          return `${formattedStartDate} - ${formattedEndDate}`;
        } else {
          // If there are not enough parts, return the original date range
          return dateRange;
        }
      }
      return null;
    }
    return null;
  }

  private formatDate(dateString: string): any {
    const date = new Date(dateString);
    return new DatePipe('en-US').transform(date, 'EEE MMM dd yyyy HH:mm:ss');
  }
  tasks: any = [];
  editObj: any = {};
  Object = Object;
  chartData: any[] = [];
  issueReport: any = [];
  userTaskManagement: any = '';
  getTimelIne: any;
  showIssue(data: any): void {
    this.saveLoader = true;
    if (this.data?.appConfigurableEvent) {
      if (this.data?.appConfigurableEvent.length > 0) {
        if (!data?.children) {
          data.children = [];
          const url = this.data?.appConfigurableEvent
            .filter((item: any) => item.actions.some((action: any) => action.submit === 'change'))
            .map((item: any) => item.actions.find((action: any) => action.submit === 'change').url);
          // Create a URL object
          const parsedURL = new URL(url);

          // Extract the pathname
          let path = parsedURL.pathname;

          // Remove the leading slash if it exists
          if (path.startsWith("/")) {
            path = path.substring(1);
          }
          let splitApi;
          if (path.includes('getexecute-rules/'))
            splitApi = path.split('getexecute-rules/')[1];
          else splitApi = path;
          if (splitApi.includes('/')) {
            const getValue = splitApi.split('/');
            splitApi = getValue[0]
          }
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, data.screenId);
          this.dataSharedService.saveDebugLog('ShowIssue', RequestGuid)
          this.socketService.Request(jsonData);
          this.socketService.OnResponseMessage().subscribe({
            next: (res: any) => {
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                this.saveLoader = false;
                this.issueReport['issueReport'] = '';
                this.issueReport['showAllComments'] = false;
                if (res.isSuccess && res.data.length > 0) {
                  const filteredIssues = res.data.filter((rep: any) => rep.componentId === data.componentId);
                  const requiredData = filteredIssues.map(({ __v, _id, ...rest }: any) => ({
                    expand: false,
                    id: _id,
                    // expandable: true,
                    ...rest,
                  }));

                  data.children = requiredData;
                }
              }
            },
            error: (err) => {
              this.issueReport['issueReport'] = '';
              this.issueReport['showAllComments'] = false;
              console.error(err); // Log the error to the console
              this.toasterService.checkToaster(this.data, 'error');
            }
          });
        }
        else {
          console.log("Data");
          console.log("Data");
          const requiredData = data.children.map(({ __v, id, ...rest }: any) => {
            if (rest.children) {
              const childData = rest.children;
              delete rest.children;
              return {
                id: id,
                ...rest,
                children: childData.length > 0 ? childData : undefined,
              };
            } else {
              // If the 'children' property doesn't exist, return the object without it
              return {
                id: id,
                ...rest,
              };
            }
          });
          data.children = requiredData;
        }
      }
    }
  }
  // getTasks() {
  //   this.saveLoader = true;
  //   this.requestSubscription = this.applicationService.getNestCommonAPI('cp/getuserCommentsCurrentMonth/UserComment').subscribe({
  //     next: (res: any) => {
  //       this.saveLoader = false;
  //       if (res.isSuccess && res.data?.length > 0) {
  //         this.tasks = res.data.filter((a: any) => a.parentId == '' || a.parentId == undefined);
  //         let groupedData = this.tasks;
  //         this.tasks = groupedData;
  //         let newData = JSON.parse(JSON.stringify(groupedData));
  //         this.chartData = this.groupDataByStatus(newData)
  //       }
  //     },
  //     error: (err) => {
  //       this.saveLoader = false;
  //       console.error(err); // Log the error to the console
  //       this.toastr.error(`UserComment : An error occurred`, { nzDuration: 3000 });
  //     }
  //   });
  // }
  assignToresponse: any = '';
  // callAssignee(data: any) {
  //   this.requestSubscription = this.applicationService.getNestCommonAPIById('cp/UserAssignTask', data.id).subscribe({
  //     next: (res: any) => {
  //       if (res) {
  //         if (res.data.length > 0) {
  //           this.assignToresponse = res.data[0];
  //           data['dueDate'] = res.data[0]['dueDate'];
  //           data['assignTo'] = res.data[0]['assignTo'];
  //           data['startDate'] = res.data[0]['startDate'];
  //           data['endDate'] = res.data[0]['endDate'];
  //           data['tags'] = res.data[0]['tags'];
  //           // this.toastr.success(`UserAssignTask : ${res.message}`, { nzDuration: 3000 });
  //         } else {
  //           data['dueDate'] = new Date();
  //           data['dueDate'] = data['dueDate'].toISOString().split('T')[0];
  //         }
  //       }
  //     }, error: (err: any) => {
  //       console.error(err); // Log the error to the console
  //       this.toastr.error(`UserAssignTask : An error occurred`, { nzDuration: 3000 });
  //     }
  //   })
  // }
  // updateIssues(updateData: any) {
  //   if (updateData) {
  //     this.getTasks();
  //   }
  // }
  groupDataByStatus(data: any[]): any[] {
    return data.map((weekData) => {
      const statusGroups: { [status: string]: any[] } = {
        open: [],
        completed: [],
        inProgress: [],
        closed: [],
      };

      weekData.issues.forEach((issue: any) => {
        const status = issue.status;

        // Push the issue to the corresponding status array
        if (status in statusGroups) {
          statusGroups[status].push(issue);
        }
      });

      return {
        week: weekData.week,
        issues: statusGroups,
        weekStartDate: weekData.weekStartDate,
        weekEndDate: weekData.weekEndDate,
      };
    });
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
  findAllObjectsByType(data: any, type: any): any[] {
    const foundObjects: any[] = [];

    function searchForType(node: any) {
      if (node) {
        if (node.type && node.type === type) {
          foundObjects.push(node);
        }
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            searchForType(child);
          }
        }
      }
    }

    searchForType(data);
    return foundObjects;
  }
  groupedFunc(data: any, type: any, header: any, allowSaveInLocal?: any) {
    this.saveLoader = true;
    header['grouping'] = type === 'add' ? data : '';

    try {
      if (this.groupingData.length == 0) {
        this.groupingData = this.tableData
      }

      if (type === 'add') {
        if (this.groupingArray.some((group: any) => group === data)) {
          return; // Data is already grouped, no need to proceed
        }
      }

      if (type === 'add') {
        this.groupingArray.push(data);
      }
      else if (type === 'remove') {
        const indexToRemove = this.groupingArray.indexOf(data);
        if (indexToRemove !== -1) {
          this.groupingArray.splice(indexToRemove, 1); // Remove 1 element at the specified index
        }
      }

      if (this.groupingArray.length === 0) {
        this.displayData = this.groupingData;
        this.tableData = JSON.parse(JSON.stringify(this.groupingData));
        this.groupingData = [];
        this.tableHeaders = this.tableHeaders.filter((a: any) => a.name !== 'expand');
        this.data.tableHeaders = this.data.tableHeaders.filter((a: any) => a.name !== 'expand');
        this.pageChange(1);
      } else {
        // Reset displayData and tableHeaders before re-grouping
        this.displayData = [];
        this.tableHeaders = this.tableHeaders.filter((a: any) => a.name !== 'expand');
        this.data.tableHeaders = this.data.tableHeaders.filter((a: any) => a.name !== 'expand');

        // Apply grouping for each column in the groupingArray
        this.tableData = this.groupData(this.groupingData, 0);
        this.pageChange(1);
      }
      if (allowSaveInLocal) {
        const appid = this.dataSharedService.decryptedValue('appid') || '';
        this.dataService.addData(this.screenName, JSON.parse(appid), "Table", this.groupingArray);
      }
      this.saveLoader = false;
    } catch (error) {
      // Handle the error here, you can log it or display an error message
      console.error('An error occurred in groupedFunc:', error);
    } finally {
      this.saveLoader = false;
    }
  }


  groupData(data: any[], index: number): any {
    if (index < this.groupingArray.length) {
      const groupColumn = this.groupingArray[index];

      if (index === 0) {
        // Group the data by the specified column
        const groupedData = this.groupByColumn(data, groupColumn, index);

        // Update the displayData and tableHeaders for the current level
        this.tableData = this.tableData.concat(groupedData);
        this.tableHeaders.unshift({
          name: 'expand',
          key: 'expand',
          title: 'Expand',
        });
        this.data.tableHeaders.unshift({
          name: 'expand',
          key: 'expand',
          title: 'Expand',
        });
        // Continue grouping for the next column
        return this.groupData(groupedData, index + 1);
      }
      else {
        data.forEach((update: any) => {
          if (update.children) {
            const groupedChildren = this.groupByColumn(update.children, groupColumn, index);
            update.children = groupedChildren; // Update children with grouped data
            // Recursively apply grouping to children
            this.groupData(update.children, index + 1);
          }
        });
      }
    }

    return data; // Return the grouped data when all columns are processed
  }

  groupByColumn(data: any, columnName: string, index: number) {
    const groupedData: any = {};
    data.forEach((element: any) => {
      const groupValue = element[columnName];
      const parentValue = this.groupingArray[index - 1]; // Previous grouping value

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
  loadGridById(component: any, value: any, formly: any,data:any) {
    debugger
    //Form pages on select change i pass props because  appConfigurableEvent exist in props
    let getNextNode: any;
    if (formly) {
      getNextNode = component?.props?.appConfigurableEvent?.find((item: any) => (item.rule.includes('change') || item.rule.includes('onchange') || item.rule.includes('get')) && item.componentfrom == component.key && this.data.key == item.targetid);
    }else if(data) {
      if(component.componentfrom == data.key && this.data.key == component.targetid){
        getNextNode = component
      }
    } else {
      getNextNode = component?.appConfigurableEvent?.find((item: any) => (item.rule.includes('change') || item.rule.includes('onchange') || item.rule.includes('get')) && item.componentfrom == component.key && this.data.key == item.targetid)
    }
    if (!getNextNode)
      return;
    try {
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', getNextNode.id, value);
      this.dataSharedService.saveDebugLog('loadGridById', RequestGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          // this.dataSharedService.queryId = '';
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess) {
              this.saveLoader = true;
              this.processData(res);
            }
          }
        },
        error: (err) => {
          console.error(err);
          // this.toastr.error("An error occurred in mapping", { nzDuration: 3000 });
        }
      })
    } catch (err) {
      this.toasterService.checkToaster(this.data, 'error');
    }
  }
  processData(data: any) {
    if (data) {
      if (data?.data?.length > 0) {
        let res: any = {};
        res['data'] = [];
        res['data'] = data?.data;
        res['count'] = data?.count;

        this.getFromQueryOnlyTable(this.data, res)
      } else {
        this.tableEmpty();
        this.saveLoader = false;
      }
    } else {
      this.getResizingAndColumnSortng();
      this.saveLoader = false;
    }
    return data
  }
  async getFromQueryOnlyTable(tableData: any, res: any) {

    try {
      if (tableData && res?.data.length > 0) {
        this.data['searchValue'] = '';
        const appid = localStorage.getItem('appid') || '';
        let savedGroupData: any = [];
        if (appid) {
          // savedGroupData = await this.dataService.getNodes(JSON.parse(appid), this.screenName, "Table");
        }
        if (this.data?.eventActionconfig && !this
          .childTable && Object.keys(this.data.eventActionconfig).length > 0) {
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
        }

        this.tableData = res.data.map((element: any) => ({ ...element, id: element.id?.toString() }));
        this.excelReportData = [...this.tableData];
        if (!this.data.end) {
          tableData.end = 10;
        }
        this.data.pageIndex = 1;
        this.data.totalCount = res.count;
        this.data.masteTotalCount = res.count;
        if (tableData.eventActionconfig) {
          if (tableData.eventActionconfig.actionType == 'query') {
            tableData.serverApi = `knex-query/getAction/${tableData.eventActionconfig.id}`;
          } else if (tableData.eventActionconfig.actionType == 'api') {
            tableData.serverApi = tableData.eventActionconfig.rule;
          }
        }
        this.data.targetId = '';

        this.displayData = this.tableData.length > this.data.end ? this.tableData.slice(0, this.data.end) : this.tableData;
        if (this.tableHeaders.length === 0) {
          this.tableHeaders = Object.keys(this.tableData[0] || {}).map(key => ({ name: key, key: key }));
          this.data['tableKey'] = this.tableHeaders;
        } else {
          const tableKey = Object.keys(this.tableData[0] || {}).map(key => ({ name: key }));
          if (JSON.stringify(this.data['tableKey']) !== JSON.stringify(tableKey)) {
            const updatedData = tableKey.filter(updatedItem =>
              !this.tableHeaders.some((headerItem: any) => headerItem.key === updatedItem.name)
            );
            if (updatedData.length > 0) {
              updatedData.forEach(updatedItem => {
                if (!this.configurationTable) {
                  this.tableHeaders.push({ id: tableData.tableHeaders.length + 1, key: updatedItem.name, name: updatedItem.name, });
                }
              });
              this.data.tableHeaders = this.tableHeaders;
            }
          }
        }
        let CheckKey = this.tableHeaders.find((head: any) => !head.key)
        if (CheckKey) {
          for (let i = 0; i < this.tableHeaders.length; i++) {
            if (!this.tableHeaders[i].hasOwnProperty('key')) {
              this.tableHeaders[i].key = tableData.tableHeaders[i].name;
            }
          }
        }
        this.displayData = this.tableData.length > this.data.end ? this.tableData.slice(0, this.data.end) : this.tableData;
        // tableData.tableHeaders.unshift({
        //   name: 'expand',
        //   key: 'expand',
        //   title: 'Expand',
        // });
        if (savedGroupData.length > 0) {
          let getData = savedGroupData[savedGroupData.length - 1];
          if (getData.data.length > 0) {
            let updateTableData: any = [];
            getData.data.forEach((elem: any) => {
              let findData = this.tableHeaders.find((item: any) => item.key == elem);
              if (findData) {
                this.groupedFunc(elem, 'add', findData, false);
              }
            })
            this.displayData = this.tableData.length > this.data.end ? this.tableData.slice(0, this.data.end) : this.tableData;
            tableData.tableHeaders.unshift({
              name: 'expand',
              key: 'expand',
              title: 'Expand',
            });
            this.data.totalCount = res?.count;
            this.data.masteTotalCount = res.count;
          } else {
            // this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');
            this.pageChange(1);
          }
        } else {
          // this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');
          this.pageChange(1);
        }

        if (tableData.tableHeaders.some((header: any) => header.key === 'expand')) {
          this.tableData = this.tableData.map((row: any) => ({
            'expand': false,
            ...row
          }));
          this.displayData = this.displayData.map((row: any) => ({
            'expand': false,
            ...row
          }));

        }

        this.data['tableKey'] = this.tableHeaders;
        this.data['tableHeaders'] = this.tableHeaders;
        const resizingData = localStorage.getItem(this.screenId);
        this.getResizingAndColumnSortng();
      }
      this.saveLoader = false;
      this.gridInitilize();
    }
    catch (error) {
      this.toasterService.checkToaster(this.data, 'error');
      console.error("An error occurred in getFromQueryOnlyTable:", error);
      // Handle the error appropriately, e.g., show an error message to the user.
      this.saveLoader = false;
    }
  }

  isAllowEdit(header: any): boolean {
    let check = header.some((head: any) => head?.editMode != '' && head?.editMode != null);
    return check;
  }
  saveEdit(dataModel: any) {
    let newDataModel = JSON.parse(JSON.stringify(dataModel))
    let findClickApi = this.data?.appConfigurableEvent?.filter((item: any) => item.rule.includes('put'));
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.updates && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }

    if (findClickApi) {
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

          delete newDataModel.children;
          delete newDataModel.expand;
          const model = {
            screenId: this.screenName,
            postType: 'put',
            modalData: newDataModel
          };
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', findClickApi[0]?.arid);
          const jsonData1 = {
            postType: 'put',
            modalData: newDataModel, metaInfo: jsonData.metaInfo
          };

          this.saveLoader = true;
          this.dataSharedService.saveDebugLog('SaveEdit', RequestGuid)
          this.socketService.Request(jsonData1);
          this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                if (res.isSuccess) {
                  this.gridInitilize();
                  this.toasterService.checkToaster(this.data, 'success');
                  this.editId = null;
                  this.editData = null;
                }
                else {
                  this.cancelEdit(dataModel);
                  this.toasterService.checkToaster(this.data, 'error');
                }
                this.saveLoader = false;
              }

            },
            error: (err) => {
              console.error(err);
              this.toasterService.checkToaster(this.data, 'error');
              this.saveLoader = false;
            }
          });
        }
      } else {
        this.toasterService.checkToaster(this.data, 'error');
        // this.toastr.warning('Please change the data for update', { nzDuration: 3000 });
      }
    }
    else {
      this.toasterService.checkToaster(this.data, 'error');
      // this.toastr.warning('There is no rule against this', { nzDuration: 3000 });
    }
  }
  exportToExcel() {
    let header = this.tableHeaders.filter((head: any) => head.key != 'expand')
    const dataToExport = [header
      .map((header: any) => header.name)
    ];

    // Add data rows
    let newData = this.filteringArrayData.length > 0 ? [...this.filteringArrayData] : [...this.excelReportData]
    newData.forEach(item => {
      const rowData = header.map((data: any) => item[data.key]);
      dataToExport.push(rowData);
    });

    // Create a worksheet
    const ws: WorkSheet = utils.aoa_to_sheet(dataToExport);

    // Create a workbook
    const wb: WorkBook = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save the workbook as an Excel file
    const customFilename = this.data.title + '.xlsx';
    writeFile(wb, customFilename);
  }

  rowselected(i: number) {
    if (this.data?.rowSelected != false) {
      this.index = i;
    } else {
      this.index = null;
    }
  }

  makeOptions(data: any, key: any, value: any) {
    data.forEach((element: any) => {
      element[key] = value;
      if (data.children) {
        if (data.children.length > 0) {
          this.makeOptions(data.children, key, value)
        }
      }
    });
  }

  async search(searchType: any) {
    if (this.data?.serverSidePagination) {
      if (this.data['searchValue'].length >= 0) {
        this.searchByGrid$.next(this.data['searchValue']);
      }
    } else if (this.data?.searchType ? searchType == this.data?.searchType : 'keyup' == searchType) {
      try {

        this.saveLoader = true;
        const appid = this.dataSharedService.decryptedValue('appid') || '';
        let savedGroupData: any = [];
        if (appid) {
          // savedGroupData = await this.dataService.getNodes(JSON.parse(appid), this.screenName, "Table");
        }
        // Step 1: Remove the 'expand' header from tableHeaders
        this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');

        if (this.data?.searchValue) {
          const searchValue = this.data?.searchValue.toLowerCase();

          // Step 2: Use a more efficient approach for filtering the Excel report data
          if (!this.filteringArrayData || this.filteringArrayData.length === 0) {
            this.filteringArrayData = this.excelReportData;
          }

          this.tableData = this.filteringArrayData.filter((item) =>
            this.tableHeaders.some((header: any) => {
              const key = header.key;
              const itemValue = item[key]?.toString().toLowerCase();
              return itemValue && itemValue.includes(searchValue);
            })
          );
          this.groupingData = [];
        }
        else {
          this.tableData = !this.filteringArrayData || this.filteringArrayData.length === 0 ? this.excelReportData : this.filteringArrayData;
          this.displayData = !this.filteringArrayData || this.filteringArrayData.length === 0 ? this.excelReportData : this.filteringArrayData;;
          this.groupingData = [];

        }
        if (savedGroupData.length > 0) {
          let getData = savedGroupData[savedGroupData.length - 1];

          if (getData.data.length > 0) {
            let updateTableData: any = [];
            this.groupingArray = [];
            getData.data.forEach((elem: any) => {
              let findData = this.tableHeaders.find((item: any) => item.key == elem);

              if (findData) {
                this.groupedFunc(elem, 'add', findData, false);
              }
            });

            this.displayData = this.tableData.length > this.data.end ? this.tableData.slice(0, this.data.end) : this.tableData;
            this.data.tableHeaders.unshift({
              name: 'expand',
              key: 'expand',
              title: 'Expand',
            });

            this.data.totalCount = this.tableData;
          } else {
            this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');
            this.displayData = this.tableData;
            this.pageChange(1);
          }
        }
        else {
          this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');
          this.displayData = this.tableData;
          this.pageChange(1);
        }

        this.saveLoader = false;
      }
      catch (error) {
        console.error("An error occurred in search:", error);
        // Handle the error appropriately, e.g., show an error message to the user.
        this.saveLoader = false;
      }
    }
  }
  private onMouseMove: (e: MouseEvent) => void;
  private onMouseUp: () => void;
  // ngOnDestroy() {
  //   window.removeEventListener('mousemove', this.onMouseMove);
  //   window.removeEventListener('mouseup', this.onMouseUp);
  //   if (this.requestSubscription)
  //     this.requestSubscription.unsubscribe();

  //   this.unsubscribe.next();
  //   this.unsubscribe.complete();
  // }
  async onFileSelected(event: any): Promise<void> {
    if (this.data.appConfigurableEvent) {
      let findClickApi = this.data?.appConfigurableEvent?.find((item: any) => item.rule.includes('fileupload'));
      if (!findClickApi) {
        this.toasterService.checkToaster(this.data, 'error');
        // this.toastr.error('Action Required for upload data in bulk', { nzDuration: 2000 });
        return;
      }

      const file: File = event.target.files[0];
      if (file) {
        this.showProgressBar = true;
        this.progress = 0; // Initialize progress to 0
        const fileData: any = {
          originalname: file.name,
          mimetype: file.type,
          buffer: await this.socketService.readFileAsArrayBuffer(file),
          size: file.size,
        };
        const { jsonData, newGuid } = this.socketService.makeJsonfileData('4006', fileData, findClickApi?.id);
        this.dataSharedService.saveDebugLog('OnFileSelected', newGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res: any) => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              // Upload complete
              this.progress = 100;
              this.showProgressBar = false;
              this.fileUpload = ''; // This clears the file input
              if (res.isSuccess) {
                if (this.data.appConfigurableEvent) {
                  this.recallApi();
                }
                this.saveLoader = true;
                this.toasterService.checkToaster(this.data, 'success');
              } else {
                this.toasterService.checkToaster(this.data, 'error');
              }
            }
          },
          error: (err) => {
            // Handle error
            this.showProgressBar = false;
            this.toasterService.checkToaster(this.data, 'error');
          },
        });
        // const formData: FormData = new FormData();
        // formData.append('file', file);
        // this.requestSubscription = this.http
        //   .post(this.serverPath + 'knex-query/savecsv/' + findClickApi?.id, formData, {
        //     reportProgress: true, // Enable progress reporting
        //     observe: 'events', // Observe Http events
        //   })
        // .subscribe({
        //   next: (event: HttpEvent<any>) => {
        //     if (event.type === HttpEventType.UploadProgress) {
        //       if (event.total !== undefined && event.total > 0) {
        //         // Ensure 'event.total' is defined and positive before using it
        //         this.progress = Math.round((100 * event.loaded) / event.total);
        //       }
        //     } else if (event.type === HttpEventType.Response) {
        //       // Upload complete
        //       this.progress = 100;
        //       this.showProgressBar = false;
        //       // this.toastr.success('Import successfully', { nzDuration: 3000 });
        //       this.fileUpload = ''; // This clears the file input
        //       if (event.body.isSuccess) {
        //         if (this.data.appConfigurableEvent) {
        //           this.saveLoader = true;
        //           this.recallApi();
        //         }
        //         this.toastr.success('Import successfully', { nzDuration: 3000 });
        //       } else {
        //         this.toastr.error(event.body.error, { nzDuration: 2000 });
        //       }
        //     }
        //   },
        //   error: (err) => {
        //     // Handle error
        //     this.showProgressBar = false;
        //     this.toastr.error('Some error occurred', { nzDuration: 2000 });
        //   },
        // });
      }
    }
    // if (!this.data?.tableName) {
    //   this.toastr.error('Required Impot table name', { nzDuration: 2000 });
    //   return
    // }

  }


  split(index: any, data: any) {

    if (data) {
      if (typeof data == 'string') {
        return data.split(',')[index];
      } else {
        return ''
      }
    } else {
      return ''
    }

  }

  showDeleteConfirm(rowData: any): void {
    if (rowData?.editabeRowAddNewRow == true) {
      //This condition is used when we use add row then not update after add bfore saveing data
      return;
    }
    this.modal.confirm({
      nzTitle: 'Are you sure delete this Row?',
      // nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzClassName: 'deleteRow',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteRow(rowData),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  open(): void {
    this.visible = true;
    this.saveLoader = true;
    let externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
    if (externalLogin == false) {
      const { jsonData, newGuid } = this.socketService.makeJsonDataById('CheckUserScreen', this.data?.drawerScreenLink, '2006');
      this.dataSharedService.saveDebugLog('CheckUserScreen', newGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            if (res?.data == true) {
              this.loadScreen(this.data?.drawerScreenLink);
            } else {
              this.saveLoader = false;
              this.screenId = res.data[0].sbid;
              this.nodes.push(res);
            }
          }

        },
        error: (err) => {
          console.error(err); // Log the error to the console
          this.saveLoader = false;
        }
      });
    } else {
      this.loadScreen(this.data?.drawerScreenLink);
    }

  }
  loadScreen(data: any) {
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('Builders', data.href, '2002');
    this.dataSharedService.saveDebugLog('loadScreen', newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        try {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess) {
              if (res.data.length > 0) {
                this.screenId = res.data[0].sbid;
                this.nodes = [];
                this.nodes.push(res);
              }
              this.saveLoader = false;
            } else {
              this.toasterService.checkToaster(this.data, 'error');
              this.saveLoader = false;
            }
          }
        } catch (err) {
          this.saveLoader = false;
          this.toasterService.checkToaster(this.data, 'error');
          console.error(err); // Log the error to the console
        }
      },
      error: (err) => {
        this.saveLoader = false;
        this.toasterService.checkToaster(this.data, 'error');
        console.error(err); // Log the error to the console
      }
    });
  }


  close(): void {

    this.visible = false;
    if (this.data.appConfigurableEvent && this.dataSharedService.isSaveData) {
      this.dataSharedService.isSaveData = false;
      this.recallApi();
    }
  }
  makeFilterData(header: any, allowPrevious: boolean) {

    header['searchValue'] = '';
    const filterData: any = {};
    if (this.filteringArrayData.length == 0) {
      this.filteringArrayData = this.excelReportData;
    }
    // Loop through the input array to collect unique status values
    for (const item of this.excelReportData) {
      const key = header?.key; // The key to filter by
      const text = item[key]; // The text/value of the filter
      if (!filterData[key]) {
        filterData[key] = [];
      }
      // Check if the text/value is not already in the filter data
      if (!filterData[key].some((filterItem: any) => filterItem.text === text)) {
        filterData[key].push({ key, text, value: text, filter: false });
      }
    }

    // Now filterData['status'] contains the unique filter data for 'status'
    if (header['filterArray'] && header?.filterArray?.length > 0 && allowPrevious && !header?.callApi) {
      let result: any[] = [];
      filterData[header?.key].forEach((element: any) => {
        let fonudObj: any = ''
        fonudObj = header['filterArray'].find((item: any) => item.value == element.value);
        if (fonudObj) {
          result.push(fonudObj);
        } else {
          result.push(element)
        }

      });
      header['filterArray'] = [...result]
      header['filterSearch'] = [...result]

    } else {
      if (!header?.callApi) {
        header['filterArray'] = filterData[header?.key];
        header['filterSearch'] = filterData[header?.key];
      }
    }
  }
  async filter(item: any, add: boolean) {
    item['visible'] = false;
    this.filteringArrayData = this.excelReportData;


    // Update the filteringHeadArray
    this.filteringHeadArray = this.filteringHeadArray.filter((filterHead: any) => filterHead.key !== item.key);
    if (add) {
      let checkFilter = item?.filterArray.find((a: any) => a.filter);
      if (checkFilter) {
        this.filteringHeadArray.push(item);
      }
    } else {
      if (item?.filterArray && !item?.callApi) {
        delete item?.filterArray;
      }
    }

    if (this.filteringHeadArray.length > 0) {
      // Create an array of filtered values for each filter header

      if (this.data.serverSidePagination) {
        this.onPageIndexChange(1);
      } else {
        const filteredValuesMap = new Map<string, Set<string>>();

        this.filteringHeadArray.forEach((element1: any) => {
          const filteredValues = new Set<string>(
            element1?.filterArray.filter((filterItem: any) => filterItem.filter).map((filterItem: any) => filterItem.value)
          );
          filteredValuesMap.set(element1.key, filteredValues);
        });

        // Filter the data based on all filter headers
        const filteredData = this.filteringArrayData.filter((dataItem: any) => {
          return this.filteringHeadArray.every((filterHead: any) => {
            const filteredValues = filteredValuesMap.get(filterHead.key) ?? new Set<string>();
            return filteredValues.has(dataItem[filterHead.key]);
          });
        });

        // Assign the filtered data to this.displayData and this.tableData
        this.filteringArrayData = filteredData;
        this.displayData = filteredData;
        this.tableData = filteredData;
      }


    }
    else {
      if (this.data.serverSidePagination) {
        this.onPageIndexChange(1);
      } else {
        this.displayData = this.excelReportData;
        this.tableData = this.excelReportData;
        this.filteringArrayData = [];
      }

    }
    this.groupingData = [];
    if (this.data?.searchValue) {
      this.search(this.data?.searchType ? this.data?.searchType : 'keyup')
    }
    else {
      const appid = localStorage.getItem('appid') || '';
      let savedGroupData: any = [];
      if (appid) {
        // this.saveLoader = true;
        // time ly rahi thi es liyee comment ki
        // savedGroupData = await this.dataService.getNodes(JSON.parse(appid), this.screenName, "Table");
        // this.saveLoader = false;
      }
      if (savedGroupData.length > 0) {
        let getData = savedGroupData[savedGroupData.length - 1];

        if (getData.data.length > 0) {
          let updateTableData: any = [];
          this.groupingArray = [];
          getData.data.forEach((elem: any) => {
            let findData = this.tableHeaders.find((item: any) => item.key == elem);

            if (findData) {
              this.groupedFunc(elem, 'add', findData, false);
            }
          });

          this.displayData = this.tableData.length > this.data.end ? this.tableData.slice(0, this.data.end) : this.tableData;
          this.data.tableHeaders.unshift({
            name: 'expand',
            key: 'expand',
            title: 'Expand',
          });

          this.data.totalCount = this.tableData;
        } else {
          this.tableHeaders = this.tableHeaders.filter((head: any) => head.key != 'expand');
          this.displayData = this.tableData;
          this.pageChange(1);
        }
      } else {
        this.pageChange(1);
      }
    }
    if (item.filterArray) {
      item['isFilterdSortedColumn'] = item.filterArray.some((a: any) => a?.filter) && item.filterArray.length > 0;
    } else {
      item['isFilterdSortedColumn'] = false
    }
  }

  simpleFiltering(value: any, header: any) {
    header.filterArray.forEach((element: any) => {
      if (element.value == value) {
        element.filter = true;
      } else {
        element.filter = false;
      }
    });
    this.filter(header, true);
  }

  checkResetFiltering(header: any): boolean {
    return !header?.filterArray?.some((item: any) => item.filter);
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
    this.tableData.sort((a, b) => {
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

    this.pageChange(1);
  }

  // Define a custom sorting function
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
  searchFilter(header: any) {
    header['filterArray'] = header['filterSearch']
    if (header?.searchValue) {
      const searchValue = header?.searchValue.toLowerCase();
      header['filterArray'] = header['filterSearch'].filter((item: any) =>
        item.value.toLowerCase().includes(searchValue)
      );
    }
  }
  selectClearAll(header: any, allow: boolean) {
    header?.filterArray.forEach((element: any) => {
      element.filter = allow;
    });
  }

  allowFreeze(header: any, index: number): boolean {
    if (header) {
      if (this.data?.endFreezingNumber || this.data.startFreezingNumber) {
        let checkFreezingNumber = 0;
        if (['', undefined, true].includes(this.data.isDeleteAllow)) {
          checkFreezingNumber = checkFreezingNumber + 1
        }
        if (this.tableHeaders.some((item: any) => item?.editMode === true)) {
          checkFreezingNumber = checkFreezingNumber + 1;
        }
        if (index < this.data?.endFreezingNumber - checkFreezingNumber && this.data?.endFreezingNumber > checkFreezingNumber) {
          let freezeIndex = this.tableHeaders.length - (index + 1)
          this.tableHeaders[freezeIndex]['headerFreeze'] = true;
        }
        let checkFreezingStartNUmber = 0;
        if (this.data.showCheckbox) {
          checkFreezingStartNUmber = checkFreezingStartNUmber + 1;
        }
        if (index < this.data.startFreezingNumber - checkFreezingStartNUmber) {
          header['headerFreeze'] = true;
          return header['headerFreeze'];
        }
        else {
          return header['headerFreeze'] ? header['headerFreeze'] : false;
        }
      } else {
        return header['headerFreeze'] ? header['headerFreeze'] : false;
      }
    }
    else {
      return false
    }
  }
  removeGrouping(index: number, remove: boolean) {
    try {
      this.saveLoader = true;
      let newGroupedArray: any[] = [];
      if (!remove) {
        if (index < 0 || index >= this.groupingArray.length) {
          // this.saveLoader = false;
          return; // Invalid index, nothing to remove
        }
        newGroupedArray.push(this.groupingArray[index])
        // for (let i = 0; i <= index; i++) {
        //   newGroupedArray.push(this.groupingArray[i])
        // }
      }
      else {
        newGroupedArray = [...this.groupingArray]
        this.groupingArray = [];
      }

      if (newGroupedArray.length > 0) {
        newGroupedArray.forEach((elem: any) => {
          let findData = this.tableHeaders.find((item: any) => item.key == elem);
          if (findData && !remove) {
            this.groupedFunc(elem, 'remove', findData, true);
          }
          else if (findData && remove) {
            this.groupedFunc(elem, 'remove', findData, true);
          }
        });
      }
      this.saveLoader = false;
    } catch (error) {
      // Handle the error, log it, or perform any necessary actions
      this.saveLoader = false;
      this.toasterService.checkToaster(this.data, 'error');
      console.error('An error occurred in mapping:', error);
      // Optionally, you can rethrow the error to propagate it further
    }
  }
  changePageSize(pageSize: number) {
    this.data['end'] = pageSize;
    localStorage.setItem('tablePageSize', this.data?.end);
    if (this.data.serverSidePagination)
      this.onPageIndexChange(1)
    else {
      this.pageSize = '';
      this.pageChange(1);

    }
  }
  check(event: any) {

    console.log(event)
  }
  updateRotationDegree(degree: number) {
    this.rotationDegree = degree;
  }
  allowChild(child: any): boolean {
    if (this.tableHeaders.length > 0 && child) {
      return this.tableHeaders.some((head: any) => head.key === child.key);
    } else {
      return false;
    }
  }
  cancelEdit(item: any) {
    for (const key in this.editData) {
      item[key] = this.editData[key]
    }
    this.editId = null;
  }

  resizingLocalStorage() {
    let storeData = this.tableHeaders.map((item: any) => {
      let obj = {
        key: item.key,
        width: item.width
      };
      return obj;
    });
    if (this.screenId) {
      localStorage.setItem(this.screenId, JSON.stringify(storeData));
    }
  }
  handleDataDeletion(data: any) {
    // Remove the data to be deleted from various data arrays
    this.tableData = this.tableData.filter((d: any) => d.id !== data.id);
    this.displayData = this.displayData.filter((d: any) => d.id !== data.id);
    this.excelReportData = this.excelReportData.filter((d: any) => d.id !== data.id);
    this.pageChange(1); // Optionally, update pagination or other UI changes
  }

  parseDateString(dateString: string): Date | any {
    // Check if the string is in the "Fri Dec 01 2023 00:00:00 GMT+0000" format
    if (/^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT\+\d{4} \(Coordinated Universal Time\)$/.test(dateString)) {
      return new Date(dateString);
    }

    // Check if the string is in the "MM/DD/YYYY" format
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[0], 10) - 1; // Months are 0-based in JavaScript
      const day = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);

      // Validate the month, day, and year
      if (!isNaN(month) && !isNaN(day) && !isNaN(year) && month >= 0 && month <= 11) {
        return new Date(year, month, day);
      }
    }

    // Check if the string is in the 'yyyy-MM-dd' format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }

    // Check if the string is in the "2023-11-30T00:00:00.000Z" format
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString)) {
      return new Date(dateString);
    }

    // If the format is not recognized, return null
    return dateString;
  }


  recallApi() {
    const { id, page, pageSize } = this.data.eventActionconfig;
    if (id) {
      let pagination: any = ''; let Rulepage = ''; let RulepageSize = '';
      if (page && pageSize) {
        pagination = `?page=${localStorage.getItem('tablePageNo') || 1}&pageSize=${localStorage.getItem('tablePageSize') || 10}`
        Rulepage = `${localStorage.getItem('tablePageNo') || 1}`;
        RulepageSize = `${localStorage.getItem('tablePageSize') || 10}`;
      }
      this.saveLoader = true;
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', id, this.mappingId, Rulepage, RulepageSize);
      this.dataSharedService.saveDebugLog('recallApi', RequestGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.getFromQueryOnlyTable(this.data, res);
            this.saveLoader = false;
          }
        },
        error: (error: any) => {
          console.error(error);
          this.saveLoader = false;
          this.toasterService.checkToaster(this.data, 'error');
        }
      })
    }
  }
  callExpandAPi(item: any, event: any) {
    if (item?.editabeRowAddNewRow) {
      item.expand = false;
      this.toasterService.checkToaster(this.data, 'error');
      // this.toastr.warning("Please save before expand", { nzDuration: 3000 });
      return;
    }
    let findExpandKeyHead = (this.data.tableHeaders || this.tableHeaders).find((head: any) => head.key == 'expand');
    if (findExpandKeyHead && event) {
      if (findExpandKeyHead.callApi) {
        let modifiedUrl = findExpandKeyHead.callApi.includes(',') ? (this.childDataObj ? findExpandKeyHead.callApi.split(',')[this.childDataObj['expandIndex']] : findExpandKeyHead.callApi.split(',')[0]) : findExpandKeyHead.callApi
        let Rulepage = localStorage.getItem('tablePageNo') || 1;
        let RulepageSize = localStorage.getItem('tablePageSize') || 10;
        this.saveLoader = true;
        if (item?.id) {
          // this.dataSharedService.pagesLoader.next(true);
          // let splitApi;
          // let parentId;
          // modifiedUrl = `${modifiedUrl}/${item?.id}`
          // if (modifiedUrl.includes('getexecute-rules/'))
          //   splitApi = modifiedUrl.split('getexecute-rules/')[1];
          // else splitApi = modifiedUrl;
          // if (splitApi.includes('/')) {
          //   const getValue = splitApi.split('/');
          //   splitApi = getValue[0]
          //   parentId = getValue[1];
          // }
          const { splitApi, parentId } = this.dataSharedService.makeParentId(`${modifiedUrl}/${item?.id}`)
          const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId, Rulepage, RulepageSize);
          this.dataSharedService.saveDebugLog('callExpandAPi', RequestGuid)
          this.socketService.Request(jsonData);
          this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                this.saveLoader = false;
                let rowData = JSON.parse(JSON.stringify(item));
                let responseData: any = res.data.map((row: any) => ({
                  'expand': false,
                  ...row
                }));
                if (responseData.length == 0 && window.location.host.includes('taskmanager.com')) {
                  rowData['parentid'] = rowData.id;
                }
                if (res.count || res.count == 0) {
                  let modifiedHeaders: any[] = [];
                  let modifedData: any = '';
                  if (responseData.length > 0) {
                    const firstObjectKeys = Object.keys(responseData[0]);
                    if (responseData.length > 0) {
                      modifiedHeaders = firstObjectKeys.map(key => ({ key: key, name: key }));
                      modifedData = JSON.parse(JSON.stringify(this.data));
                      modifedData['tableKey'] = modifiedHeaders;
                    }
                  }
                  const buttonHeaders = this.tableHeaders.filter((header: any) => ['button', 'downloadButton', 'qrcode'].includes(header.dataType));
                  if (buttonHeaders.length > 0) {
                    buttonHeaders.forEach((buttonHeader: any) => {
                      const matchingHeader = modifiedHeaders.find((header: any) => header.key === buttonHeader.key);
                      if (matchingHeader) {
                        matchingHeader.dataType = buttonHeader.dataType;
                      }
                    });
                  }

                  item['childDataObj'] = {
                    count: res.count,
                    callExpandAPi: true,
                    id: item?.id,
                    data: modifedData ? modifedData : JSON.parse(JSON.stringify(this.data)),
                    header: modifiedHeaders.length > 0 ? modifiedHeaders : this.tableHeaders,
                    rowObj: responseData.length > 0 ? '' : rowData,
                    expandIndex: this.childDataObj ? this.childDataObj['expandIndex'] + 1 : 0
                  };
                }
                item['children'] = responseData;
              }
            },
            error: (error: any) => {
              console.error(error);
              this.saveLoader = false;
              this.toasterService.checkToaster(this.data, 'error');
            }
          })
        }
      }
    }
  }

  findInlineSaveExist(data: any): any {
    for (const element of data) {
      if (element.editabeRowAddNewRow) {
        return element;
      }

      if (element.children && element.children.length > 0) {
        const result = this.findInlineSaveExist(element.children);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }
  getResizingAndColumnSortng() {
    if (this.tableHeaders.length > 0) {
      const resizingData = localStorage.getItem(this.screenId);
      if (resizingData) {
        const parseResizingData = JSON.parse(resizingData);
        this.tableHeaders.forEach((element1: any) => {
          const matchingElement = parseResizingData.find((element: any) => element.key === element1.key);
          if (matchingElement) {
            element1.width = matchingElement.width;
          }
        });
      }
      const deleteditWidthresizing = localStorage.getItem(`${this.screenId}-deleteditWidth`);
      if (deleteditWidthresizing) {
        const parseResizingData = JSON.parse(deleteditWidthresizing);
        this.deleteditWidth.forEach((element1: any) => {
          const matchingElement = parseResizingData.find((element: any) => element.key === element1.key);
          if (matchingElement) {
            element1.width = matchingElement.width;
          }
        });
      }
      this.tableHeaders.forEach((head: any) => {
        head['isFilterdSortedColumn'] = false
      });
      this.tableHeaders.sort((a: any, b: any) => {
        const srNoA = parseInt(a.srNo);
        const srNoB = parseInt(b.srNo);

        if (!isNaN(srNoA) && !isNaN(srNoB)) {
          // Sort by 'srNo' if both values are numbers
          return srNoA - srNoB;
        } else if (isNaN(srNoA) && isNaN(srNoB)) {
          // If both values are not numbers, maintain original order
          return 0;
        } else if (!isNaN(srNoA) && isNaN(srNoB)) {
          // Move items with 'srNo' to the front
          return -1;
        } else {
          // Move items with 'srNo' to the front
          return 1;
        }
      });
    }
  }
  ngOnDestroy(): void {
    try {
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
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

  onResize({ width }: NzResizeEvent, col: string, SimpleHeader?: any): void {
    if (SimpleHeader) {
      for (let i = 0; i < this.tableHeaders.length; i++) {
        const e = this.tableHeaders[i];
        if (e.key === col) {
          this.tableHeaders[i] = { ...e, width: `${width}px` };
        }
      }
      this.resizingLocalStorage();
    } else {
      for (let i = 0; i < this.deleteditWidth.length; i++) {
        const e = this.deleteditWidth[i];
        if (e.key === col) {
          if (!e.show) {
            this.deleteditWidth[i] = { ...e, width: `0px` };
          } else {
            this.deleteditWidth[i] = { ...e, width: `${width}px` };
          }
        }
      }
      let storeData = this.deleteditWidth.map((item: any) => {
        let obj = {
          key: item.key,
          width: item.width
        };
        return obj;
      });
      if (this.screenId) {
        localStorage.setItem(`${this.screenId}-deleteditWidth`, JSON.stringify(storeData));
      }
    }
  }
  imagePreview(data: any) {
    const images = [
      {
        src: data.image ? data.image : data.source,
        width: data.imageWidth + 'px',
        height: data.imagHieght + 'px',
        alt: data.alt,
      }
    ];
    this.nzImageService.preview(images, { nzZoom: data.zoom, nzRotate: data.rotate, nzKeyboard: data.keyboardKey, nzZIndex: data.zIndex });
  }
  tableEmpty() {
    this.tableData = [];
    this.excelReportData = [];
    this.displayData = [];
    this.start = 1;
    this.end = 10;
  }
}

