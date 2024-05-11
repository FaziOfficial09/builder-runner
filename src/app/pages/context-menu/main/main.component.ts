import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Type, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { NzImageService } from 'ng-zorro-antd/image';
import { TreeNode } from '../../../models/treeNode';
import { Observable, Subscription, catchError, throwError } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { DataSharedService } from '../../../services/data-shared.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommentModalComponent } from '../../../components';

@Component({
  selector: 'st-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @Input() isDrawer: boolean = false;
  @Input() mainData: any = [];
  @Input() formlyModel: any;
  @Input() form: any;
  // form: any = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  selectedTags: any[] = [];
  @Input() screenName: any;
  @Input() screenId: any;
  editorData: any;
  ruleValidation: any = {};
  ruleObj: any = {};
  validationCheckStatus: any = [];
  setErrorToInput: any = [];
  joiValidationData: TreeNode[] = [];
  requestSubscription: Subscription;
  isShowContextMenu = false;
  schemaValidation: any;
  newcomment: any = '';
  newCommentRes: any = '';
  showAllComments = false;
  commentEdit = false;
  showRply = '';
  commentEditObj: any = {};
  assignToresponse: any = '';
  commentForm: FormGroup;
  selectedHighLight: any = '';
  url: any = '';
  array = [1, 2, 3, 4];
  effect = 'scrollx';
  applicationId: any;
  @Input() mappingId: any;

  constructor(private cd: ChangeDetectorRef, private nzImageService: NzImageService, 
    
    private toastr: NzMessageService, private router: Router, public dataSharedService: DataSharedService,
    private clipboard: Clipboard, private modalService: NzModalService, private viewContainerRef: ViewContainerRef,
     private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.url = window.location.href;
    this.commentForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
    this.applicationId = this.dataSharedService.decryptedValue('applicationId');
    // if (window.location.href.includes('/pages'))
    //   this.isShowContextMenu = true;
  }


  handleIndexChange(e: number): void {
    console.log(e);
  }
  onClose(data: any, index: any): void {

    data.options = data.options.filter((_: any, i: any) => i != index);
    console.log('tag was closed.');
  }
  imagePreview(data: any) {
    let image = '';
    if (data.source) {
      image = data.source
    } else if (data.base64Image) {
      image = data.base64Image
    }
    const images = [
      {
        src: image,
        width: data.imageWidth + 'px',
        height: data.imagHieght + 'px',
        alt: data.alt,
      }
    ];
    this.nzImageService.preview(images, { nzZoom: data.zoom, nzRotate: data.rotate, nzKeyboard: data.keyboardKey, nzZIndex: data.zIndex });
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
  }
  setInternalValuesEmpty = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.setInternalValuesEmpty(obj[key]);
      } else {
        obj[key] = '';
      }
    }
  };

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
  copyJson(json: any) {
    let data = JSON.stringify(json);
    this.clipboard.copy(data);
    this.toastr.success('Copied to clipboard', { nzDuration: 3000 });
  }
  issueReportFun(json: any) {
    const modal = this.modalService.create<CommentModalComponent>({
      nzTitle: 'Issue Report',
      nzContent: CommentModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        data: json,
        screenName: this.screenName,
        update: null,
        type: 'pages',
      },
      nzFooter: []
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
        res['id'] = res._id;
        delete res._id;
        delete res.__v;

        if (json.formly) {
          if (json.formly.length > 0) {
            if (json.formly[0].fieldGroup) {
              if (json.formly[0].fieldGroup[0]) {
                json.formly[0].fieldGroup[0].props['screenName'] = this.screenName;
                json.formly[0].fieldGroup[0].props['id'] = json.id;
                if (json.formly[0].fieldGroup[0].props['issueReport']) {
                  json.formly[0].fieldGroup[0].props['issueReport'].push(res);
                } else {
                  json.formly[0].fieldGroup[0].props['issueReport'] = [];
                  json.formly[0].fieldGroup[0].props['issueReport'].push(res);
                }
              }
            }
          }
          this.cd.detectChanges();
          json.formly = JSON.parse(JSON.stringify(json.formly));
        }
        else {
          if (json['issueReport']) {
            json['issueReport'].push(res);
          } else {
            json['issueReport'] = [];
            json['issueReport'].push(res);
          }
          this.cd.detectChanges();
        }
      }
    });
  }
  updatedData(event: any) {

    return;
    let accordingList = event;
    let data = accordingList.data;
    let accordionData = accordingList.screenData;
    let findObject = this.findObjectByTypeBase(this.mainData, accordionData.type);
    let tableData = this.findObjectByTypeBase(accordionData, "gridList");
    if (findObject) {
      let pushIndex = 0;
      data.forEach((element: any, index: number) => {
        const according = accordionData;
        let newNode = JSON.parse(JSON.stringify(findObject));
        // Format weekStartDate
        const startDate = new Date(element.weekStartDate);
        const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Format weekEndDate
        const endDate = new Date(element.weekEndDate);
        const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const newTitle = `${element?.week} ${formattedStartDate} -  ${formattedEndDate}`;
        // let newTable = this.deepCopy(tableData);
        if (tableData) {
          const getGridUpdateData = this.getFromQuery(element.issues, tableData);
          const newGrid = JSON.parse(JSON.stringify(getGridUpdateData));
          if (index != 0) {
            newNode = JSON.parse(JSON.stringify(findObject));
            newNode.children = [newGrid];
          } else {
            findObject.children = [newGrid];
          }
        }
        if (index != 0) {
          newNode.title = newTitle;
          newNode.appConfigurableEvent = [];
          newNode.eventActionconfig = {};
          const idx = this.mainData.children.indexOf(accordionData as TreeNode);
          pushIndex = pushIndex + 1;
          this.mainData.children.splice((idx as number) + pushIndex, 0, newNode);
        } else {
          findObject.title = newTitle;
          findObject.appConfigurableEvent = [];
          findObject.eventActionconfig = {};
        }
        // return according;
      });
      // findObject.title =  data[0].week;
      // findObject.children = data[1].issues;
    }

    // data.map((element: any) => {
    //   const according = JSON.parse(JSON.stringify(accordionData));

    //   // Format weekStartDate
    //   const startDate = new Date(element.weekStartDate);
    //   const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    //   // Format weekEndDate
    //   const endDate = new Date(element.weekEndDate);
    //   const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    //   const newTitle = `${element?.week} ${formattedStartDate} -  ${formattedEndDate}`;
    //   let tableData = this.findObjectByTypeBase(according, "gridList");
    //   if (tableData) {
    //     const getGridUpdateData = this.getFromQuery(element.issues, tableData);
    //     according.children = [getGridUpdateData];
    //   }
    //   according.title = newTitle;
    //   return according;
    // });
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
  getFromQuery(res: any, tableData: any) {
    if (tableData && res) {
      if (res.length > 0) {
        const requiredData = res.map(({ __v, _id, ...rest }: any) => ({
          expand: false,
          id: _id,
          // expandable:true,
          ...rest,

        }));
        res = requiredData;
        let saveForm = JSON.parse(JSON.stringify(res[0]));
        const firstObjectKeys = Object.keys(saveForm);
        let tableKey = firstObjectKeys.map(key => ({ name: key }));
        let obj = firstObjectKeys.map(key => ({ name: key, key: key }));
        tableData.tableData = [];
        saveForm.id = tableData.tableData.length + 1;
        res.forEach((element: any) => {
          element.id = (element?.id)?.toString();
          tableData.tableData?.push(element);
        });
        // pagniation work start
        if (!tableData.end) {
          tableData.end = 10;
        }
        tableData.pageIndex = 1;
        tableData.totalCount = res.count ? res.count : res.length;
        tableData.serverApi = '';
        tableData.targetId = '';
        tableData.displayData = tableData.tableData.length > tableData.end ? tableData.tableData.slice(0, tableData.end) : tableData.tableData;
        // pagniation work end
        tableData.tableHeaders = obj;
        tableData['tableKey'] = tableKey


        // if (tableData.tableHeaders.length == 0) {
        //   tableData.tableHeaders = obj;
        //   tableData['tableKey'] = tableKey
        // }
        // else {
        //   if (JSON.stringify(tableData['tableKey']) != JSON.stringify(tableKey)) {
        //     const updatedData = tableData.tableHeaders.filter((updatedItem: any) => {
        //       const name = updatedItem.name;
        //       return !tableKey.some((headerItem: any) => headerItem.name === name);
        //     });
        //     if (updatedData.length > 0) {
        //       tableData.tableHeaders.map((item: any) => {
        //         const newItem = { ...item };
        //         for (let i = 0; i < updatedData.length; i++) {
        //           newItem[updatedData[i].key] = "";
        //         }
        //         return newItem;
        //       });
        //     }
        //   }
        // }
      }
      return tableData;
    }
  }

  applyHighlightInsideLayer(data: any, id: any, event: any) {
    if (id && !this.router.url.includes('/pages')) {
      this.dataSharedService.highlightFalse.next(true);
      this.applyHighlight(data, id, event);
    }
  }

  applyHighlight(data: any, id: any, event?: any) {
    if (event) {
      event.stopPropagation();
    }
    const isMatch = data.id === id;
    data['searchHighlight'] = isMatch;

    for (const child of data.children || []) {
      this.applyHighlight(child, id, event);
    }
  }
  OpenConfig(item: any) {
    if (item.id && !this.router.url.includes('/pages')) {
      this.dataSharedService.highlightFalse.next(true);
      this.applyHighlight(item, item.id);
    }
    let obj: any = {};
    obj['origin'] = item;
    this.dataSharedService.configuration.next(item);
  }
  
}
