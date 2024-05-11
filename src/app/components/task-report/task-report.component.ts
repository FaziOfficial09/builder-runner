import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Subscription } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-task-report',
  templateUrl: './task-report.component.html',
  styleUrls: ['./task-report.component.scss']
})
export class TaskReportComponent implements OnInit {
  @Input() item: any;
  @Input() screenName: any;
  @Input() type: any;
  @Input() assignToresponse: any;
  @Input() userTaskManagementData: any;
  @Output() notify: EventEmitter<any> = new EventEmitter();
  newcomment: any = '';
  newCommentRes: any = '';
  showAllComments = false;
  commentEdit = false;
  showRply = '';
  commentEditObj: any = {};
  commentForm: FormGroup;
  requestSubscription: Subscription;
  constructor(private cd: ChangeDetectorRef, private toastr: NzMessageService, public dataSharedService: DataSharedService,private formBuilder: FormBuilder) { }
  ngOnInit(): void {
    this.commentForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }
  saveComment(data: any, issue: any, issueIndex?: any) {
    
    if (!this.commentForm.valid) {
      this.toastr.warning('Please fill this', { nzDuration: 3000 });
      return;
    }

    const userData = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;


    const commentObj = {
      screenid: this.screenName,
      datetime: new Date(),
      message: this.commentForm.value.message,
      status: '',
      organizationid: this.dataSharedService.decryptedValue('organizationId'),
      applicationid: this.dataSharedService.decryptedValue('applicationId'),
      componentid: data.id,
      createdby: userData.username,
      parentid: issue.id,
      type: this.type == 'userTaskManagement' ? 'pages' : this.type
    };

    const userCommentModel = {
      UserComment: commentObj
    };

    let requestObservable: Observable<any>;

    // if (!this.commentEdit) {
    //   requestObservable = this.applicationService.addNestCommonAPI('knex-crud/task', commentObj);
    // } else {
    //   // userCommentModel.UserComment.componentId = this.commentEditObj.componentId;
    //   requestObservable = this.applicationService.updateNestCommonAPI(
    //     'cp/UserComment',
    //     this.commentEditObj._id,
    //     userCommentModel
    //   );
    // }

    // this.requestSubscription = requestObservable.subscribe({
    //   next: (res: any) => {
    //     if (res.id) {
    //       this.commentForm.patchValue({
    //         message: '',
    //       });
    //       this.toastr.success(`UserComment: 'User task save succesfully'`, { nzDuration: 3000 });

    //       if (this.commentEdit) {
    //         let Newdata: any = data.comment.map((comm: any) => {
    //           if (comm._id === res.data._id) {
    //             return res.data;
    //           }
    //           return comm;
    //         });
    //         data.comment = (JSON.parse(JSON.stringify(Newdata)))
    //       }
    //       else {
    //         if (data['issueReport'][issueIndex]['children']) {
    //           res.data['id'] = res.data._id;
    //           data.issueReport[issueIndex].children.push(res.data);
    //         } else {
    //           data['issueReport'][issueIndex]['children'] = [];
    //           res.data['id'] = res.data._id;
    //           data['issueReport'][issueIndex]['children'].push(res.data);
    //         }


    //       }
    //       this.commentEdit = false;
    //     } else {
    //       this.toastr.error(`UserComment: ${res.message}`, { nzDuration: 3000 });
    //     }
    //   },
    //   error: () => {
    //     this.toastr.error('UserComment: An error occurred', { nzDuration: 3000 });
    //   }
    // });
  }



  toggleCommentDisplay(data: any) {
    
    data['showAllComments'] = true;

    // this.requestSubscription =  this.applicationService.callApi('knex-query/getAction/650064bbc5215fa775985f97', 'get', '', '', "'" + data.id + "'").subscribe({
    //   next: (res: any) => {
    //     if (res) {
    //       if (res.data.length > 0) {
    //         this.assignToresponse = res.data[0];
    //         data['dueDate'] = res.data[0]['dueDate'];
    //         data['assignTo'] = res.data[0]['assignTo'];
    //         data['startDate'] = res.data[0]['startDate'];
    //         data['endDate'] = res.data[0]['endDate'];
    //         data['tags'] = res.data[0]['tags'];
    //         data['status'] = res.data[0]['status'];
    //         // this.toastr.success(`UserAssignTask : ${res.message}`, { nzDuration: 3000 });
    //       } else {
    //         data['dueDate'] = new Date();
    //         data['dueDate'] = data['dueDate'].toISOString().split('T')[0];
    //       }
    //     }
    //   }, error: (err: any) => {
    //     console.error(err); // Log the error to the console
    //     this.toastr.error(`UserAssignTask : An error occurred`, { nzDuration: 3000 });
    //   }
    // })
  }
  handleCancel(data: any) {
    data['showAllComments'] = false;
  }
  read(node: any, read: boolean) {
    if (read || read == undefined) {
      node['commentBackgroundColor'] = '#3b82f6';
      this.cd.detectChanges;
    } else {
      node['commentBackgroundColor'] = '';
    }
  }
  edit(data: any) {
    this.commentEdit = true;
    this.commentEditObj = data;
    this.commentForm.patchValue({
      message: data.message,
    });
  }
  // statusChange(status: any, data: any) {
  //   if (data['issueReport'].length > 0 && status) {
  //     data['issueReport'] = data['issueReport'].map((comm: any) => {
  //       comm['status'] = status;
  //       return comm;
  //     });
  //   }
  // }
  reply(issue: any) {
    this.showRply = issue.id;

  }
  userAssigneeSave(data: any) {
    
    const userData = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    let obj = {
      screenId: this.screenName,
      // dueDate: data?.dueDate,
      status: data.status ? data.status : 'open',
      organizationId: this.dataSharedService.decryptedValue('organizationId'),
      applicationId: this.dataSharedService.decryptedValue('applicationId'),
      componentId: data?.id,
      createdBy: userData.username,
      assignTo: data?.assignTo,
      tags: data?.tags,
      startDate: data?.startDate,
      endDate: data?.endDate
    }
    let UserAssignTaskModel = {
      "UserAssignTask": obj
    }
    let requestObservable: Observable<any>;
    // if (!this.assignToresponse) {
    //   requestObservable = this.applicationService.addNestCommonAPI('cp', UserAssignTaskModel);
    // } else {
    //   requestObservable = this.applicationService.updateNestCommonAPI('cp/UserAssignTask', this.assignToresponse._id, UserAssignTaskModel);
    // }
    // requestObservable.subscribe({
    //   next: (res: any) => {
    //     if (res) {
    //       this.assignToresponse = res.data;
    //       this.toastr.success(`UserAssignTask : ${res.message}`, { nzDuration: 3000 });
    //       if (this.userTaskManagementData) {
    //         this.notify.emit(res);
    //       }

    //     }
    //   }, error: (err: any) => {
    //     console.error(err); // Log the error to the console
    //     this.toastr.error(`UserAssignTask : An error occurred`, { nzDuration: 3000 });
    //   }
    // })
  }
}
