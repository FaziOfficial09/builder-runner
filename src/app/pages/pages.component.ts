import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, Subscription, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { ElementData } from '../models/element';
import { TreeNode } from '../models/treeNode';
import { DataSharedService } from '../services/data-shared.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormGroup } from '@angular/forms';
import { applyPatch } from 'fast-json-patch';
import { SocketService } from '../services/socket.service';
import { cloneDeep } from 'lodash-es';
import * as math from 'mathjs';
import { AutomergeService } from '../services/automerge.service';
import { ToasterService } from '../services/toaster.service';
const formulajs = require('@formulajs/formulajs') // require entire package
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf"; // Trying to import as in the documentation 

import { DatePipe } from '@angular/common';

@Component({
  selector: 'st-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
  joiValidationData: TreeNode[] = [];
  @Input() data: any = [];
  @Input() resData: any[] = [];
  @Input() formlyModel: any;
  fields: any = [];
  dataModel: any = {};
  screenData: any;
  businessRuleData: any;
  @Input() screenName = '';
  @Input() screenId: any;
  @Input() navigation: any = undefined;
  requestSubscription: Subscription;
  isPageContextShow = false;
  @Input() form: any = new FormGroup({});
  actionRuleList: any[] = [];
  getTaskManagementIssues: any[] = [];
  isVisible: boolean = false;
  tableRowID: any = '';
  pdf: boolean = false;
  pageRuleList: any[] = [];
  saveLoader: boolean = false;
  countRule: number = 0;
  themeValue: any = '';
  externalLogin: any = false;
  isversionuptodate: any = false;
  @Input() isDrawer: boolean = false;
  @Input() mappingId: any;
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  constructor(private activatedRoute: ActivatedRoute,
    private clipboard: Clipboard,
    public socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private toastr: NzMessageService,
    private el: ElementRef,
    public autoMergeService: AutomergeService,
    private toasterService: ToasterService,
    public dataSharedService: DataSharedService, private router: Router, private renderer: Renderer2, private zone: NgZone) {

    // this.ngOnDestroy();
    const changeSubscription = this.dataSharedService.change.subscribe(({ event, field }) => {

      if (this.navigation && this.navigation == this.dataSharedService.currentPageLink) {
        if (field && event) {
          if (this.formlyModel?.[this.screenId] && Object.keys(this.formlyModel?.[this.screenId]).length > 0) {
            // this.formlyModel?.[this.screenId][field.key] = event;
            if (field.type == 'cascader') {
              if (field.key.includes('.')) {
                this.formlyModel[this.screenId][field.key.split('.')[0]][field.key.split('.')[1]] = ''
              }
            }
            this.makeModel(field, event)
          }
        }

        // ye condition is ly lagai ha q ke jab image upload wala ma value path hu upload ke baad to ye na chala
        if (field.type != 'image-upload') {
          this.getEnumList(field, event);
          if (field && this.router.url.includes('/pages')) {
            if (this.formlyModel?.[this.screenId] && Object.keys(this.formlyModel?.[this.screenId]).length > 0) {
              this.checkConditionUIRule(field, event);
              if (this.countRule < 3)
                this.formValueAssign(this.editData);
              // this.formlyModel[field.key] = event;
            } else {
              if (this.navigation)
                this.checkConditionUIRule(field, event);
            }
          }
        }
      }
    });
    const gridDataSubscription = this.dataSharedService.gridData.subscribe(res => {
      if (res)
        this.saveDataGrid(res);
    });
    const updateModel = this.dataSharedService.updateModel.subscribe(res => {
      if (res && this.navigation) {
        this.formlyModel[this.screenId] = res;
      }
    });
    const makeModel = this.dataSharedService.makeModel.subscribe(res => {
      if (res && this.navigation) {
        let newModel = { ...this.formlyModel?.[this.screenId] };
        res?.forEach((element: any) => {
          this.makeModelLoop(element, element.value, newModel)
        });
        this.formlyModel[this.screenId] = { ...newModel };
      }
    });
    const refreshModel = this.dataSharedService.refreshModel.subscribe(res => {
      if (res && this.navigation) {
        let newModel = { ...this.formlyModel?.[this.screenId] };
        newModel = this.setInternalModelValuesEmpty(newModel);
        this.formlyModel[this.screenId] = { ...newModel };
        this.form.patchValue(this.formlyModel[this.screenId]);
      }
    });

    const applicationTheme = this.dataSharedService.applicationTheme.subscribe(res => {
      if (res && this.navigation) {
        this.applyApplicationTheme(this.resData[0], true);
      }
    });
    const commentsRecall = this.dataSharedService.commentsRecall.subscribe((res: any) => {
      if (res && this.navigation) {
        this.filterDuplicateChildren(this.resData[0]);
        if (res.mapApi) {
          let selectedNodeMap = this.findObjectByKey(this.resData[0].children[1], res.control.key);
          if (selectedNodeMap) {
            this.makeDynamicSections(res.mapApi, selectedNodeMap)
          }
        }
      }
    });
    const prevNextRecord = this.dataSharedService.prevNextRecord.subscribe((res: any) => {
      if (res && this.navigation) {
        this.filterDuplicateChildren(this.resData[0]);
        // this.checkDynamicSection(res?.tableRowId, true);
      }
    });
    const moveLinkSubscription = this.dataSharedService.moveLink.subscribe(res => {
      this.scrollToElement(res);
    })
    const pagesLoader = this.dataSharedService.pagesLoader.subscribe(res => {
      if (this.navigation)
        this.saveLoader = res;
    })
    // const callMapApiAfterSave = this.dataSharedService.callMapApiAfterSave.subscribe(res => {
    //   if (this.navigation) {
    //     const findMappingObj = this.findObjectById(this.resData[0], res);
    //     if (findMappingObj && findMappingObj?.mapApi) {
    //       this.filterDuplicateChildren(this.resData[0])
    //       this.makeDynamicSections(findMappingObj?.mapApi, findMappingObj)
    //     }
    //   }
    // })
    // this.dataSharedService.repeatableControll.subscribe(res => {
    //   if(res)
    //   this.formlyModel?.[this.screenId][res.key] = res.event;
    // })
    this.subscriptions.add(changeSubscription);
    this.subscriptions.add(gridDataSubscription);
    this.subscriptions.add(moveLinkSubscription);
    this.subscriptions.add(pagesLoader);
    this.subscriptions.add(applicationTheme);
    this.subscriptions.add(prevNextRecord);
    this.subscriptions.add(commentsRecall);
    this.subscriptions.add(updateModel);
    this.subscriptions.add(refreshModel);
    this.subscriptions.add(makeModel);
    // this.subscriptions.add(callMapApiAfterSave);

  }

  ngOnDestroy(): void {

    try {
      this.clearValues();
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
  user: any;
  ngOnInit(): void {
    let externalPageLink = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).link : '';
    this.externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
    let externalSubmit = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).submit : false;
    if (this.externalLogin && (window.location.pathname == `/${externalPageLink}`) && externalSubmit) {
      this.router.navigate(['/permission-denied']);
      return;
    }
    if (!this.formlyModel)
      this.formlyModel = {};
    this.initHighlightFalseSubscription();
    this.initPageSubmitSubscription();
    this.initEventChangeSubscription();
    this.initActivatedRouteSubscription();
    this.user = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.checkContentHeight();
  //   }, 16000)

  // }
  // checkContentHeight() {
  //   if (this.el.nativeElement.querySelector('#Content')) {
  //     const contentElement = this.el.nativeElement.querySelector('#Content');
  //     this.dataSharedService.contentHeight = contentElement.clientHeight;
  //   }
  //   if (this.dataSharedService.measureHeight < this.dataSharedService.contentHeight) {
  //     this.dataSharedService.showFooter = false;
  //     console.log(false);
  //   } else {
  //     console.log(true);
  //     this.dataSharedService.showFooter = true;
  //   }
  // }
  private initHighlightFalseSubscription(): void {
    const subscription = this.dataSharedService.highlightFalse.subscribe({
      next: (res) => {
        if (this.resData.length > 0 && res) {
          this.removeHighlightRecursive(this.resData[0].children[1].children[0].children[1]);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.add(subscription);
  }

  private initPageSubmitSubscription(): void {
    const subscription = this.dataSharedService.pageSubmit.subscribe({
      next: (res) => {
        if (res) {
          const checkButtonExist = this.findObjectById(this.resData[0], res.id);
          if (checkButtonExist?.appConfigurableEvent) {
            event?.stopPropagation();
            let makeModel: any = {};
            const filteredNodes = this.filterInputElements(this.resData[0].children[1].children);
            for (let item in this.formlyModel?.[this.screenId]) {
              filteredNodes.forEach((element) => {
                if (item == element.formly[0].fieldGroup[0].key) {
                  makeModel[item] = this.formlyModel?.[this.screenId][item]
                }
              });
            }
            this.dataModel = makeModel;
            if (Object.keys(makeModel).length > 0) {
              for (const key in this.dataModel) {
                if (this.dataModel.hasOwnProperty(key)) {
                  const value = this.getValueFromNestedObject(key, this.formlyModel?.[this.screenId]);
                  if (value !== undefined) {
                    this.dataModel[key] = this.dataModel[key] ? this.dataModel[key] : value;
                  }
                }
              }
            }
            if (Object.keys(makeModel).length > 0) {
              this.dataModel = this.convertModel(this.formlyModel?.[this.screenId]);
              const allUndefined = Object.values(this.formlyModel?.[this.screenId]).every((value) => value === undefined);
              if (!allUndefined) {
                this.saveData(res)
              }
            }
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.add(subscription);
  }

  private initEventChangeSubscription(): void {
    const subscription = this.dataSharedService.eventChange.subscribe({
      next: (res) => {
        if (res) {
          for (let index = 0; index < res.length; index++) {
            const element = res[index].actions?.[0]?.componentfrom;
            let findObj = this.findObjectByKey(this.resData[0], element);
            if (findObj) {
              if (findObj?.formlyType === 'input') {
                // this.applicationService.getBackendCommonAPI(res[index].actions?.[0]?.url).subscribe(res => {
                //   if (res) {
                //     //... the rest of your logic ...
                //   }
                // });
              }
            }
          }
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.add(subscription);
  }

  private initActivatedRouteSubscription(): void {

    if (this.data.length == 0) {
      const subscription = this.activatedRoute.params.subscribe((params: Params) => {

        if (params["schema"]) {
          this.activatedRoute.queryParams.subscribe(queyParam => {
            this.mappingId = queyParam['mpId'];
            this.tableRowID = queyParam['mpId'];
            if (queyParam['pdId'] == true || queyParam['pdId'] == 'true') {
              this.pdf = true;
            }
          });
          // if (params["id"]) {
          //   this.mappingId = params["id"];
          // }
          this.saveLoader = true;
          this.dataSharedService.currentMenuLink = "/pages/" + params["schema"];
          localStorage.setItem('screenId', this.dataSharedService.currentMenuLink);
          this.clearValues();
          if (this.externalLogin == false) {
            const { jsonData, newGuid } = this.socketService.makeJsonDataById('CheckUserScreen', params["schema"], '2006');
            this.dataSharedService.saveDebugLog('CheckUserScreen', newGuid)
            this.socketService.Request(jsonData);
            this.socketService.OnResponseMessage().subscribe(res => {
              if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                let externalPageLink = this.dataSharedService.decryptedValue('externalLoginLink');
                if (this.externalLogin == true && window.location.pathname != `/${externalPageLink}` && !res?.isSuccess) {
                  return;
                }
                if (res?.isSuccess) {
                  this.initiliaze(params);
                } else {
                  this.saveLoader = false;
                  this.data = res.data?.data?.[0].screendata;
                  this.resData = this.data;
                }
              }
            });
          } else {
            this.initiliaze(params);
          }

        }
      });
      this.subscriptions.add(subscription);
    } else {
      this.initiliaze('');
    }
  }

  initiliaze(params: any) {
    console.log('initiliaze')
    if (this.data.length == 0) {
      if (params["schema"]) {

        this.dataSharedService.defaultPageNodes = '';
        this.isPageContextShow = true;
        // this.dataSharedService.urlModule.next({ aplication: '', module: '' });
        this.navigation = params["schema"];
        this.dataSharedService.currentMenuLink = '/pages/' + this.navigation;
        localStorage.setItem('screenId', this.dataSharedService.currentMenuLink);
        this.getBuilderScreen(params);
        this.getTaskManagementIssuesFunc(params["schema"], this.dataSharedService.decryptedValue('appid'));

        // this.requestSubscription = this.applicationService.getNestCommonAPI("cp/getuserCommentsByApp/UserComment/pages/" + params["schema"]).subscribe((res: any) => {
        //   if (res.isSuccess) {
        //     let commentList = res.data
        //     this.dataSharedService.screenCommentList = commentList;

        //   }
        // })
      }
    }
    //
    else if (this.data.length > 0 && params["pdfPage"] == undefined) {

      const { jsonData, newGuid } = this.socketService.makeJsonDataById('CacheRule', this.data[0].data[0].sbid, '2002');
      this.dataSharedService.saveDebugLog('CacheRule', newGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          this.saveLoader = false;
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.saveLoader = false;
            if (res.isSuccess) {
              this.getCacheRule(res);
              this.applyApplicationTheme(this.data[0]);
            } else {
              this.applyApplicationTheme(this.data[0]);
            }

          }

        }
      });


      // this.requestSubscription = this.applicationService.getNestCommonAPIById("cp/ActionRule", this.data[0].data[0].screenBuilderId).subscribe({
      //   next: (actions: any) => {
      //     this.actionRuleList = actions?.data;
      //     this.actionsBindWithPage(this.data[0]);
      //   },
      //   error: (err) => {
      //     this.actionsBindWithPage(this.data[0]);
      //     console.error(err);
      //     // this.toastr.error("An error occurred", { nzDuration: 3000 });
      //   }
      // })
    }
  }
  async getBuilderScreen(params: any) {
    this.saveLoader = true;
    const pageName = params["schema"];
    const domain = window.location.hostname;
    const existingData = await this.autoMergeService.getNode(pageName, domain);
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('Builders', params["schema"], '2025', null, null, existingData?.vid);
    this.dataSharedService.saveDebugLog('getBuilderScreen', newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: async (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          this.saveLoader = false;
          res = res.parseddata.apidata;
          if (res.response.isSuccess) {
            if (res.versionchange == true && res?.response?.data.length > 0) {
              localStorage.setItem('screenBuildId', res.response.data[0].sbid);
              if (existingData) {
                // Data exists, update it
                await this.autoMergeService.updateData(pageName, res.response, domain, res.response.data[0]?.udate);
              } else {
                // Data doesn't exist, save it
                await this.autoMergeService.saveData(pageName, res.response, domain, res.response.data[0]?.udate);
              }
              this.handleCacheRuleRequest(res.response.data[0].sbid, res.response);
            }
            else if (res.versionchange == false && res?.response?.data == false) {
              const indexeddbres = await this.autoMergeService.getNode(pageName, domain);
              localStorage.setItem('screenBuildId', indexeddbres.jsonData.data[0].sbid);
              this.handleCacheRuleRequest(indexeddbres.jsonData.data[0].sbid, indexeddbres.jsonData);
            }
            else if (res?.response?.data.length > 0) {
              localStorage.setItem('screenBuildId', res.response.data[0].sbid);
              this.handleCacheRuleRequest(res.response.data[0].sbid, res.response);
              if (existingData) {
                // Data exists, update it
                await this.autoMergeService.updateData(pageName, res.response, domain, res.response.data[0]?.udate);
              } else {
                // Data doesn't exist, save it
                await this.autoMergeService.saveData(pageName, res.response, domain, res.response.data[0]?.udate);
              }
            }

          }
          else {
            this.toastr.error(res.message, { nzDuration: 3000 });
            this.saveLoader = false;
          }
        }
      },
      error: (err) => {
        console.error(err);
        this.saveLoader = false;
      }
    });
  }
  handleCacheRuleRequest(screenBuilderId: any, res: any) {
    this.saveLoader = true;
    const { jsonData, newGuid } = this.socketService.makeJsonDataById('CacheRule', screenBuilderId, '2002');
    this.dataSharedService.saveDebugLog('CacheRule', newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (rule: any) => {
        if (rule.parseddata.requestId == newGuid && rule.parseddata.isSuccess) {
          rule = rule.parseddata.apidata;
          this.saveLoader = false;
          this.getCacheRule(rule);
          this.applyApplicationTheme(res);
        }
      },
      error: (err) => {
        this.saveLoader = false;
        console.error(err);
        // this.toastr.error("An error occurred", { nzDuration: 3000 });
      }
    });
  }
  editData: any;
  actionsBindWithPage(res: any, res1: any) {

    this.screenId = res.data[0].sbid;
    this.screenName = res.data[0].screenname;
    this.navigation = res.data[0].navigation;
    this.dataSharedService.currentPageLink = this.navigation;
    let data = res.data[0].screendata;

    if (typeof data === 'string') {
      // It's a JSON string, parse it
      data = JSON.parse(data);
    }
    document.documentElement.style.setProperty('--pagePrimaryColor', data[0]?.primaryColor);
    document.documentElement.style.setProperty('--pageSecondaryColor', data[0]?.secondaryColor);
    let nodesData = this.jsonParseWithObject(this.jsonStringifyWithObject(data));
    this.resData = nodesData;
    if (this.screenData) {
      let parseData = JSON.parse(JSON.stringify(this.screenData.uiData));
      let newData = JSON.parse(JSON.stringify(this.resData))
      parseData.forEach((rule: any) => {
        if (rule.targetCondition.length > 0) {
          rule.targetCondition.forEach((ruleChild: any) => {
            let findObj = this.findObjectByKey(newData[0], ruleChild.targetName);
            ruleChild['inputJsonData'] = findObj ? findObj : {};
            ruleChild['inputOldJsonData'] = findObj ? JSON.parse(JSON.stringify(findObj)) : {};

          })
        }
      });
      try {
        let originalData = JSON.parse(JSON.stringify({ uiData: parseData }));
        let objUiData = this.screenData?.patchOperations ? applyPatch(originalData, this.screenData?.patchOperations).newDocument : parseData;
        objUiData = objUiData.uiData ? objUiData.uiData : objUiData;
        this.screenData.uiData = objUiData;
        const checkLoadtype = this.screenData?.uiData?.filter((a: any) => a.actionType == 'load');
        if (checkLoadtype?.length > 0) {
          const field = {
            title: "User Policy",
            key: "policyId",
            type: 'string'
          }
          this.checkConditionUIRule(field, this.user?.policy?.policyId, 'policy');
        }
      } catch (error) {

      }
    }
    let nodesData1 = this.jsonParseWithObject(this.jsonStringifyWithObject(this.resData));
    this.dataSharedService.checkContentForFixFooter = this.jsonParseWithObject(this.jsonStringifyWithObject(data));
    if (this.actionRuleList.length > 0) {
      nodesData1 = this.bindsActionRules(nodesData1);
      this.resData = nodesData1;
    } else
      this.resData = nodesData1;
    // this.uiRuleGetData({ key: 'text_f53ed35b', id: 'formly_86_input_text_f53ed35b_0' });

    this.pageRuleList = this.actionRuleList.filter(a => a.componentfrom === this.resData?.[0]?.key && a.action == 'load');
    if (this.tableRowID) {
      if (this.pageRuleList.length > 0) {
        // const observables = this.pageRuleList.map((element: any) => {
        //   return this.applicationService.callApi('knex-query/getexecute-rules/' + element.id, 'get', '', '', this.tableRowID).pipe(
        //     catchError((error: any) => of(error)) // Handle error and continue the forkJoin
        //   );
        // });
        // this.saveLoader = true;
        // this.requestSubscription = forkJoin(observables).subscribe({
        //   next: (results: any) => {
        //     this.saveLoader = false;
        //     results.forEach((res: any) => {
        //       if (res.data.length > 0) {
        //         this.editData = res.data;
        //         this.formValueAssign(res.data);
        //       }
        //     });

        //   },
        //   error: (err) => {
        //     this.saveLoader = false;
        //     console.error(err);
        //     this.toastr.error("Actions not saved", { nzDuration: 3000 });
        //   }
        // });

      }
    }
    // this.requestSubscription = this.applicationService.getNestCommonAPI('cp/applicationTheme').subscribe({
    //   next: (res: any) => {
    //     if (res.isSuccess) {
    //       if (res.data.length > 0) {
    //         res.data.forEach((appTheme: any) => {
    //           const classesToAdd = appTheme?.classes;
    //           this.addClasses(appTheme?.name, classesToAdd);
    //         });
    //       }
    //     }
    //     else {
    //       this.toastr.error(res.message, { nzDuration: 3000 }); // Show an error message to the user
    //       this.saveLoader = false;
    //     }
    //   },
    //   error: (err) => {
    //     console.error(err); // Log the error to the console
    //     this.toastr.error("An error occurred", { nzDuration: 3000 }); // Show an error message to the user
    //     this.saveLoader = false;
    //   }
    // });
    this.checkDynamicSection();
    this.applyDefaultValue();
    if (this.pdf == true) {
      this.captureAndGeneratePDF();
    }
    this.dataSharedService.fixedFooter = this.resData[0].fixedFooter ? true : false;
  }
  formValueAssign(data: any) {
    if (data && this.screenData) {
      this.countRule = this.countRule + 1;
      let makeModel: any = JSON.parse(JSON.stringify(this.formlyModel?.[this.screenId]));
      if (this.formlyModel?.[this.screenId]) {
        for (const key in this.formlyModel?.[this.screenId]) {
          if (this.formlyModel?.[this.screenId].hasOwnProperty(key)) {
            if (typeof this.formlyModel?.[this.screenId][key] === 'object') {
              for (const key1 in this.formlyModel?.[this.screenId][key]) {
                if (data[0][key + '.' + key1])
                  makeModel[key][key1] = data[0][key + '.' + key1]
              }
            }
            else {
              if (data[0][key])
                makeModel[key] = data[0][key];
            }
          }
        }
      }
      this.formlyModel[this.screenId] = makeModel;
      this.form.patchValue(this.formlyModel?.[this.screenId]);
    }
  }
  saveData(data: any) {
    if (data.isSubmit) {
      this.saveData1(data);
    }
  }
  submit() {
    this.dataModel = this.formlyModel?.[this.screenId];
  }
  saveData1(data: any) {

    // let checkButtonConfig = this.findObjectByKey(this.r, data.key);
    if (data) {
      // this.submit();
      const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
      let oneModelData = this.convertModel(this.dataModel);
      if (Object.keys(oneModelData).length > 0) {
        let findClickApi = data.appConfigurableEvent.filter((item: any) => item.rule.includes('post_'));
        let empData: any = {};
        empData = {
          screenId: this.screenName,
          modalData: oneModelData
        };
        console.log(empData);
        const tableNames = new Set();

        for (const key in empData.modalData) {
          const tableName = key.split('.')[0];
          tableNames.add(tableName);
        }

        const Arraytables = Array.from(tableNames)
        const remainingTables = Arraytables.slice(1);
        let id; findClickApi[0];
        for (const key in empData?.modalData) {
          if (empData?.modalData[key] == undefined) {
            empData.modalData[key] = '';
          }
        }
        for (const key in empData?.modalData) {
          if (empData.modalData.hasOwnProperty(key) &&
            key.endsWith('.id') &&
            empData.modalData[key]) {
            id = key;
          }
        }
        if (id == undefined) {
          if (!checkPermission.creates) {
            alert("You did not have permission");
            return;
          }
          // this.dataSharedService.sectionSubmit.next(false);
          findClickApi = data.appConfigurableEvent.filter((item: any) => item.rule.includes('post_'));
          if (findClickApi?.[0]?.id) {
            this.dataSharedService.imageUrl = '';
            this.requestSubscription = this.activatedRoute.params.subscribe((params: Params) => {
              if (params["id"]) {
                for (const key in empData.modalData) {
                  if (key.includes('id') && key != 'id') {
                    empData.modalData[key] = params["id"];
                  }
                }
              }
            });
            this.saveLoader = true;

          }

        }
        else {
          if (!checkPermission.update) {
            alert("You did not have permission");
            return;
          }
          // this.dataSharedService.sectionSubmit.next(false);
          findClickApi = data.appConfigurableEvent.filter((item: any) => item.rule.includes('put_'));
          if (this.dataModel) {
            // this.form.get(dynamicPropertyName);
            const model = {
              screenId: this.screenName,
              postType: 'put',
              modalData: empData.modalData
            };
            // const removePrefix = (data: Record<string, any>): Record<string, any> => {
            //   const newData: Record<string, any> = {};
            //   for (const key in data) {
            //     const lastDotIndex = key.lastIndexOf('.');
            //     const newKey = lastDotIndex !== -1 ? key.substring(lastDotIndex + 1) : key;
            //     newData[newKey] = data[key];
            //   }
            //   return newData;
            // };

            const result = {
              ...model,
              modalData: model.modalData
              // modalData: removePrefix(model.modalData)
            };
            // console.log(result);
            this.saveLoader = true;
            // this.dataSharedService.sectionSubmit.next(false);

          }
        }
      }
    }
  }
  getFromQuery() {
    let tableData = this.findObjectByTypeBase(this.resData[0], "gridList");
    if (tableData) {
      let findClickApi = tableData?.appConfigurableEvent?.filter((item: any) =>
        (item.actionLink === 'get' && (item.actionType === 'api' || item.actionType === 'query'))

      );

      if (findClickApi) {
        if (findClickApi.length > 0) {
          let url = `knex-query/getexecute-rules/${findClickApi.id}`;
          // for (let index = 0; index < findClickApi.length; index++) {
          //   let element = findClickApi[index].actionType;
          //   if (element == 'query') {
          //     url = `knex-query/getAction/${findClickApi[index].id}`;
          //     break;
          //   } else {
          //     url = `knex-query/getAction/${findClickApi[index].id}`;
          //   }
          // }
          if (url) {
            if (tableData) {
              // let pagination = '';
              // if (tableData.serverSidePagination) {
              //   pagination = '?page=' + 1 + '&pageSize=' + tableData?.end;
              // }


            }
          }
        }
      }

    }

  }
  gridRulesData: any[] = [];
  assignGridRules(data: any) {
    if (this.gridRulesData.length > 0) {
      this.gridRules(this.gridRulesData, data);
    }
  }
  gridRules(getRes: any, data: any) {
    let gridFilter = getRes.data.filter((a: any) => a.gridType == 'Body');
    for (let m = 0; m < gridFilter.length; m++) {
      if (gridFilter[m].gridKey == data.key && data.tableData) {
        const objRuleData = JSON.parse(gridFilter[m].businessRuleData);
        for (let index = 0; index < objRuleData.length; index++) {
          const elementv1 = objRuleData[index];
          let checkType = Object.keys(data.tableData[0]).filter(a => a == elementv1.target);
          if (checkType.length == 0) {
            console.log("No obj Found!")
          }
          else {
            for (let j = 0; j < data.tableData.length; j++) {
              //query
              let query: any;
              if (elementv1.oprator == 'NotNull')
                query = "1==1"
              else {
                let firstValue = data.tableData[j][elementv1.ifCondition] ? data.tableData[j][elementv1.ifCondition] : "0";
                query = firstValue + elementv1.oprator + elementv1.getValue
              }

              if (this.evaluateGridCondition(query)) {
                for (let k = 0; k < elementv1.getRuleCondition.length; k++) {
                  const elementv2 = elementv1.getRuleCondition[k];
                  if (elementv1.getRuleCondition[k].referenceOperator != '') {
                    data.tableData[j][elementv1.target] = this.evaluateGridConditionOperator(`${data.tableData[j][elementv2.ifCondition]} ${elementv1.getRuleCondition[k].oprator} ${data.tableData[j][elementv2.target]}`);
                    data.tableData[j]['color'] = elementv1.getRuleCondition[k].referenceColor;
                  } else {
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
  evaluateGridCondition(condition: string): boolean {
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
  UiRuleCondition(condition: string): boolean {
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

    const logicalOperatorsRegex = /\s+(&&|||)\s+/;
    const conditionParts = condition.split(logicalOperatorsRegex);

    const evaluateExpression = (expr: string): boolean => {
      const [leftOperand, operator, rightOperand] = expr.split(/(==|!=|>=|<=|=|>|<|null|contains)/).map(part => part.trim());

      if (!operators[operator]) {
        throw new Error(`Unknown operator: ${operator}`);
      }

      return operators[operator](leftOperand, rightOperand);
    };

    const evaluateCondition = (condition: string): boolean => {
      if (condition.includes("&&")) {
        const subConditions = condition.split(" && ");
        return subConditions.every(subCondition => evaluateCondition(subCondition));
      } else if (condition.includes("||")) {
        const subConditions = condition.split(" || ");
        return subConditions.some(subCondition => evaluateCondition(subCondition));
      } else {
        return evaluateExpression(condition);
      }
    };

    return evaluateCondition(condition);
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
  convertModel(model: any, parentKey = "") {
    const convertedModel: any = {};

    for (const key in model) {
      if (model.hasOwnProperty(key)) {
        const value = model[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
          Object.assign(convertedModel, this.convertModel(value, newKey.toLocaleLowerCase()));
        } else {
          convertedModel[newKey.toLocaleLowerCase()] = value;
        }
      }
    }

    return convertedModel;
  }
  setInternalValuesEmpty = (obj: any) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.setInternalValuesEmpty(obj[key]);
      } else {
        const isAnyContractMatching = obj[key].some((contract: string) => dateRegex.test(contract));
        if (isAnyContractMatching) {
          obj[key] = [];
        } else {
          obj[key] = '';
        }
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
  jsonParseWithObject(data: any) {
    return JSON.parse(
      data, (key, value) => {
        if (typeof value === 'string' && value.startsWith('(') && value.includes('(model)')) {
          return eval(`(${value})`);
        }
        return value;
      });
  }
  jsonStringifyWithObject(data: any) {
    return JSON.stringify(data, function (key, value) {
      if (typeof value == 'function') {
        return value.toString();
      } else {
        return value;
      }
    }) || '{}'
  }


  uiRuleGetData(moduleId: any) {
    this.makeFaker();
    this.checkConditionUIRule({ key: 'text_f53ed35b', id: 'formly_86_input_text_f53ed35b_0' }, '');
    this.updateFormlyModel();
    // this.getUIRuleData();
  }
  updateNodes() {
    this.resData = [...this.resData];
  }
  checkConditionUIRule(model: any, currentValue: any, policy?: string, indexNumber?: any) {

    this.getUIRule(model, currentValue, policy, indexNumber);
    this.updateNodes();
    // this.resData = this.jsonParseWithObject(this.jsonStringifyWithObject(this.resData));
    // this.cdr.detectChanges();
    // this.cdr.detach();
  }
  getUIRule(model: any, currentValue: any, policy?: string, indexNumber?: any) {
    try {
      if (this.navigation) {
        if (this.businessRuleData) {
          if (this.businessRuleData.length > 0) {
            this.applyRules(this.formlyModel?.[this.screenId], this.businessRuleData);
            this.updateFormlyModel();
            // this.cdr.detach();
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
    finally {
      if (this.screenData != undefined) {
        var inputType = this.resData[0].children[1].children;
        if (inputType) {
          let screenData = cloneDeep(this.screenData);
          // inputType = sectionData;
          let updatedKeyData: any[] = [];

          let checkFirst = false;
          if (policy && policy != 'policy') {
            this.uiRuleLogic(model, indexNumber, screenData, policy, currentValue, inputType, updatedKeyData, checkFirst)

          } else {
            for (let index = 0; index < screenData?.uiData?.length; index++) {
              this.uiRuleLogic(model, index, screenData, policy, currentValue, inputType, updatedKeyData, checkFirst)
            }
          }

          const filteredNodes = this.filterInputElements(this.resData);
          filteredNodes.forEach((node) => {
            const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.defaultValue;
            let key = node?.formly?.[0]?.fieldGroup?.[0]?.key;
            if ((formlyConfig !== undefined && formlyConfig !== null && formlyConfig !== '') && (formlyConfig === 0 || formlyConfig) && key) {
              this.formlyModel[this.screenId][key] =
                formlyConfig;
              if (node?.formly?.[0]?.fieldGroup?.[0]?.key.includes('.')) {
                if (this.formlyModel?.[this.screenId][key.split('.')[0]]) {
                  this.formlyModel[this.screenId][key.split('.')[0]][key.split('.')[1]] = formlyConfig;
                } else {
                  this.formlyModel[this.screenId][key.split('.')[0]] = {};
                  this.formlyModel[this.screenId][key.split('.')[0]][key.split('.')[1]] = formlyConfig;
                }
              }
            }
          });
        }

      }
      else {
        // this.updateFormlyModel();
      }

      this.getSetVariableRule(model, currentValue);
      // this.cdr.detectChanges();

    }
  }
  applyRules(data: any, rules: any) {
    rules = this.transformRules(rules);

    function evaluateCondition(condition: any) {
      // Remove any surrounding parentheses
      condition = condition.trim().replace(/^\(|\)$/g, '');
      if (condition.includes(' && ')) {
        const andConditions = condition.split(' && ');
        return andConditions.every((andCondition: any) => evaluateCondition(andCondition));
      } else if (condition.includes(' || ')) {
        const orConditions = condition.split(' || ');
        return orConditions.some((orCondition: any) => evaluateCondition(orCondition));
      } else {
        let [key, operator, value] = condition.split(' ').map((s: any) => s.trim());
        value = value.replace(/['"]/g, ''); // remove quotes
        switch (operator) {
          case '==':
            return data[key] == value;
          case '!=':
            return data[key] != value;
          case '>=':
            return data[key] >= value;
          case '<=':
            return data[key] <= value;
          case '>':
            return data[key] > value;
          case '<':
            return data[key] < value;
          default:
            throw new Error(`Unknown operator: ${operator}`);
        }
      }
    }

    for (let rule of rules) {
      const conditions = rule.if.split('||').map((condition: any) => condition.trim());
      const conditionResults = conditions.map((condition: any) => evaluateCondition(condition));

      if (conditionResults.some((result: any) => result)) { // Change .every to .some
        let thenActions = rule.then;
        for (let action of thenActions) {
          action = action.trim().replace("'then' :", ''); // remove quotes
          let [key, value] = action.split('=').map((s: any) => s.trim());
          if (action.includes('(')) {
            for (const dataKey in data) {
              if (typeof data[dataKey] === 'object') {
                for (const key1 in data[dataKey]) {
                  if (value.includes(`${data[dataKey]}.${key1}`)) {
                    value = value.replaceAll(`${data[dataKey]}.${key1}`, data[dataKey][key1]); // Update the property value
                  }
                }
              } else if (value.includes(dataKey)) {
                if (data[dataKey]) {
                  value = value.replaceAll(dataKey, data[dataKey]); // Update the property value
                } else {
                  value = value.replaceAll(dataKey, 0);
                }
              }
            }
            let formattedString = `${value.substring(1, value.length - 1)}`;
            let newValue = eval(formattedString);
            if (key.includes('.')) {
              if (data[key.split('.')[0]]) {
                data[key.split('.')[0]][key.split('.')[1]] = newValue
              } else {
                data[key.split('.')[0]] = {};
                data[key.split('.')[0]][key.split('.')[1]] = newValue
              }
            }
            data[key] = newValue
          }
          else if (action.includes('.')) {
            let actionKey = action.split('.');
            let modelKey = key.split('.')[1];
            data[actionKey[0]][modelKey] = value.replace(/'/g, '');
          }
          else {
            data[key] = value.replace(/'/g, '');
          }
        }
      }
      else {
        let thenActions = rule.then;
        for (let action of thenActions) {
          action = action.trim().replace("'then' :", ''); // remove quotes
          let [key, value] = action.split('=').map((s: any) => s.trim());
          if (action.includes('.')) {
            let actionKey = action.split('.');
            let modelKey = key.split('.')[1];
            data[actionKey[0]][modelKey] = '';
          } else {
            data[key] = '';
          }
        }
      }
    }
    return data;
  }

  transformRules(oldRules: any[]): any[] {
    return oldRules.map(rule => {
      let newRule = { ...rule };  // clone rule
      let thenActions = !rule.then.includes('formulajs') ? rule.then.split(',').map((s: any) => s.trim()) : [rule.then];

      newRule.then = thenActions.map((action: any) => {
        let [key, value] = action.split('=').map((s: any) => s.trim());
        return `${key} = ${value}`;
      });

      return newRule;
    });
  }
  getSetVariableRule(model: any, value: any) {
    //for grid amount assign to other input field
    const filteredNodes = this.filterInputElements(this.resData);
    filteredNodes.forEach(node => {
      const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.props?.config;
      if (formlyConfig?.setVariable)
        if (formlyConfig?.setVariable === model?.props?.config?.getVariable) {
          this.formlyModel[this.screenId][node?.formly?.[0]?.fieldGroup?.[0]?.key] = value;
        }
    });
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

  getCacheRule(getRes: any) {

    getRes.data.forEach((res: any) => {
      if (res.name?.toLowerCase().includes(`businessrule`)) {
        if (res.data) {
          this.businessRuleData = [];
          if (res.data.businessrule)
            this.businessRuleData = res.data.businessrule?.json
        }
      }
      else if (res.name?.toLowerCase().includes(`businessrule`)) {
        if (res.data) {
          this.gridRulesData = res;
        }
      }
      else if (res.name?.toLowerCase().includes(`validationrule`)) {
        if (res.data) {
          this.joiValidationData.push(res.data.data.json);
        }
      }
      else if (res.name?.toLowerCase().includes(`actionrule`)) {
        this.actionRuleList.push(res.data);
      }
      else if (res.name?.toLowerCase().includes(`uirule`)) {
        if (res.data) {
          // res.data = res.data.json;
          const jsonUIResult = {
            "key": res.data?.json ? res.data.json.key : res.data.key,
            "title": res.data?.json ? res.data.json.title : res.data.title,
            "screenName": res.data?.json ? res.data.json.screenname : res.data.screenname,
            "screenId": res.data?.json ? res.data.json.sbid : res.data.sbid,
            "uiData": res.data?.json ? res.data.json.uidata.json : res.data.uidata.json,
            "patchOperations": res.data?.json ? res.data.json.patchoperations.json : res.data.patchoperations.json
          }
          this.screenData = jsonUIResult;
        } else {
          this.screenData = null;
        }
      }
    });
  }
  makeFaker() {
    let dataModelFaker: any = [];
    if (this.resData.length > 0) {
      const filteredNodes = this.filterInputElements(this.resData);
      filteredNodes.forEach(node => {
        dataModelFaker[node.formly[0].fieldGroup[0].key] = this.makeFakerData(node);
      });
    }
    this.formlyModel[this.screenId] = dataModelFaker;
    this.updateFormlyModel();
  }
  updateFormlyModel() {
    this.formlyModel[this.screenId] = Object.assign({}, this.formlyModel?.[this.screenId])
  }
  evalConditionRule(query: any, dataTargetIfValue: any, policy?: string) {
    dataTargetIfValue.forEach((e: any) => {
      let type = e.conditonType == "AND" ? "&&" : "||";
      type = query == '' ? "" : type;
      const checkValue = policy ? this.user?.policy?.policyid : this.formlyModel?.[this.screenId][e.ifMenuName]
      let getModelValue = checkValue == "" ? "''" : checkValue;
      if (getModelValue == undefined)
        getModelValue = "";

      if (e.condationName == 'contains') {
        if (this.formlyModel?.[this.screenId][e.ifMenuName] != undefined && this.formlyModel?.[this.screenId][e.ifMenuName].includes(e.targetValue))
          query = query + " " + type + " " + '1 == 1';
        else
          query = query + " " + type + " " + '1 == 2';
      } else if (e.condationName == 'null') {
        if (typeof (this.formlyModel?.[this.screenId][e.ifMenuName]) != "number") {
          if (this.formlyModel?.[this.screenId][e.ifMenuName] == '' || this.formlyModel?.[this.screenId][e.ifMenuName] == null)
            query = query + " " + type + " " + '1 == 1';
          else
            query = query + " " + type + " " + '1 == 2';
        }
        else
          query = query + " " + type + " " + '1 == 2';
      } else {
        if (e.ifMenuName.includes('number') || e.ifMenuName.includes('decimal')) {
          query = query + " " + type + " " + Number(getModelValue) + " " + e.condationName + " " + e.targetValue;
        }
        else {
          query = query + " " + type + " '" + getModelValue + "' " + e.condationName + " '" + e.targetValue + "'";
        }
      }
    });
    return query;
  }
  makeFakerData(V2: any) {
    if (V2.formly[0].fieldGroup[0].props) {
      let modelFaker: any;
      if (V2.formly[0].fieldGroup[0].props.type) {
        if (V2.formly[0].fieldGroup[0].type == 'input') {
          // modelFaker = faker.name.firstName()
        }
        else if (V2.formly[0].fieldGroup[0].type == 'textarea') {
          // modelFaker = faker.lorem.paragraph()
        }
        else if (V2.formly[0].fieldGroup[0].type == 'inputGroupGrid') {
          // modelFaker = faker.name.firstName()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'password') {
          // modelFaker = faker.name.firstName()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'tel') {
          // modelFaker = faker.phone.number()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'date') {
          // modelFaker = faker.date.between('01/01/2001', '01/01/2001');
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'email') {
          // modelFaker = faker.internet.email()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'checkbox') {
          // modelFaker = faker.datatype.boolean()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'radio') {
          // modelFaker = faker.datatype.boolean()
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'number') {
          // modelFaker = 1
          // modelFaker = faker.datatype.number(10)
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'decimal') {
          // modelFaker = 0.0
          // modelFaker = faker.datatype.float({ min: 10, max: 100, precision: 0.001 })
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'month') {
          // modelFaker = faker.date.month({ abbr: true, context: true })
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'datetime-local') {
          // modelFaker = faker.datatype.datetime(1893456000000)
        }
        else if (V2.formly[0].fieldGroup[0].props.type == 'color') {
          // modelFaker = faker.color.colorByCSSColorSpace()
        }
      }
      else if (V2.formly[0].fieldGroup[0].type) {
        if (V2.formly[0].fieldGroup[0].type == 'input') {
          // modelFaker = faker.name.firstName()
        }
        else if (V2.formly[0].fieldGroup[0].type == 'textarea') {
          // modelFaker = faker.lorem.paragraph()
        }
        else if (V2.formly[0].fieldGroup[0].type == 'inputGroupGrid') {
          // modelFaker = faker.name.firstName()
        }
      }
      return modelFaker;
    }
  }
  getAllObjects(data: any): any[] {
    const foundObjects: any[] = [];

    function recursiveFind(currentData: any) {
      if (currentData) {
        foundObjects.push(currentData);

        if (currentData.children && currentData.children.length > 0) {
          for (const child of currentData.children) {
            recursiveFind(child);
          }
        }
      }
    }

    recursiveFind(data);
    return foundObjects;
  }
  makeUIJSONForSave(uiData: any, inputType: any, updatedKeyData: any, currentValue: boolean) {
    let comingData = inputType;
    for (let index = 0; index < comingData.length; index++) {
      let element = comingData[index];
      for (let k = 0; k < uiData.targetCondition.length; k++) {
        if (currentValue) {
          // const checkAlready = updatedKeyData.find((a: any) => a == uiData.targetCondition[k].inputOldJsonData.id)
          // if (!checkAlready) {

          // }
          updatedKeyData.push(uiData.targetCondition[k].inputJsonData.id)
          this.updateObjectById(element, uiData.targetCondition[k].inputJsonData.id, uiData.targetCondition[k].inputJsonData);
          this.cdr.detectChanges();
        }
        else if (!currentValue) {
          const checkAlready = updatedKeyData.find((a: any) => a == uiData.targetCondition[k].inputOldJsonData.id);
          if (!checkAlready)
            this.updateObjectById(element, uiData.targetCondition[k].inputOldJsonData.id, uiData.targetCondition[k].inputOldJsonData)
        }
      }
    }
    return comingData;

    // for (let j = 0; j < inputType.length; j++) {
    //   let element = inputType[j];
    //   if (this.screenData.uiData[index].targetCondition[k].targetName == element.key && currentValue) {
    //     inputType[j] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //   }
    //   else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].key && !currentValue)
    //     inputType[j] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //   else {
    //     for (let l = 0; l < inputType[j].children[1].children.length; l++) {
    //       if (inputType[j].children[1].children[l].type == "button" || inputType[j].children[1].children[l].type == "linkButton" || inputType[j].children[1].children[l].type == "dropdownButton") {
    //         if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && currentValue) {
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //         } else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && !currentValue)
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //       } else if (inputType[j].children[1].children[l].type == "buttonGroup") {
    //         if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && currentValue)
    //           inputType[j].children[1].children[l].children = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //         else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && !currentValue)
    //           inputType[j].children[1].children[l].children = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //       }
    //       else if (inputType[j].children[1].children[l].type == "input" || inputType[j].children[1].children[l].type == "inputGroup" || inputType[j].children[1].children[l].type == "checkbox" ||
    //         inputType[j].children[1].children[l].type == "color" || inputType[j].children[1].children[l].type == "decimal" || inputType[j].children[1].children[l].type == "image" ||
    //         inputType[j].children[1].children[l].type == "multiselect" || inputType[j].children[1].children[l].type == "radiobutton" || inputType[j].children[1].children[l].type == "search" ||
    //         inputType[j].children[1].children[l].type == "repeatSection" || inputType[j].children[1].children[l].type == "tags" || inputType[j].children[1].children[l].type == "telephone" ||
    //         inputType[j].children[1].children[l].type == "textarea" || inputType[j].children[1].children[l].type == "date" || inputType[j].children[1].children[l].type == "datetime" ||
    //         inputType[j].children[1].children[l].type == "month" || inputType[j].children[1].children[l].type == "time" || inputType[j].children[1].children[l].type == "week") {
    //         if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].formly[0].fieldGroup[0].key && currentValue) {
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //         } else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].formly[0].fieldGroup[0].key && !currentValue) {
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //         }
    //       } else if (inputType[j].children[1].children[l].type == "alert" || inputType[j].children[1].children[l].type == "heading" || inputType[j].children[1].children[l].type == "paragraph" ||
    //         inputType[j].children[1].children[l].type == "tag" || inputType[j].children[1].children[l].type == "card" || inputType[j].children[1].children[l].type == "simpleCardWithHeaderBodyFooter" ||
    //         inputType[j].children[1].children[l].type == "cascader" || inputType[j].children[1].children[l].type == "mentions" || inputType[j].children[1].children[l].type == "transfer" ||
    //         inputType[j].children[1].children[l].type == "treeSelect" || inputType[j].children[1].children[l].type == "switch" || inputType[j].children[1].children[l].type == "avatar" ||
    //         inputType[j].children[1].children[l].type == "badge" || inputType[j].children[1].children[l].type == "treeView" || inputType[j].children[1].children[l].type == "carouselCrossfade" ||
    //         inputType[j].children[1].children[l].type == "comment" || inputType[j].children[1].children[l].type == "description" || inputType[j].children[1].children[l].type == "statistic" ||
    //         inputType[j].children[1].children[l].type == "empty" || inputType[j].children[1].children[l].type == "list" || inputType[j].children[1].children[l].type == "popConfirm" ||
    //         inputType[j].children[1].children[l].type == "timeline" || inputType[j].children[1].children[l].type == "popOver" || inputType[j].children[1].children[l].type == "imageUpload" ||
    //         inputType[j].children[1].children[l].type == "invoice" || inputType[j].children[1].children[l].type == "segmented" || inputType[j].children[1].children[l].type == "drawer" ||
    //         inputType[j].children[1].children[l].type == "message" || inputType[j].children[1].children[l].type == "notification" || inputType[j].children[1].children[l].type == "modal" ||
    //         inputType[j].children[1].children[l].type == "progressBar" || inputType[j].children[1].children[l].type == "result" || inputType[j].children[1].children[l].type == "skeleton" ||
    //         inputType[j].children[1].children[l].type == "spin" || inputType[j].children[1].children[l].type == "accordionButton" || inputType[j].children[1].children[l].type == "audio" ||
    //         inputType[j].children[1].children[l].type == "multiFileUpload" || inputType[j].children[1].children[l].type == "rate" || inputType[j].children[1].children[l].type == "toastr" ||
    //         inputType[j].children[1].children[l].type == "video") {
    //         if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && currentValue)
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //         else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && !currentValue)
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //       } else if (inputType[j].children[1].children[l].type == "mainDashonicTabs") {
    //         for (let m = 0; m < inputType[j].children[1].children[l].children.length; m++) {
    //           if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].children[m].key && currentValue)
    //             inputType[j].children[1].children[l].children[m] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //           else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].children[m].key && !currentValue)
    //             inputType[j].children[1].children[l].children[m] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //         }
    //       } else if (inputType[j].children[1].children[l].type == "stepperMain") {
    //         for (let m = 0; m < inputType[j].children[1].children[l].children.length; m++) {
    //           if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].children[m].formly[0].fieldGroup[0].key && currentValue)
    //             inputType[j].children[1].children[l].children[m] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //           else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].children[m].formly[0].fieldGroup[0].key && !currentValue)
    //             inputType[j].children[1].children[l].children[m] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //         }
    //       }
    //       else if (inputType[j].children[1].children[l].type == "gridList" || inputType[j].children[1].children[l].type == "gridListEditDelete") {
    //         if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && currentValue)
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputJsonData;
    //         else if (this.screenData.uiData[index].targetCondition[k].targetName == inputType[j].children[1].children[l].key && !currentValue)
    //           inputType[j].children[1].children[l] = this.screenData.uiData[index].targetCondition[k].inputOldJsonData;
    //       }
    //     }
    //   }
    // }

    // return inputType;
  }

  sectionRepeat(section: any) {
    try {

      const idx = this.resData[0].children[1].children.indexOf(section as TreeNode);
      let newNode = JSON.parse(JSON.stringify(section));
      let obj = { node: newNode, type: 'copy' };
      let numberOfSections = this.countOccurrences(this.resData[0].children[1].children);
      if (numberOfSections[newNode.key] == 1) {
        this.findObjectByKeyAndReplace(this.resData[0], newNode.key);
        // if (findObj) {
        //   let newObj = { node: findObj, type: 'copy' };
        //   this.traverseAndChange(newObj, 0);
        // }
      }
      this.traverseAndChange(obj, numberOfSections[newNode.key]);
      this.resData[0].children[1].children.splice(idx as number + 1, 0, obj.node);
      // this.resData = [...this.resData];
    } catch (error: any) {
      console.error('An error occurred:', error);
    }
  }
  changeIdAndkey(node: any, key: any) {
    if (node.formly) {
      if (node.formly[0].key) {
        let formlyKey = node.formly[0].key;
        const parts = formlyKey.split('_');
        const lastPart = parts[parts.length - 1];
        if (/\d/.test(lastPart)) {
          node.formly[0].key = formlyKey.replace(lastPart, key);
        } else {
          node.formly[0].key = formlyKey + '_' + key;
        }
      } else if (node.formly[0].fieldGroup[0].key) {
        let formlyKey = node.formly[0].fieldGroup[0].key;
        const parts = formlyKey.split('_');
        const lastPart = parts[parts.length - 1];
        if (/\d/.test(lastPart)) {
          node.formly[0].fieldGroup[0].key = formlyKey.replace(lastPart, key);
        } else {
          node.formly[0].fieldGroup[0].key = formlyKey + '_' + key;
        }
      }
    }
    return node;
  }


  traverseAndChange(event: any, key: any) {
    if (event.node) {
      if (event.type == 'copy') {
        event.node = this.changeIdAndkey(event.node, key);
      }
      else if (event.type == 'disabled') {
        event.node = this.disabledAndEditableSection(event.node);
      }
      if (event.node.children) {
        event.node.children.forEach((child: any) => {
          let obj = { node: child, type: event.type };
          this.traverseAndChange(obj, key);
        });
      }
    }
  }
  disabledAndEditableSection(data: any) {

    if (data.formlyType) {
      if (data.formlyType == "input") {
        data.formly[0].fieldGroup[0].props.disabled = data.formly[0].fieldGroup[0].props.disabled ? false : true;
      };
    };
    return data;
  };
  checkDynamicSection(id?: any, removeValue?: any) {
    if (this.resData) {
      this.recursiveCheck(this.resData[0].children[1].children, id, removeValue);
    }
  }
  recursiveCheck(data: any, id?: any, removeValue?: any): void {
    if (Array.isArray(data)) {
      data.forEach((element: any) => {
        this.recursiveCheck(element, id, removeValue);
      });
    }
    else if (typeof data === 'object' && data !== null) {
      if (data.className) {
        if (data.className.includes('$')) {
          data['appGlobalClass'] = this.changeWithGlobalClass(data.className);
        }
      }
      if (data?.innerClass) {
        if (data?.innerClass.includes('$')) {
          data['appGlobalInnerClass'] = this.changeWithGlobalClass(data?.innerClass);
        }
      }
      if (data?.iconClass) {
        if (data?.iconClass.includes('$')) {
          data['appGlobalInnerIconClass'] = this.changeWithGlobalClass(data?.iconClass);
        }
      }
      if (data?.formlyType) {
        if (data?.formlyType == 'input') {
          if (data.formly[0].fieldGroup[0].props['additionalProperties']?.innerInputClass) {
            if (data.formly[0].fieldGroup[0].props['additionalProperties']?.innerInputClass.includes('$')) {
              data.formly[0].fieldGroup[0].props['additionalProperties']['appGlobalInnerClass'] = this.changeWithGlobalClass(data.formly[0].fieldGroup[0].props['additionalProperties']?.innerInputClass);
            }
          }
        }
      }

      if (data.type) {
        if (data.type === 'sections' || data.type === 'div' || data.type === 'cardWithComponents' || data.type === 'timelineChild' || data.type === 'chat') {
          if (data.mapApi) {
            let mapApiUrl = data.mapApi;
            if (id) {
              mapApiUrl = `${data.mapApi}/${id}`;
            }
            else if (this.mappingId) {
              mapApiUrl = `${data.mapApi}/${this.mappingId}`;
            }
            if (removeValue) {
              if (data.type == 'chat') {
                data.chatData = [];
              }
              else if (data?.dbData && data?.tableBody) {
                if (data?.dbData.length > 0 && data?.tableBody.length > 0) {
                  const item = data?.dbData[0];
                  data?.tableBody.forEach((element: any) => {
                    const keyObj = this.findObjectByKey(
                      data,
                      element.fileHeader
                    );
                    for (const key in item) {
                      item[key] = '';
                    }
                    if (keyObj && element?.defaultValue) {
                      this.dataReplace(
                        keyObj,
                        item,
                        element
                      );
                    }
                  });
                  this.updateNodes();
                }
              }
            }
            this.makeDynamicSections(`${mapApiUrl}`, data);
          }
        } else if (data.type === 'listWithComponents' || data.type === 'mainTab' || data.type === 'mainStep') {
          if (data.children) {
            data.children.forEach((item: any) => {
              if (item.mapApi) {
                this.makeDynamicSections(item.mapApi, item);
              }
            });
          }
        }
      }
      if (data.children) {
        this.recursiveCheck(data.children, id, removeValue);
      }
    }
  }
  makeDynamicSections(api: any, selectedNode: any) {
    let checkFirstTime = true;
    let tabsAndStepper: any = [];
    if (api && (selectedNode.componentMapping == undefined || selectedNode.componentMapping == '' || selectedNode.componentMapping == false)) {
      this.saveLoader = true;
      try {
        const { splitApi, parentId } = this.dataSharedService.makeParentId(api)
        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId);
        this.dataSharedService.saveDebugLog('makeDynamicSections', RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res) => {
            if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              this.saveLoader = false;
              if (res.isSuccess) {
                if (res?.data) {
                  if (res?.data.length > 0) {
                    const checkLoadtype = (this.screenData?.uiData || []).map((element: any, index: any) => ({ index, element })).filter((item: any) => item.element.actionType === 'load');
                    if (checkLoadtype?.length > 0) {
                      checkLoadtype.forEach((uiRuleData: any) => {
                        let uiRule = uiRuleData.element;
                        if (uiRule.targetValue.includes('$')) {
                          const field = {
                            title: uiRule.ifMenuName,
                            key: uiRule.ifMenuName,
                            type: 'string'
                          }

                          let key = uiRule.targetValue.replace('$', '')
                          if (res?.data[0][key] && uiRule.ifMenuName && uiRule.ifMenuName.includes('app_')) {
                            let getData: any = localStorage;
                            let modifedData = JSON.parse(JSON.stringify(getData))
                            modifedData['appid'] = this.dataSharedService.decryptedValue('appid');
                            modifedData['orgid'] = this.dataSharedService.decryptedValue('orgid');
                            modifedData['user'] = this.dataSharedService.decryptedValue('user') ? this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null : null;

                            let externalLogin = this.externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
                            let value = modifedData[uiRule.ifMenuName.split('_')[1]];
                            if (uiRule.ifMenuName.includes('app_user') && modifedData['user']) {
                              value = modifedData['user'][uiRule.ifMenuName.split('.')[1]]
                            } else if (uiRule.ifMenuName == 'app_user.username' && externalLogin == true) {
                              let userName = this.dataSharedService.decryptedValue('username');
                              value = userName;
                            }
                            if (value == res?.data[0][key]) {
                              this.checkConditionUIRule(field, value, res?.data[0][key], uiRuleData.index);
                            }
                          }
                        }

                      });
                    }
                    if (selectedNode.type == 'chat') {
                      selectedNode.chatData = res.data;
                      this.zone.run(() => {
                        this.cdr.detectChanges();
                      });
                      this.updateNodes();
                      return;
                    }
                    for (let index = 0; index < res.data.length; index++) {
                      const item = res.data[index];
                      let newNode: any = {};
                      if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents' || selectedNode.type === 'timelineChild') {
                        newNode = JSON.parse(JSON.stringify(selectedNode?.children));
                      } else {
                        newNode = JSON.parse(JSON.stringify(selectedNode?.children?.[1]?.children?.[0]));
                      }
                      if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type === 'timelineChild' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents') {
                        if (selectedNode.tableBody) {
                          selectedNode.tableBody.forEach((element: any) => {
                            if (newNode.length) {
                              newNode.forEach((j: any) => {
                                const keyObj = this.findObjectByKey(j, element.fileHeader);
                                if (keyObj && element.defaultValue) {
                                  const updatedObj = this.dataReplace(keyObj, item, element);
                                  j = this.replaceObjectByKey(j, keyObj.key, updatedObj);
                                  if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'listWithComponentsChild') {
                                    j['mapping'] = true;
                                  }
                                }
                              });
                            }
                          });
                        }
                      } else if (selectedNode.type != 'tabs' && selectedNode.type != 'step' && selectedNode.type != 'div' && selectedNode.type != 'listWithComponentsChild' && selectedNode.type != 'listWithComponentsChild' && selectedNode.type != 'cardWithComponents') {
                        if (selectedNode.tableBody) {
                          selectedNode.tableBody.forEach((element: any) => {
                            const keyObj = this.findObjectByKey(newNode, element.fileHeader);
                            if (keyObj && element.defaultValue) {
                              const updatedObj = this.dataReplace(keyObj, item, element);
                              newNode = this.replaceObjectByKey(newNode, keyObj.key, updatedObj);
                            }
                          });
                        }
                      }
                      if (checkFirstTime) {
                        if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'div' || selectedNode.type == 'listWithComponentsChild' || selectedNode.type == 'cardWithComponents' || selectedNode.type == 'timelineChild') {
                          selectedNode.children = newNode;
                        } else if (selectedNode.children[1]) {
                          selectedNode.children[1].children = [];
                          selectedNode?.children[1]?.children?.push(newNode);
                        }
                        this.zone.run(() => {
                          this.cdr.detectChanges();
                        });
                        // this.cdr.detach();
                        // this.cdr.detectChanges();
                        this.updateNodes();
                        checkFirstTime = false
                      } else {
                        if (selectedNode.type == 'tabs' || selectedNode.type == 'step' || selectedNode.type == 'listWithComponentsChild') {
                          if (newNode.length) {
                            newNode.forEach((k: any) => {
                              if (k.mapping) {
                                tabsAndStepper.push(k);
                              }
                            });
                          }
                          if (index == res.data.length - 1) {
                            if (tabsAndStepper.length) {
                              tabsAndStepper.forEach((j: any) => {
                                selectedNode?.children?.push(j);
                              });
                            }
                            let unMapped = selectedNode?.children.filter((child: any) => child.mapping == undefined);
                            let mapped = selectedNode?.children.filter((child: any) => child.mapping);
                            selectedNode.children = mapped;
                            if (unMapped.length) {
                              unMapped.forEach((element: any) => {
                                selectedNode.children.push(element);
                              });
                            }
                            selectedNode.children.forEach((k: any) => {
                              delete k.mapping
                            });
                          }
                        } else if (selectedNode.type == 'div' || selectedNode.type == 'timelineChild' || selectedNode.type == 'cardWithComponents') {
                          let newSelected = JSON.parse(JSON.stringify(selectedNode));
                          newSelected.children = newNode;
                          let data = JSON.parse(JSON.stringify(newSelected));
                          tabsAndStepper.push(data);
                          if (index == res.data.length - 1) {
                            let checkPushOrNot = true
                            if ((selectedNode.type == 'div' || selectedNode.type == 'cardWithComponents' || selectedNode.type == 'timelineChild') && checkPushOrNot) {
                              if (tabsAndStepper) {
                                this.pushObjectsById(this.resData, tabsAndStepper, selectedNode.id);
                                checkPushOrNot = false;
                              }
                            }
                          }
                        } else if (selectedNode.children[1]) {
                          selectedNode?.children[1]?.children?.push(newNode);
                        }
                      }
                    }
                    this.saveLoader = false;

                  }
                }
                this.updateNodes();
                this.bindsActionRules(this.resData);
                this.globalclass(this.resData[0]);
              } else {
                this.toasterService.checkToaster(selectedNode, 'error');
              }
            }

          },
          error: (err) => {
            console.error(err);
            this.saveLoader = false;
            this.toastr.error("An error occurred in mapping", { nzDuration: 3000 });
          }
        })
      } catch (error) {
        // Handle the error, log it, or perform any necessary actions
        this.saveLoader = false;
        this.toastr.error('An error occurred in mapping:' + error, {
          nzDuration: 3000,
        });
        console.error('An error occurred in mapping:', error);
        // Optionally, you can rethrow the error to propagate it further
      }
    }
  }

  findObjectByType(data: any, type: any, key?: any) {
    if (data.type === type && data.key === key) {
      return data;
    }
    for (let child of data.children) {
      let result: any = this.findObjectByType(child, type, key);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
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
  findObjectByKeyAndReplace(data: any, key: any) {
    if (data) {
      if (data.key && key) {
        if (data.key === key) {
          let obj = { node: data, type: 'copy' };
          this.traverseAndChange(obj, 0);
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
  dataReplace(node: any, replaceData: any, value: any): any {
    let typeMap: any = this.dataSharedService.typeMap;
    const type = node.type;
    const key = value.componentKey ? value.componentKey : typeMap[type];
    if (node?.key == 'photo') {
      console.log(node?.key)
    }
    if (node.formly) {
      if (node.type == 'multiselect') {
        if (replaceData['orderrequest.requiredfrequency']) {
          node.formly[0].fieldGroup[0].props['additionalProperties']['maxMultipleCount'] = replaceData['orderrequest.requiredfrequency'];
        }
        replaceData[value.defaultValue] = replaceData[value.defaultValue] ? replaceData[value.defaultValue].split(',').map((name: any) => name.trim()) : [];
        this.makeModel(node, replaceData[value.defaultValue])
        return node;
      }
      else if (node.type == "checkbox" || node.type == "multiselect") {
        replaceData[value.defaultValue] = replaceData[value.defaultValue] ? replaceData[value.defaultValue].split(',') : [];
        this.makeModel(node, replaceData[value.defaultValue])
        return node;
      }
      else if (node?.formly[0]?.fieldGroup[0]?.type == "rangePicker" && (node.type == "date" || node.type == "week" || node.type == "year" ||
        node.type == "month" || node.tye == 'zorro-timePicker')) {
        this.makeModel(node, replaceData[value.defaultValue].split(','))
        return node;
      }
      else {
        this.makeModel(node, replaceData[value.defaultValue])
      }

    }
    if (node.type == 'avatar' && Array.isArray(replaceData[value.defaultValue])) {
      let nodesArray: any = [];
      replaceData[value.defaultValue].forEach((i: any) => {
        let newNode = JSON.parse(JSON.stringify(node));
        newNode.src = i;
        nodesArray.push(newNode);
      });
      return nodesArray;
    }
    else if (node.type == "tag") {
      if (Array.isArray(replaceData[value.defaultValue])) {
        node.options = replaceData[value.defaultValue];
      } else if (replaceData[value.defaultValue]) {
        node.options.push(replaceData[value.defaultValue])
      }
      return node;

    }
    else if (node.type == "pieChart") {
      node[key] = JSON.parse(replaceData[value.defaultValue]);
      return node;
    }
    else if (node.type == "barChart") {
      node['columnNames'] = JSON.parse(replaceData['columnnames']);
      node[key] = JSON.parse(replaceData[value.defaultValue]);
      node['colors'] = replaceData['colors'] ? JSON.parse(replaceData['colors']) : node['colors'];
      node['options']['colors'] = replaceData['colors'] ? JSON.parse(replaceData['colors']) : node['colors'];
      return node;
    }
    else {
      if (key) {
        node[key] = replaceData[value.defaultValue];
      }
      return node;
    }
  }
  replaceObjectByKey(data: any, key: any, updatedObj: any) {
    if (data?.key == 'div_7b80857d') {
      console.log(data.key)
    }
    if (data.key === key) {
      return updatedObj;
    }
    for (let i = 0; i < data.children.length; i++) {
      const child = data.children[i];
      if (child.key === key) {
        if (Array.isArray(updatedObj) && child.type == 'avatar') {
          let check = data.children.filter((a: any) => a.type == "avatar");
          if (check.length != 1) {
            // let getFirstAvatar = JSON.parse(JSON.stringify(check[0]));
            let deleteAvatar = check.length - 1;
            for (let index = 0; index < deleteAvatar; index++) {
              const element = data.children.filter((a: any) => a.type == "avatar");;
              const idx = data.children.indexOf(element[0]);
              data.children.splice(idx as number, 1);
            }
            let lastAvatarIndex = data.children.filter((a: any) => a.type == "avatar");
            let idx = data.children.indexOf(lastAvatarIndex[0]);
            data.children.splice(idx, 1);
            updatedObj.forEach((i: any) => {
              data.children.splice(idx + 1, 0, i);
              idx = idx + 1;
            });
          }
          else {
            let lastAvatarIndex = data.children.filter((a: any) => a.type == "avatar");
            let idx = data.children.indexOf(lastAvatarIndex[0]);
            data.children.splice(idx, 1);
            updatedObj.forEach((i: any) => {
              data.children.splice(idx + 1, 0, i);
              idx = idx + 1;
            });
          }
        }
        else {
          data.children[i] = updatedObj;
        }
        return data;
      }
      const result = this.replaceObjectByKey(child, key, updatedObj);
      if (result !== null) {
        return data;
      }
    }
    return null;
  }
  copySectionJson(json: any) {
    let data = JSON.stringify(json);
    this.clipboard.copy(data);
    // alert('Copied to clipboard');
  }
  copyPageJson(json: any) {
    let data = JSON.stringify(json);
    this.clipboard.copy(data);
    // alert('Copied to clipboard');
  }

  setData(response: any) {
    if (response.moduleName.includes('footer')) {
      this.dataSharedService.footerData = response.menuData[0].children[1].children[0].children[1].children;
    } else {
      this.dataSharedService.headerData = response.menuData[0].children[1].children[0].children[1].children;
    }
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
  updateObjectById(data: any, id: any, updatedObj: any) {
    if (!data) {
      return null; // If data is not provided, return null
    }

    // Check if the current node matches the ID
    if (data.id === id) {
      // Replace the current node with the updated object
      data = updatedObj;
    }

    if (data.children && data.children.length > 0) {
      // Recursively search and update in children
      data.children = data.children.map((child: any) =>
        this.updateObjectById(child, id, updatedObj)
      );
    }

    return data;
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
  getEnumList(data: any, targetId: any) {
    const findEvent: any = data?.props?.appConfigurableEvent?.find((item: any) => item?.action == 'change' || item?.action == 'onchange');
    if (findEvent) {
      let grid: any;
      grid = this.dataSharedService.findObjectByKey(this.resData[0], findEvent.targetid)
      if (grid?.type == 'gridList') {
        const event = {
          component: data,
          value: targetId,
          formly: true
        }
        this.dataSharedService.gridLoadById.next(event);
        return;
      }
      else {
        const filteredNodes = this.filterInputElements(this.resData[0].children[1].children[0].children[1].children);
        if (filteredNodes.length > 0) {
          if (findEvent?.action == 'change' || findEvent?.action == 'onchange') {
            if (findEvent.id) {
              for (let j = 0; j < filteredNodes.length; j++) {
                const ele = filteredNodes[j];
                if (ele.formly[0].fieldGroup[0].key == findEvent?.targetid) {
                  ele.formly[0].fieldGroup[0].props.options = [];
                }
              }
              let guid: any = '';
              if (findEvent.rule.includes('post_')) {
                const oneModelData = this.convertModel(this.formlyModel?.[this.screenId]);
                const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', findEvent.arid);
                const jsonData1 = {
                  postType: (findEvent.rule.includes('post_')) ? 'post' : 'put',
                  modalData: oneModelData, metaInfo: jsonData.metaInfo
                };
                this.dataSharedService.saveDebugLog('getEnumList', RequestGuid)
                this.socketService.Request(jsonData1);
                guid = RequestGuid;
              } else {
                const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', findEvent.arid, targetId);
                guid = RequestGuid;
                this.dataSharedService.saveDebugLog('getEnumList', RequestGuid)
                this.socketService.Request(jsonData);
              }



              this.socketService.OnResponseMessage().subscribe(res => {
                if (res.parseddata.requestId == guid && res.parseddata.isSuccess) {
                  res = res.parseddata.apidata;
                  if (res) {
                    if (res.data.length > 0) {
                      let checkType = filteredNodes.find((formly: any) => formly.key == findEvent?.targetid);
                      if (checkType && checkType?.type != 'repeatSection') {
                        if (res.data.length > 0) {
                          let newModel = this.formlyModel?.[this.screenId];
                          for (const key in res.data[0]) {
                            newModel[key] = res.data[0][key];
                            if (key.includes('.')) {
                              if (newModel[key.split('.')[0]]) {
                                newModel[key.split('.')[0]][key.split('.')[1]] = res.data[0][key];
                              } else {
                                newModel[key.split('.')[0]] = {};
                              }
                            }
                          }
                          this.formlyModel[this.screenId] = {};
                          this.formlyModel[this.screenId] = { ...newModel };
                          // this.form.patchValue(this.formlyModel?.[this.screenId]);
                        }
                      }

                      else {
                        let data = res.data;
                        let propertyNames = Object.keys(data[0]);
                        let result = data.map((item: any) => {
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
                        for (let j = 0; j < filteredNodes.length; j++) {
                          const ele = filteredNodes[j];
                          if (ele.formly[0].fieldGroup[0].key == findEvent?.targetid) {
                            ele.formly[0].fieldGroup[0].props.options = finalObj;
                          }
                        }
                        const key = findEvent.targetid;
                        this.formlyModel[this.screenId][key] = '';
                        if (key.includes(".")) {
                          this.formlyModel[this.screenId][key.split('.')[0]][key.split('.')[1]] = '';
                        }
                        this.form.patchValue({ key: parseInt(this.formlyModel?.[this.screenId][key]) });
                        this.formValueAssign(this.editData);
                      }
                    }
                    else {
                      for (let j = 0; j < filteredNodes.length; j++) {
                        const ele = filteredNodes[j];
                        if (ele.formly[0].fieldGroup[0].key == findEvent?.targetid) {
                          ele.formly[0].fieldGroup[0].props.options = [];
                        }
                      }
                      const key = findEvent.targetid;
                      this.formlyModel[this.screenId][key] = '';
                      if (key.includes(".")) {
                        this.formlyModel[this.screenId][key.split('.')[0]][key.split('.')[1]] = '';
                      }
                      this.form.patchValue({ key: parseInt(this.formlyModel?.[this.screenId][key]) });
                      this.formValueAssign(this.editData);
                    }
                    this.updateNodes();

                  }
                }

              })
            }
          }
        }
      }
    }

  }
  getEnumApi(data: any, targetId: any, findObj: any) {
    // if (!targetId)
    // this.requestSubscription = this.applicationService.getNestCommonAPI(data.props.apiUrl).subscribe({
    //   next: (res) => {

    //     if (res?.data?.length > 0) {
    //       let propertyNames = Object.keys(res.data[0]);
    //       let result = res.data.map((item: any) => {
    //         let newObj: any = {};
    //         let propertiesToGet: string[];
    //         if ('id' in item && 'name' in item) {
    //           propertiesToGet = ['id', 'name'];
    //         } else {
    //           propertiesToGet = Object.keys(item).slice(0, 2);
    //         }
    //         propertiesToGet.forEach((prop) => {
    //           newObj[prop] = item[prop];
    //         });
    //         return newObj;
    //       });

    //       let finalObj = result.map((item: any) => {
    //         return {
    //           label: item.name || item[propertyNames[1]],
    //           value: item.id || item[propertyNames[0]],
    //         };
    //       });
    //       findObj.formly.fieldGroup[0].props.options = finalObj;
    //     }
    //   },
    //   error: (err) => {
    //   },
    // });

  }
  saveDataGrid(res: any) {
    if (this.formlyModel?.[this.screenId]) {
      let model = Object.keys(this.formlyModel?.[this.screenId]);
      let findElement: any = {};
      const filteredNodes = this.filterInputElements(this.resData[0].children[1].children[0].children[1].children);
      if (filteredNodes.length > 0) {
        for (let index = 0; index < filteredNodes.length; index++) {
          const element = filteredNodes[index];
          if (element.formly[0].fieldGroup[0].key == model[0]) {
            findElement = element;
            break;
          }
        }
      }
      if (findElement) {
        let obj = {
          "EnumList": {
            "enumName": this.formlyModel?.[this.screenId][model[0]],
            "gridData": res
          }
        }
        // this.requestSubscription = this.applicationService.addNestCommonAPI('cp', obj).subscribe(res => {
        //   this.toastr.success("Success Added Record", { nzDuration: 3000 });
        //   this.getEnumList(findElement, this.formlyModel?.[this.screenId][model[0]]);
        // })
      }
    }

  }

  assignIssue(node: any, issue: any) {
    if (issue['componentid']) {
      if (node.id == issue['componentid']) {
        let assign = this.getTaskManagementIssues.find(a => a.componentId == node.id)
        if (node.formly) {
          if (node.formly.length > 0) {
            if (node.formly[0].fieldGroup) {
              if (node.formly[0].fieldGroup[0]) {
                node.formly[0].fieldGroup[0].props['screenName'] = this.screenName;
                node.formly[0].fieldGroup[0].props['id'] = node.id;
                if (assign && assign?.status) {
                  node.formly[0].fieldGroup[0].props['status'] = assign.status;
                }
                if (!node.formly[0].fieldGroup[0].props['issueReport']) {
                  node.formly[0].fieldGroup[0].props['issueReport'] = [];
                }

                node.formly[0].fieldGroup[0].props['issueReport'].push(issue);

                if (!node.formly[0].fieldGroup[0].props['issueUser']) {
                  node.formly[0].fieldGroup[0].props['issueUser'] = [issue['createdby']];
                }
                else {
                  if (!node.formly[0].fieldGroup[0].props['issueUser'].includes(issue['createdby'])) {
                    // Check if the user is not already in the array, then add them
                    node.formly[0].fieldGroup[0].props['issueUser'].push(issue.createdBy);
                  }
                }
              }
            }
          }
        }
        else {
          if (assign && assign?.status) {
            node['status'] = assign.status;
          }
          if (!node['issueReport']) {
            node['issueReport'] = [];
          }

          node['issueReport'].push(issue);

          if (!node['issueUser']) {
            node['issueUser'] = [issue['createdby']];
          }
          else {
            if (!node['issueUser'].includes(issue['createdby'])) {
              // Check if the user is not already in the array, then add them
              node['issueUser'].push(issue.createdBy);
            }
          }
        }
      }

      if (node.children.length > 0) {
        node.children.forEach((child: any) => {
          this.assignIssue(child, issue);
        });
      }
    }
  }

  openComment() {
    this.isVisible = true;
  }
  handleCancel(): void {
    this.isVisible = false;
    this.removeComment(this.resData[0])
    this.dataSharedService.screenCommentList.forEach(element => {
      this.assignIssue(this.resData[0], element);
    });
  }
  removeComment(node: any) {
    node['comment'] = [];
    node['commentUser'] = [];
    if (node.children.length > 0) {
      node.children.forEach((child: any) => {
        this.removeComment(child);
      });
    }
  }
  getTaskManagementIssuesFunc(screenId: string, appid: string) {
    // this.requestSubscription = this.builderService.getUserAssignTask(screenId, appid).subscribe({
    //   next: (res: any) => {
    //     if (res.isSuccess) {
    //       if (res.data.length > 0) {
    //         this.getTaskManagementIssues = res.data;
    //       }
    //     }
    //     else {
    //       this.toastr.error(`userAssignTask:` + res.message, { nzDuration: 3000 });
    //     }
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     this.toastr.error("An error occurred", { nzDuration: 3000 });
    //   }
    // })
  }
  pushObjectsById(targetArray: any[], sourceArray: any[], idToMatch: string): void {
    for (let i = 0; i < targetArray.length; i++) {
      const item = targetArray[i];

      // Check if the current item's id matches the id to match
      if (item.id === idToMatch) {
        // Find the index of the matched item in the target array
        const index = targetArray.indexOf(item);

        // Check if the item was found in the target array
        if (index !== -1) {
          // Splice the source array into the target array at the next index
          targetArray.splice(index + 1, 0, ...sourceArray);
          return; // Stop processing as the operation is complete
        }
      }

      // If the current item has children, recursively search within them
      if (item.children && item.children.length > 0) {
        this.pushObjectsById(item.children, sourceArray, idToMatch);
      }
    }
  }
  removeHighlightRecursive(data: any) {
    data['searchHighlight'] = false;
    data['expanded'] = true;
    for (const child of data.children || []) {
      this.removeHighlightRecursive(child);
    }
  }
  assignValues(source: any) {

  }

  scrollToElement(elementId: string): void {
    const element = this.el.nativeElement.querySelector(elementId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  applyDefaultValue() {
    const filteredNodes = this.filterInputElements(this.resData);
    const user = this.dataSharedService.decryptedValue('user') ? this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null : null;;

    const newMode = filteredNodes.reduce((acc, node) => {
      const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.defaultValue;
      let formlyKey = node?.formly?.[0]?.fieldGroup?.[0]?.key;
      let type = node?.type;
      if (user) {
        if (user?.policy?.policyid != '653bf415eb2bd0376051b702') {
          if (formlyKey.includes('.') ? (formlyKey.split('.')[1] === 'organization' || formlyKey.split('.')[1] === 'orgnaization') : (formlyKey === 'organization' || formlyKey === 'orgnaization')) {
            acc = this.setNewModeValue(acc, formlyKey, user.organizationName);
          } else if (formlyKey.includes('.') ? formlyKey.split('.')[1] === 'fullname' : formlyKey === 'fullname') {
            acc = this.setNewModeValue(acc, formlyKey, user.name);
          }
          else if (formlyKey.includes('.') ? formlyKey.split('.')[1] === 'email' : formlyKey === 'email') {
            acc = this.setNewModeValue(acc, formlyKey, user.username);
          }
          else if (formlyKey.includes('.') ? formlyKey.split('.')[1] === 'phone' : formlyKey === 'phone') {
            acc = this.setNewModeValue(acc, formlyKey, user?.contactnumber);
          }
          else {
            if (type == 'multiselect') {
              if (formlyConfig) {
                acc[formlyKey] = formlyConfig;
              } else {
                acc[formlyKey] = [];
              }
            } else {
              acc[formlyKey] = formlyConfig;
            }
          }
        }
        else {
          if (type == 'multiselect') {
            if (formlyConfig) {
              acc[formlyKey] = formlyConfig;
            } else {
              acc[formlyKey] = [];
            }
          } else {
            acc[formlyKey] = formlyConfig;
          }
        }
      } else {
        acc[formlyKey] = formlyConfig;
      }
      return acc;
    }, {});

    this.formlyModel[this.screenId] = newMode;

    // Dont remove this because this is used to assign false value to checkbox when value is ''
    setTimeout(() => {
      const checkBoxFileds = filteredNodes.filter((a: any) => a.type == 'checkbox' || a.type == 'multiselect');
      if (checkBoxFileds.length > 0) {
        const obj: any = {
          'checkbox': false,
          'multiselect': [],
        }
        checkBoxFileds.forEach(node => {
          const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.defaultValue;
          if ((formlyConfig == null || formlyConfig == '' || formlyConfig == undefined) && (this.formlyModel?.[this.screenId][node.key] == undefined || this.formlyModel?.[this.screenId][node.key] == '')) {
            this.makeModel(node, obj[node.type])
          }
        });
      }
    }, 20);




  }

  setNewModeValue(acc: any, formlyKey: string, value: any) {
    acc[formlyKey] = value;

    if (formlyKey.includes('.')) {
      const [parentKey, childKey] = formlyKey.split('.');
      acc[parentKey] = acc[parentKey] || {};
      acc[parentKey][childKey] = value;
    }

    return acc;
  }


  countOccurrences(arr: any) {
    const result: any = {};

    for (const item of arr) {
      if (result[item.key]) {
        result[item.key]++;
      } else {
        result[item.key] = 1;
      }
    }
    return result;
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
  clearValues() {
    this.resData = [];
    this.formlyModel[this.screenId] = {};
  }
  makeModel(field: any, event: any) {
    let newModel = { ...this.formlyModel?.[this.screenId] };
    if (newModel) {
      this.formlyModel[this.screenId] = {};
      newModel[field.key] = event;
      if (field.key.includes('.')) {
        if (newModel[field.key.split('.')[0]]) {
          newModel[field.key.split('.')[0]][field.key.split('.')[1]] = event;
        } else {
          newModel[field.key.split('.')[0]] = {};
          newModel[field.key.split('.')[0]][field.key.split('.')[1]] = event;
        }
      }
      this.formlyModel[this.screenId] = { ...newModel };
    }


    // if (newModel) {
    //   for (const key in newModel) {
    //     if (newModel.hasOwnProperty(key)) {
    //       if (typeof newModel[key] === 'object') {
    //         for (const key1 in newModel[key]) {
    //           if (field.key.includes('.')) {
    //             if (key1 == field.key.split('.')[1]) {
    //               newModel[key][field.key.split('.')[1]] = event;
    //             }
    //           } else {
    //             if (key1 == field.key) {
    //               newModel[key][field.key] = event;
    //             }
    //           }

    //         }
    //       }
    //       else {
    //         if (key == field.key) {
    //           newModel[field.key] = event;
    //         }
    //       }
    //     }
    //   }
    // }
    // for (let key in newModel) {
    //   if (newModel.hasOwnProperty(key)) {
    //     if (typeof newModel[key] === 'object' && newModel[key] !== null) {
    //       delete newModel[key];
    //     } else if (typeof newModel[key] === 'object' && newModel[key] === null) {
    //       continue;
    //     }
    //   }
    // }
    // this.formlyModel[this.screenId] =  JSON.parse(JSON.stringify(newModel)) ;
    // console.log(this.formlyModel?.[this.screenId]);
  }
  makeModelLoop(field: any, event: any, newModel: any) {
    if (newModel) {
      this.formlyModel[this.screenId] = {};
      newModel[field.key] = event;
      if (field.key.includes('.')) {
        if (newModel[field.key.split('.')[0]]) {
          newModel[field.key.split('.')[0]][field.key.split('.')[1]] = event;
        } else {
          newModel[field.key.split('.')[0]] = {};
          newModel[field.key.split('.')[0]][field.key.split('.')[1]] = event;
        }
      }
    }
  }
  filterDuplicateChildren(data: any) {
    // Maintain a set of unique keys
    const uniqueKeys = new Set();

    // Filter and keep unique children
    data.children = data.children.filter((child: any) => {
      if (!uniqueKeys.has(child.key)) {
        uniqueKeys.add(child.key);
        if (child.children && child.children.length > 0) {
          // Recursively process children of this child
          this.filterDuplicateChildren(child);
        }
        return true; // Keep this child
      }
      return false; // Discard this child
    });

    return data;
  }

  applicationThemeData: any[] = [];
  applyApplicationTheme(res1: any, notAllowRuleGet?: any) {
    let user = this.dataSharedService.decryptedValue('user') ? this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null : null;;
    if (user && user?.policy?.policyTheme) {
      this.saveLoader = true;
      const { jsonData, newGuid } = this.socketService.makeJsonDataById('applicationtheme', `${user.policy?.policyTheme}`, '2002');
      this.dataSharedService.saveDebugLog('applyApplicationTheme', newGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe(((res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.saveLoader = false;
          if (res.isSuccess) {
            this.applicationThemeData = res?.data;
            if (notAllowRuleGet) {
              this.findObjectByTypeAndApplyApplictionTheme(res1, this.applicationThemeData)
            } else {
              this.actionsBindWithPage(res1, this.applicationThemeData);
            }
          } else {
            this.actionsBindWithPage(res1, this.applicationThemeData);
            this.toastr.warning(res.message, { nzDuration: 2000 });
          }
        }
      }));
    } else {
      this.saveLoader = false;
      this.actionsBindWithPage(res1, this.applicationThemeData);
    }
  }

  findObjectByTypeAndApplyApplictionTheme(data: any, ThemeData: any) {
    if (data?.formly) {
      let input: any = ThemeData.find((item: any) => item.tag === 'input');
      if (data.formly[0]) {
        data.formly[0].fieldGroup[0].props['additionalProperties']['applicationThemeClasses'] = input?.classes;
      } else {
        data.formly[0].fieldGroup[0].props['additionalProperties']['applicationThemeClasses'] = input?.classes;
      }
    }
    if (data?.type == 'button') {
      let obj: any = ThemeData.find((item: any) => item.tag === data?.commonButtonProperty);
      if (obj) {
        data['applicationThemeClasses'] = obj?.classes;
      } else {
        let obj: any = ThemeData.find((item: any) => item.tag.includes('Button'));
        data['applicationThemeClasses'] = obj?.classes;
      }
    }
    else {
      let obj: any = ThemeData.find((item: any) => item.tag === data.type);
      if (obj) {
        data['applicationThemeClasses'] = obj?.classes
      } else {
        data['applicationThemeClasses'] = obj?.classes
      }
    }
    for (let child of data.children) {
      this.findObjectByTypeAndApplyApplictionTheme(child, ThemeData);
    }
  }
  getIssues(navigation: any, res1: any) {
    // this.applicationService.callApi('knex-query/getAction/65001460e9856e9578bcb63f', 'get', '', '', navigation).subscribe({
    //   next: (response: any) => {
    //     if (res1) {
    //       if (res1.length > 0) {
    //         this.findObjectByTypeAndApplyApplictionTheme(this.resData[0], res1);
    //       }
    //     }
    //     if (response.data > 0) {
    //       response.data.forEach((element: any) => {
    //         this.assignIssue(this.resData[0], element);
    //       });
    //     }
    //   },
    //   error: (error: any) => {
    //     if (res1) {
    //       if (res1.length > 0) {
    //         this.findObjectByTypeAndApplyApplictionTheme(this.resData[0], res1);
    //       }
    //     }
    //     console.error(error);
    //     this.toastr.error("An error occurred", { nzDuration: 3000 });
    //   }
    // });
  }
  changeWithGlobalClass(className: any) {
    let matches: any[] = className.match(/\$\S+/g);
    let globalClass: any = '';
    if (matches.length > 0 && this.dataSharedService.applicationGlobalClass.length > 0) {
      matches.forEach((classItem: any, index: number) => {
        let splittedName = classItem.split('$')[1];
        let resClass: any = this.dataSharedService.applicationGlobalClass.find((item: any) => item.name.toLocaleLowerCase() == splittedName.toLocaleLowerCase());
        if (resClass) {
          globalClass = globalClass ? globalClass + ' ' + resClass?.class : resClass?.class;
        }
        else if (index == 0) {
          globalClass = '';
        }
      });
    }
    return globalClass;
  }

  // <-----------This is used to bind Ui rules----------->
  uiRuleLogic(model: any, index: any, screenData: any, policy: any, currentValue: any, inputType: any, updatedKeyData: any, checkFirst: any) {
    if (model.key == screenData.uiData[index].ifMenuName) {
      checkFirst = true;
      let query: any;
      let getModelValue = this.formlyModel?.[this.screenId] ? (this.formlyModel?.[this.screenId][screenData?.uiData?.[index]?.ifMenuName] == "" ? false : this.formlyModel?.[this.screenId][screenData?.uiData?.[index]?.ifMenuName]) : false;
      if (screenData.uiData[index].condationName == 'contains') {
        if (this.formlyModel?.[this.screenId][screenData.uiData[index].ifMenuName] != undefined &&
          this.formlyModel?.[this.screenId][screenData.uiData[index].ifMenuName].includes(screenData.uiData[index].targetValue)) {
          query = '1 == 1';
          query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
        }
        else {
          query = '1 == 2';
          query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
        }
      } else if (screenData.uiData[index].condationName == 'null') {
        if (typeof (this.formlyModel?.[this.screenId][screenData.uiData[index].ifMenuName]) != "number") {
          if (this.formlyModel?.[this.screenId][screenData.uiData[index].ifMenuName] == '' || this.formlyModel?.[this.screenId][screenData.uiData[index].ifMenuName] == null) {
            query = '1 == 1';
            query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
          }
          else {
            query = '1 == 2';
            query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
          }
        } else {
          query = '1 == 2';
          query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
        }

      }
      else {
        if (screenData.uiData[index].ifMenuName.includes('number') || screenData.uiData[index].ifMenuName.includes('decimal')) {
          query = Number(getModelValue) + " " + screenData.uiData[index].condationName + " " + screenData.uiData[index].targetValue;

          query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue);
        } else {
          if (policy && policy != 'policy') {
            query = "'" + currentValue + "' " + screenData.uiData[index].condationName + " '" + policy + "'";
          }
          else {
            const checkValue = policy ? this.user?.policy?.policyId : getModelValue
            query = "'" + checkValue + "' " + screenData.uiData[index].condationName + " '" + screenData.uiData[index].targetValue + "'";
            query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue, policy);
          }

          query = this.evalConditionRule(query, screenData.uiData[index].targetIfValue, policy);
        }
      }
      if (this.UiRuleCondition(query)) {
        const check = this.makeUIJSONForSave(screenData.uiData[index], inputType, updatedKeyData, true);
        this.resData[0].children[1].children = check;
        this.updateNodes();
        this.updateFormlyModel();
      }
      else {
        const check = this.makeUIJSONForSave(screenData.uiData[index], inputType, updatedKeyData, false);
        this.resData[0].children[1].children = check;
        this.updateNodes();
        this.updateFormlyModel();
      }
    }
  }

  // <-----------This is used to bind action rules----------->
  bindsActionRules(nodesData1: any) {
    let getInputs = this.filterInputElements(nodesData1);
    if (getInputs && getInputs.length > 0) {
      getInputs.forEach((node) => {
        const formlyConfig = node.formly?.[0]?.fieldGroup?.[0]?.key;
        for (let index = 0; index < this.actionRuleList.length; index++) {
          const element = this.actionRuleList[index];
          if (formlyConfig == element.componentfrom) {
            const eventActionConfig = node?.formly?.[0]?.fieldGroup?.[0]?.props;
            if (eventActionConfig) {
              if (index == 0) {
                eventActionConfig['appConfigurableEvent'] = [];
                eventActionConfig['eventActionconfig'] = {};
              }
              if (element.action == 'load') {
                eventActionConfig['eventActionconfig'] = {};
                eventActionConfig['eventActionconfig'] = element;
              }
              else {
                if (eventActionConfig['appConfigurableEvent']) {
                  eventActionConfig['appConfigurableEvent'].push(element);
                } else {
                  eventActionConfig['appConfigurableEvent'] = [];
                  eventActionConfig['appConfigurableEvent'].push(element);
                }
              }
            }
          }
        }
      });
    }
    let checkFirst: any = {};
    for (let index = 0; index < this.actionRuleList.length; index++) {
      const element = this.actionRuleList[index];
      let findObj = this.findObjectByKey(nodesData1[0], element.componentfrom);
      if (findObj) {
        if (findObj?.key == element.componentfrom) {
          if (!checkFirst[findObj?.key]) {
            findObj['appConfigurableEvent'] = [];
            findObj['eventActionconfig'] = {};
            checkFirst[findObj?.key] = "done";
          }
          if (element.action == 'load') {
            findObj.eventActionconfig = element;
          } else {
            if (findObj['appConfigurableEvent']) {
              findObj['appConfigurableEvent'].push(element);
            } else {
              findObj['appConfigurableEvent'] = [];
              findObj['appConfigurableEvent'].push(element);
            }
          }
        }
      }
    }
    return nodesData1;
  }

  // <-----------Apply global class----------->

  globalclass(data: any) {
    if (!data) return;

    if (data.className && data.className.includes('$')) {
      data['appGlobalClass'] = this.changeWithGlobalClass(data.className);
    }

    if (data?.innerClass && data?.innerClass.includes('$')) {
      data['appGlobalInnerClass'] = this.changeWithGlobalClass(data?.innerClass);
    }

    if (data?.iconClass && data?.iconClass.includes('$')) {
      data['appGlobalInnerIconClass'] = this.changeWithGlobalClass(data?.iconClass);
    }

    if (data.children && data.children.length > 0) {
      for (let child of data.children) {
        this.globalclass(child);
      }
    }
  }
  replacePlaceholders(expression: string, data: any): string {
    return expression.replace(/{{(.*?)}}/g, (match, group) => {
      const keys = group.trim().split('.');
      let value = data;
      for (const key of keys) {
        if (value[key] !== undefined) {
          value = value[key];
        } else {
          return '0';
        }
      }
      return value || '0';
    });
  }
  captureAndGeneratePDF() {
    // Add a time delay of 2 seconds (2000 milliseconds)
    setTimeout(() => {
      html2canvas(document.body).then((canvas) => {
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'p', // 'p' for portrait, 'l' for landscape
          unit: 'mm', // use millimeters for units
          format: 'a4', // standard paper size
        });

        // Convert canvas to image data URL
        const imgData = canvas.toDataURL('image/png');

        // Set scale factor for both width and height to fit the entire content within the PDF page
        const scaleFactorWidth = pdf.internal.pageSize.getWidth() / canvas.width;
        const scaleFactorHeight = pdf.internal.pageSize.getHeight() / canvas.height;
        const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * scaleFactor, canvas.height * scaleFactor);

        // Download or display the PDF
        pdf.save('screenshot.pdf');
      });
    }, 2000); // 2000 milliseconds (2 seconds) delay
  }
  // captureAndGeneratePDF() {
  //   // Add a time delay of 2 seconds (2000 milliseconds)
  //   setTimeout(() => {
  //     html2canvas(document.body).then((canvas) => {
  //       // Convert canvas to image data URL
  //       const imgData = canvas.toDataURL('image/png');
  //       this.applicationService.getNestCommonAPI('email/emailPdf').subscribe(((res: any) => {
  //         this.saveLoader = false;

  //       }));
  //     });
  //   }, 2000); // 2000 milliseconds (2 seconds) delay
  // }
}


