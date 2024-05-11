import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DataSharedService } from './data-shared.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  errorMessage = 'Sorry some exception has been occur.';
  successMessage  = 'Your information has been save successfully!'
  updateMessage  = 'Your information has been update successfully!'
  retriveMessage  = 'Your information has been retrive successfully!'
  constructor(
    private notification: NzNotificationService,
    public dataSharedService: DataSharedService,
    private toastr: NzMessageService,
  ) { }

  showNotification(data: any): void {
    this.notification.create(
      data?.toastrType, // Notification type
      data?.toasterTitle, // Title
      data?.message, // Description
      {
        nzDuration: data?.duration,
        nzPlacement: data?.positionClass,
        nzCloseIcon: data?.closeIcon,
        nzPauseOnHover: data?.pauseOnHover,
        nzAnimate: data?.animate,
      } // Additional options
    );
  }

  checkToaster(component: any, type: string) {
    const toastr = this.dataSharedService.findObjectByTypeBase(component, 'toastr');
    if (toastr) {
      this.showNotification(toastr)
    }
    else if(type== 'error')
    this.toastr.error(this.errorMessage, { nzDuration: 3000 });
    else if(type== 'success')
    this.toastr.success(this.successMessage, { nzDuration: 3000 });
    else if(type== 'retrive')
    this.toastr.success(this.retriveMessage, { nzDuration: 3000 });
    else if(type== 'update')
    this.toastr.success(this.updateMessage, { nzDuration: 3000 });
  }

}
