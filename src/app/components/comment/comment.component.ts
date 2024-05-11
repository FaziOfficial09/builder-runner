import { Component, Input, OnInit } from '@angular/core';

import { formatDistance } from 'date-fns';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() commentData: any;
  @Input() formlyModel: any;
  data: any[] = [];
  submitting = false;
  loader = false;
  inputValue = '';
  @Input() form: any;
  handleSubmit(): void {
    const postEvent = this.commentData.appConfigurableEvent.find((item: any) => item.rule.includes('post_'));
    const putEvent = this.commentData.appConfigurableEvent.find((item: any) => item.rule.includes('put_'));
    if (!postEvent && !putEvent) {
      this.submitting = true;
      const content = this.inputValue;
      this.inputValue = '';
      this.data = [
        ...this.data,
        {
          content,
          datetime: new Date(),
          displayTime: formatDistance(new Date(), new Date())
        }
      ].map(e => ({
        ...e,
        displayTime: formatDistance(new Date(), e.datetime)
      }));
      this.submitting = false;
    } else {
      this.saveData(postEvent, putEvent)
    }

  }
  constructor(public dataSharedService: DataSharedService,
    private toasterService: ToasterService,
    private socketService: SocketService) {
    this.processData = this.processData.bind(this);
  }



  ngOnInit(): void {

    this.commentData;
  }
  processData(data: any) {
    if (data?.data.length > 0) {
      this.data = data?.data;
    }
    return data;
  }
  // query
  //   SELECT label AS author,
  //        value AS content,
  //        '4-25-2024' AS displayTime,
  //        totalprojects AS avatar
  // FROM dev_test.sample
  // LIMIT 100;
  handleAction(event: any, empData: any) {
    if (event) {
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', event.id);
      const jsonData1 = {
        postType: (event.rule.includes('post_')) ? 'post' : 'put',
        modalData: empData.modalData, metaInfo: jsonData.metaInfo
      };
      this.loader = true;
      this.dataSharedService.saveDebugLog('HandleAction', RequestGuid)
      this.socketService.Request(jsonData1);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res) {
              this.loader = false;
              if (res.isSuccess) {
                this.toasterService.checkToaster(this.commentData, 'success');
                this.inputValue = '';
                this.loader = true;
                this.dataSharedService.recallOnLoad(this.commentData)
                  .then((response: any) => {
                    this.loader = false;
                    if (response.isSuccess) {
                      this.toasterService.checkToaster(this.commentData, 'retrive');
                      this.data = response.data;
                      console.log(response.data[0])
                    } else {
                      if (response?.error == 'Action not found') return;
                      this.toasterService.checkToaster(this.commentData, 'error');
                      this.data = [];
                    }
                  })
                  .catch((error: any) => {
                    console.error("Error occurred:", error);
                    this.toasterService.checkToaster(this.commentData, 'error');
                    this.data = []; // Handle error by setting data to an empty array
                    this.loader = false;
                  });

              }
            }
          }
        },
        error: (err) => {
          // Handle the error
          this.toasterService.checkToaster(this.commentData, 'error');
          console.error(err);
          this.loader = false;
        },
      });
    }
  }
  saveData(postEvent: any, putEvent: any) {
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    if (!checkPermission?.creates && this.dataSharedService.currentMenuLink !== '/ourbuilder') {
      alert("You do not have permission");
      return;
    }
    const oneModelData = this.convertModel(this.formlyModel);
    console.log(oneModelData)
    if (Object.keys(oneModelData).length === 0) return;

    oneModelData[this.commentData.key] = this.inputValue;
    const empData = {
      modalData: oneModelData
    };
    for (const key in empData.modalData) {
      if (empData.modalData[key] === undefined || empData.modalData[key] === null) {
        empData.modalData[key] = '';
      }
    }

    if (postEvent) {
      this.handleAction(postEvent, empData);
    }
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

}
