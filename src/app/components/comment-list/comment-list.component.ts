import { Component, Input, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { CommentModalComponent } from '../comment-modal/comment-modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {
  onCardHover: boolean = false;
  form: FormGroup;
  @Input() data: any = {};
  @Input() screenName: any;
  requestSubscription: Subscription;
  constructor(public dataSharedService: DataSharedService, private router: Router,
    private modalService: NzModalService, private viewContainerRef: ViewContainerRef, private toastr: NzMessageService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.create();
  }
  // gotoPages(item: any) {
  //   const queryParams = { screenName: item.screenId, commentId: item.id };
  //   this.router.navigate(['/pages/', item.screenId, item.id])
  // }
  edit(data: any) {
    const modal = this.modalService.create<CommentModalComponent>({
      nzTitle: 'Comment',
      nzContent: CommentModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        data: data,
        screenName: data.screenId,
        update: data,
      },
      nzFooter: []
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
      }
    });
  }
  onSubmit() {
    
    // ScreenName cannot be Null.
    if (!this.screenName) {
      this.toastr.warning("Please select any screen", { nzDuration: 3000 });
      return;
    }

    if (this.form.valid) {
      const currentDate = new Date();
      const userData = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
      const commentTime = currentDate.toLocaleTimeString([], { hour12: true, hour: 'numeric', minute: '2-digit' });
      let commentObj = {
        orgid: this.dataSharedService.decryptedValue('appid'),
        appid: this.dataSharedService.decryptedValue('orgid'),
        screenId: this.screenName,
        ObjectID: this.data.id,
        whoCreated: userData.username,
        comment: this.form.value.comment,
        dateTime: new Date(),
        status: this.form.value.status,
        avatar: 'avatar.png'
      }
      const userCommentModel = {
        "UserComment": commentObj
      }
      // this.requestSubscription = this.applicationService.addNestCommonAPI('cp', userCommentModel).subscribe({
      //   next: (res: any) => {
      //     if (res.isSuccess) {
      //       this.create();
      //       this.toastr.success(`UserComment : ${res.message}`, { nzDuration: 3000 });
      //       this.getCommentsData();
      //     } else this.toastr.error(`UserComment : ${res.message}`, { nzDuration: 3000 });
      //   },
      //   error: (err) => {
      //     this.toastr.error("UserComment : An error occurred", { nzDuration: 3000 });
      //   }
      // });
    }
  }
  getCommentsData(): void {
    // this.requestSubscription = this.applicationService.getNestCommonAPI('cp/UserComment').subscribe({
    //   next: (res: any) => {
    //     if (res.isSuccess) {
    //       this.toastr.success(`User Comment : ${res.message}`, { nzDuration: 3000 });
    //       this.dataSharedService.screenCommentList = res.data;
    //       // error
    //     } else {
    //       this.toastr.error(`UserComment : ${res.message}`, { nzDuration: 3000 });
    //     }
    //   },
    //   error: (err) => {
    //     console.error(err); // Log the error to the console
    //     this.toastr.error(`UserComment : An error occurred`, { nzDuration: 3000 });
    //   }
    // });
  }

  create() {
    this.form = this.formBuilder.group({
      comment: ['', Validators.required],
      status: ['', Validators.required],
    });
  }
  typeFirstAlphabetAsIcon(user: any) {
    if (user) {
      let firstAlphabet = user?.charAt(0)?.toUpperCase();
      return firstAlphabet;
    }else{
      return 'U'
    }
  }
}
