import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'st-multi-file-upload-wrapper',
  templateUrl: './multi-file-upload-wrapper.component.html',
  styleUrls: ['./multi-file-upload-wrapper.component.scss']
})
export class MultiFileUploadWrapperComponent extends FieldType<FieldTypeConfig> {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imageUrl: any;
  loading = false;
  avatarUrl?: string;
  // nestBaseUrl = environment.nestBaseUrl
  constructor(private msg: NzMessageService, private sharedService: DataSharedService, public http: HttpClient,private dataSharedService:DataSharedService,
    private readonly socketService: SocketService) {
    super();
  }

  ngOnInit(): void {
  }
  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    // if (status !== 'uploading') {
    //   console.log(file, fileList);
    // }
    // if (status === 'done') {
    //   this.msg.success(`${file.name} file uploaded successfully.`);
    // } else if (status === 'error') {
    //   this.msg.error(`${file.name} file upload failed.`);
    // }
  }
  files: any[] = [];
  handleFileRemove(file: any): boolean {
    console.log(`Removing file: ${file.name}`);
    // Add your logic to handle file removal, such as updating the fileList array
    // Return `true` to allow file removal, or `false` to prevent it
    return true;
  }
  handleUploadChange(event: NzUploadChangeParam): void {
    if (event.type === 'success') {
      this.files.push(event.file.response?.message);
      this.formControl.patchValue(this.files);
      // Handle successful upload
      console.log('File uploaded successfully', event.file, event.fileList);
    } else if (event.type === 'error') {
      // Handle upload error
      console.error('File upload error', event.file, event.fileList);
    }
  }
  fileList: any[] = [];
  beforeUpload = (file: any, _fileList: any[]): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        this.msg.error('You can only upload JPG file!');
        observer.complete();
        return;
      }
      const isLt2M = file.size! / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.msg.error('Image must smaller than 2MB!');
        observer.complete();
        return;
      }
      this.fileList.push(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        // `reader.result` contains the base64-encoded file data
        const base64Data = reader.result as string;

        // const customUploadUrl = environment.nestBaseUrl +'market-place/testing'; // Replace with your custom URL
        // const obj  = {
        //   image : base64Data
        // }
        const { jsonData, newGuid } = this.socketService.makeJsonfileData('3018', base64Data);
        this.dataSharedService.saveDebugLog('MultiFileUpload',newGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe(
          (res: any) => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              console.log('File uploaded successfully', res);
              observer.next(isJpgOrPng && isLt2M);
              observer.complete();
            }
          },
          (error: any) => {
            // Handle upload error
            console.error('File upload error', error);
            observer.complete();
          }
        );
      };

      reader.onerror = () => {
        // Handle any errors that may occur during file reading
        console.error('File reading error occurred.');
        observer.complete();
        return;
      };
    });


}
