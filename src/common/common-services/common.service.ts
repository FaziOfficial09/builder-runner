import { Injectable } from '@angular/core';
import { NzMessageDataOptions, NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  selectedWorkorder = 0;
  loadRequestTab = false;
  constructor(public toastr: NzMessageService) {}
  // Success
  showSuccess(title: string, options?: NzMessageDataOptions) {
    this.toastr.success(title, options);
  }
  // Error
  showError(title: string, options?: NzMessageDataOptions) {
    ;
    this.toastr.error(title, options);
  }
  // Warning
  showWarning(title: string, options?: NzMessageDataOptions) {
    this.toastr.warning(title, options);   // closeButton: true, //  enableHtml: true,
  }

  getUser() {
    return JSON.parse(localStorage.getItem('userDetail')!);
  }

  //JSON-Beautify
  // Add 4 indentations to JSON:
  jsonBeautify(json: any) {
    alert(JSON.stringify(json, null, 4));
  }
}
