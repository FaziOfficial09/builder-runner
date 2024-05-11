import { Component, ViewChild, ElementRef } from '@angular/core';
import { FieldTypeConfig, FieldWrapper } from '@ngx-formly/core';
import { DataSharedService } from '../services/data-shared.service';
import { environment } from 'src/environments/environment';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'formly-field-image-upload',
  template: `
  <div [ngClass]="{
  'imageUpload': true,
  'dynamic-image-upload': this.to['additionalProperties']?.browserButtonColor
}">
<div class="dynamic-file-input"  [class]="to['additionalProperties']?.wrapper=='floating_standard' ? 'relative z-0' : ''"
   >
   <nz-input-group [style.border-radius]="to['additionalProperties']?.borderRadius"
   [ngClass]="showError ? 'input-border' : ''"
   [nzSuffix]="(to['additionalProperties']?.addonRight   || to['additionalProperties']?.suffixicon) ? suffixTemplateInfo : undefined"
   [nzPrefix]="(to['additionalProperties']?.addonLeft || to['additionalProperties']?.prefixicon) ? prefixTemplateUser : undefined"
   [nzSize]="to['additionalProperties']?.size"
   [nzStatus]="to['additionalProperties']?.status">
   <input  [accept]=" to['additionalProperties']?.filetype == 'excel' ?' application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :to['additionalProperties']?.filetype || '.jpg'"  [style.border-radius]="to['additionalProperties']?.borderRadius"
   [ngClass]=" showError && !to['additionalProperties']?.suffixicon && !to['additionalProperties']?.prefixicon
   && !to['additionalProperties']?.addonLeft && !to['additionalProperties']?.addonRight ? 'input-border' : ''"
   *ngIf=" to.type !='textarea'"
   [ngClass]="to['additionalProperties']?.wrapper=='floating_filled' || to['additionalProperties']?.wrapper=='floating_standard'
   || to['additionalProperties']?.wrapper=='floating_outlined' ? to['additionalProperties']?.floatFieldClass : ''"
   [formlyAttributes]=" field"
   nz-input
   [type]="'file'"
   (change)="onFileSelected($event)" 
   [placeholder]="to.placeholder"
   [nzStatus]="to['additionalProperties']?.status"
   [nzSize]="to['additionalProperties']?.size"
   [formControl]="formControl"
   [nzBorderless]="to['additionalProperties']?.border" />
   <label
   *ngIf="to['additionalProperties']?.wrapper == 'floating_filled' ||to['additionalProperties']?.wrapper=='floating_standard'
   ||to['additionalProperties']?.wrapper == 'floating_outlined'"
   [ngClass]="to['additionalProperties']?.floatLabelClass">{{ to.label ?? '' | translate }}
   </label>
   </nz-input-group>
</div>
</div>
<ng-template #suffixTemplateInfo>
   <ng-container  *ngIf="to['additionalProperties']?.suffixicon ; else addonLeftText">
      <st-icon  (click)="clearFile(to['additionalProperties']?.suffixicon)" [type]="to['additionalProperties']?.iconType || 'outline'"
      [icon]="this.formControl.value ? 'delete' : to['additionalProperties']?.suffixicon"
      [size]="to['additionalProperties']?.iconSize"
      [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''"
      [color]="to['additionalProperties']?.iconColor" ></st-icon>
   </ng-container>
   <ng-template #addonLeftText>
      {{to['additionalProperties']?.addonLeft}}
   </ng-template>
</ng-template>
<ng-template #prefixTemplateUser >
   <ng-container *ngIf="to['additionalProperties']?.prefixicon ; else addonRightText">
      <st-icon (click)="imagePreview(to['additionalProperties']?.prefixicon)" [type]="to['additionalProperties']?.iconType || 'outline'"
      [icon]="this.formControl.value ? 'eye' : to['additionalProperties']?.prefixicon"
      [size]="to['additionalProperties']?.iconSize"
      [hoverIconColor]="to['additionalProperties']?.hoverIconColor || ''"
      [color]="to['additionalProperties']?.iconColor"
      ></st-icon>
   </ng-container>
   <ng-template #addonRightText>
      {{to['additionalProperties']?.addonRight}}
   </ng-template>
</ng-template>
  `,
})
export class FormlyFieldImageUploadComponent extends FieldWrapper<FieldTypeConfig> {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imageUrl: any;
  imagePath = environment.nestImageUrl;

  constructor(private sharedService: DataSharedService, private readonly socketService:SocketService,private dataSharedService:DataSharedService) {
    super();
  }
  ngOnInit(): void {
    document.documentElement.style.setProperty('--browseButtonColor', this.to['additionalProperties']?.browserButtonColor || '#2563EB');
    document.documentElement.style.setProperty('--hoverBrowseButtonColor', this.to['additionalProperties']?.hoverBrowseButtonColor || '#3b82f6');

  }
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const fileData:any = {
      originalname: file.name,
      mimetype: file.type,
      buffer:await this.socketService.readFileAsArrayBuffer(file),
      size: file.size,
    };

    this.uploadFile(fileData);
  }
  uploadFile(fileData: string) {
    
    // this is used on configuration when response come then user can save configuration
    this.sharedService.gericFieldLoader.next(true);
    this.sharedService.pagesLoader.next(true);  
    const { jsonData, newGuid } = this.socketService.makeJsonfileData('3018', fileData);
    this.dataSharedService.saveDebugLog('uploadFile',newGuid)
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.sharedService.gericFieldLoader.next(false);
          this.sharedService.pagesLoader.next(false);
        // this.isLoading = false;
        // this.toastr.success('File uploaded successfully', { nzDuration: 3000 });
        // if (this.to['additionalProperties']) {
        //   this.to['additionalProperties'].suffixicon = 'delete';
        //   this.to['additionalProperties'].prefixicon = 'eye';
        //   if (this.to['additionalProperties']?.wrapper == 'floating_filled' || this.to['additionalProperties']?.wrapper == 'floating_standard'
        //     || this.to['additionalProperties']?.wrapper == 'floating_outlined') {
        //     this.to['additionalProperties'].suffixicon = '';
        //     this.to['additionalProperties'].prefixicon = '';
        //   }
        // }
        // this.sharedService.onChange(this.imagePath + res.path, this.field,);
        // this.formControl.patchValue(this.imagePath + res.path);
        console.log(this.imagePath + res.path)
        this.sharedService.onChange(this.imagePath + res.path, this.field);

        // this.form.patchValue({ url:  })
        // this.model.url = this.imagePath + res.path;
      }
      },
      error: (err) => {
        this.sharedService.gericFieldLoader.next(false);
        // this.isLoading = false;
        console.error('Error uploading file:', err);
      }
    });
    // const reader = new FileReader();

    // if (file) {
    //   if (file.type === 'application/json') {
    //     reader.onload = () => {
    //       const base64Data = reader.result as string;
    //       const makeData = JSON.parse(base64Data);
    //       let data = makeData.screenData ? makeData.screenData : makeData;
    //       const currentData = JSON.parse(
    //         JSON.stringify(data, function (key, value) {
    //           if (typeof value === 'function') {
    //             return value.toString();
    //           } else {
    //             return value;
    //           }
    //         }) || '{}'
    //       );
    //       // this.formControl.setValue(JSON.stringify(currentData));
    //       this.sharedService.onChange(JSON.stringify(currentData), this.field);

    //     };

    //     reader.readAsText(file); // Read the JSON file as text
    //   }
    //   else {
    //     reader.readAsDataURL(file); // Read other types of files as data URL (base64)
    //     reader.onload = () => {
    //       const base64Data = reader.result as string;
    //       this.sharedService.imageUrl = base64Data;
    //       // this.formControl.setValue(base64Data);
    //     };
    //   }

    //   reader.onerror = (error) => {
    //     console.error('Error converting file to base64:', error);
    //   };
    // }

  }
  // Function to clear the selected file and reset the form control value
  clearFile(data: any) {
    if (data == 'delete') {
      this.imageUrl = null;
      // this.fileInput.nativeElement.value = '';
      this.formControl.setValue(null);
      this.to['additionalProperties'].suffixicon = '';
      this.to['additionalProperties'].prefixicon = '';
    }
  }
  imagePreview(data: any) {
    if (data == 'eye') {
      window.open(this.formControl.value, '_blank');
    }
  }
}
