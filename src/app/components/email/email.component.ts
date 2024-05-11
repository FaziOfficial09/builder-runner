import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent {
  form: FormGroup;
  isVisible: boolean = false;
  saveLoader: boolean = false;
  selectedFiles: any = [];
  to: any = [];
  cc: any = [];
  bcc: any = [];
  @ViewChild('fileInputRef') fileInputRef: ElementRef | undefined;
  constructor(private fb: FormBuilder, private toastr: NzMessageService, private socketService: SocketService
  ) {
    this.form = this.fb.group({
      to: ['', Validators.required], // Classes is required
      cc: ['', Validators.required], // Classes is required
      bcc: ['', Validators.required], // Classes is required
      subject: ['', Validators.required], // Classes is required
      text: ['', Validators.required], // Classes is required
      attachments: [null],
    });
  }

  ngOnInit() {

  }
  fileList: NzUploadFile[] = [];
  listOfOption = [
    {
      label: 'hasnainatique786@gmail.com',
      value: 'hasnainatique786@gmail.com'
    },
    {
      label: 'alizaidi85240@gmail.com',
      value: 'alizaidi85240@gmail.com'
    },
    {
      label: 'adilwaheed131192@gmail.com',
      value: 'adilwaheed131192@gmail.com'
    }
  ]
  async sendEmail() {
    debugger
    const jsondata:any={
      files:[],
      emaildata: {
        to: this.to,
        cc: this.cc,
        bcc: this.bcc,
        subject:this.form.value.subject,
        text:this.form.value.text,
        html:this.form.value.html
      }
    }
    this.form.patchValue({
      'to': this.to,
      'cc': this.cc,
      'bcc': this.bcc,
    })
    const formData = new FormData();

    // Append form data
    Object.keys(this.form.value).forEach((key) => {
      formData.append(key, this.form.value[key]);
    });

    // Append files to formData
    // Append files to formData
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        //formData.append('files', this.selectedFiles[i]);
        const file = this.selectedFiles[i];
        const fileData: any = {
          originalname: file.name,
          mimetype: file.type,
          buffer: await this.socketService.readFileAsArrayBuffer(file),
          size: file.size,
          // Add any other properties you want to include in file data
        };
        jsondata.files.push(fileData);
      }
    }
    this.saveLoader = true;

    const { newGuid, jsonData } = this.socketService.makeJsonDataGeneric('SendEmail','3015',jsondata);
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.toastr.success(res.message, { nzDuration: 2000 });
          } else {
            this.toastr.error(res.message, { nzDuration: 2000 });
          }
          this.openEmail(false);
          this.saveLoader = false;
        }
      },
      error: (err) => {
        this.saveLoader = false;
        this.toastr.error(`some error exception : ${err}`, { nzDuration: 2000 });
      }
    });
  }

  onFileChange(event: any) {
    this.selectedFiles.push(event.target.files[0]);
    // Clear the file input
    if (this.fileInputRef && this.fileInputRef.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }

  }
  openEmail(value: any) {
    this.isVisible = value;
    if (value == false) {
      this.form.reset();
      this.selectedFiles = [];
      this.to = [];
      this.cc = [];
      this.bcc = [];

    }
  }
  removeFile(file: any): void {
    const index = this.selectedFiles.indexOf(file);
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
}
