import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent {
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenId: any;
  @Input() screenName: any;
  @Input() mappingId: any;
  @Input() data: any;
  hideChat: boolean = true;
  comment: any;
  saveLoader: boolean = false;
  chatData: any[] = [];
  userName: any;
  showIcon: boolean = false;
  requestSubscription: Subscription;
  editDeleteId: any;
  editId: any;
  constructor(public dataSharedService: DataSharedService, private toastr: NzMessageService, private modal: NzModalService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,) {
    this.processData = this.processData.bind(this);
  }


  ngOnInit(): void {
    if (this.mappingId && this.data.eventActionconfig) {
      this.data.eventActionconfig['parentId'] = this.mappingId;
    }
    this.userName = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')).username : null;
  }

  processData(res: any) {
    if (res) {
      this.data.chatData = res.data;
    }
    return res;
  }
  saveChat() {
    debugger
    if (this.comment == '' || this.comment == undefined || this.comment == null) {
      return;
    }
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId === this.dataSharedService.currentMenuLink);
    if (!checkPermission?.creates && this.dataSharedService?.currentMenuLink !== '/ourbuilder') {
      this.toastr.warning("You do not have permission", { nzDuration: 3000 });
      return;
    }
    const postEvent = this.data.appConfigurableEvent.find((item: any) => item.rule.includes('post_'));
    const putEvent = this.data.appConfigurableEvent.find((item: any) => item.rule.includes('put_'));
    if (!postEvent && !putEvent) {
      this.toastr.error("No action exist", { nzDuration: 3000 });
      return;
    }
    const modalData: any = {
      "ticketcomments.comment": this.comment,
      "ticketcomments.createdby": "",
      "ticketcomments.spectrumissueid": this.formlyModel ? (this.formlyModel['ticketcomments.spectrumissueid'] ? this.formlyModel['ticketcomments.spectrumissueid'] : '') : '',
      "ticketcomments.currentdate": "",
      "ticketcomments.commenttable": "",
      "ticketcomments.screenid": ""
    }
    let actionID = this.editId ? putEvent?.arid : postEvent.arid;
    if (this.editId) {
      modalData['ticketcomments.id'] = this.editId;
    }
    this.saveLoader = true;
    if (actionID) {
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('3007', actionID);
      const jsonData1 = {
        postType: 'post',
        modalData: modalData, metaInfo: jsonData.metaInfo
      };
      this.dataSharedService.saveDebugLog('SaveChat',RequestGuid)
      this.socketService.Request(jsonData1);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.saveLoader = false;
            if (res[0]?.error) {
              this.toastr.error(res[0]?.error, { nzDuration: 3000 });
              return;
            }
            this.resetValues();
            const successMessage = (jsonData1.postType === 'post') ? 'Save Successfully' : 'Update Successfully';
            this.toastr.success(successMessage, { nzDuration: 3000 });
            if (this.data.mapApi) {
              this.getChatsWithMapping();
              return;
            }
            if (jsonData1.postType === 'put' && !res?.isSuccess) {
              this.toastr.error(res.message, { nzDuration: 3000 });
              return;
            }
            this.getChats();
          }
        },
        error: (err) => {
          // Handle the error
          this.toastr.error("An error occurred", { nzDuration: 3000 });
          console.error(err);
          this.saveLoader = false; // Ensure to set the loader to false in case of error
        },
      });
    }
  }
  close() {
    this.hideChat = false;
  }
  editIdAssign(id: any) {
    this.editDeleteId = id;
  }
  delete(data: any) {
    const checkPermission = this.dataSharedService.getUserPolicyMenuList.find(a => a.screenId == this.dataSharedService.currentMenuLink);
    if (!checkPermission?.deletes && this.dataSharedService.currentMenuLink != '/ourbuilder') {
      alert("You did not have permission");
      return;
    }
    const model = {
      screenId: this.screenName,
      postType: 'delete',
      modalData: data
    };
    if (this.screenName != undefined) {
      const findClickApi = this.data.appConfigurableEvent.find((item: any) => item.rule.includes('delete'));
      if (!findClickApi) {
        this.toastr.warning("Action not found", { nzDuration: 3000 });
      }
      this.saveLoader = true;
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('5007', findClickApi.id);
      const jsonData1 = {
        postType: 'post',
        modalData: model, metaInfo: jsonData.metaInfo
      };
      this.dataSharedService.saveDebugLog('DeleteChat',RequestGuid)
      this.socketService.Request(jsonData1);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.saveLoader = false;
            this.resetValues();
            if (res.isSuccess) {
              this.toastr.success("Delete Successfully", { nzDuration: 3000 });
              this.data.chatData = this.data.chatData.filter((a: any) => a.id != data.id)
            } else {
              this.toastr.warning(res.message || "Data is not deleted", { nzDuration: 3000 });
            }
          }

        },
        error: (err) => {
          this.saveLoader = false;
          this.toastr.error(`An error occurred ${err}`, { nzDuration: 3000 });
        }
      });
    }
  }
  showDeleteConfirm(rowData: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this message?',
      nzOkText: 'Yes',
      nzClassName: 'deleteRow',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.delete(rowData),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  edit(data: any) {
    this.editId = data.id;
    this.comment = data.comment;
    this.cdr.detectChanges();
  }
  resetValues() {
    this.comment = '';
    this.editId = '';
    this.editDeleteId = '';
  }
  getChats() {
    if (this.data.eventActionconfig) {
      if (this.data.eventActionconfig.action) {
        this.saveLoader = true;
        const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', this.data.eventActionconfig.id);
        this.dataSharedService.saveDebugLog('getChats',RequestGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res) => {
            if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              this.saveLoader = false; // Ensure to set the loader to false in case of error
              if (res.isSuccess) {
                this.data['chatData'] = res.data;
              }
            }

          },
          error: (err) => {
            // Handle the error
            this.toastr.error("An error occurred", { nzDuration: 3000 });
            console.error(err);
            this.saveLoader = false; // Ensure to set the loader to false in case of error
          },
        });
      }
    }
  }

  showicon() {
    this.showIcon = true;
  }
  getChatsWithMapping() {
    if (this.data.mapApi && this.formlyModel['ticketcomments.spectrumissueid']) {
      this.data['chatData'] = [];
      this.saveLoader = true;
      const { splitApi, parentId } = this.dataSharedService.makeParentId(`${this.data.mapApi}/${this.formlyModel['ticketcomments.spectrumissueid']}`)
      const { jsonData, RequestGuid } = this.socketService.metaInfoForGrid('2010', splitApi, parentId);
      this.dataSharedService.saveDebugLog('getChatsWithMapping',RequestGuid)
      this.socketService.Request(jsonData);
      this.socketService.OnResponseMessage().subscribe({
        next: (res) => {
          if (res.parseddata.requestId == RequestGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.saveLoader = false;
            if (res && res.data && res.data.length > 0) {
              this.data['chatData'] = res.data;
            }
          }
        },
        error: (err) => {
          console.error(err);
          this.saveLoader = false;
          this.toastr.error("An error occurred in mapping", { nzDuration: 3000 });
        }
      });
    }
  }
}
