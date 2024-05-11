import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FieldArrayType, FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { FormArray, FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-repeatable-controll',
  templateUrl: './repeatable-controll.component.html',
  styleUrls: ['./repeatable-controll.component.scss']
})
export class RepeatableControllComponent extends FieldType<FieldTypeConfig> {
  subscription: Subscription;
  myForm: FormGroup;
  icons: any = {

  }
  requestSubscription: Subscription;
  orderIdOptions: any = [];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imageUrl: any;
  imagePath = environment.nestImageUrl;
  constructor(public dataSharedService: DataSharedService, private formBuilder: FormBuilder,
    private toastr: NzMessageService,
  ) {
    super();
  }
  ngOnInit(): void {
    
    this.makeOrderOptions();
    this.myForm = this.formBuilder.group({
      fieldGroups: this.formBuilder.array([]),
    });
    this.addFieldGroup(); // Add an initial field group
    this.dataSharedService.spectrumControlNull.subscribe(res => {
      if (res) {
        this.clearAllFieldGroups();
      }
    });
  }

  addFieldGroup() {
    const fieldGroup = this.formBuilder.group({
      manufacture: ['', Validators.required],
      model: ['', Validators.required],
      quantity: [0, Validators.required],
      serialnumber: ['', Validators.required],
      equipmentbroucher: ['', Validators.required],
      equipmentbroucher_base64: ['', Validators.required],
      customeclearenceid: ['', Validators.required],
      orderid: ['', Validators.required],
    });

    this.fieldGroups.push(fieldGroup);
    this.dataSharedService.onChange(this.myForm.value.fieldGroups, this.field);
  }

  removeFieldGroup(index: number) {
    this.fieldGroups.removeAt(index);
    this.formControl.patchValue(this.myForm.value.fieldGroups);
  }

  get fieldGroups(): FormArray {
    return this.myForm.get('fieldGroups') as FormArray;
  }

  onModelChange(event: any, model: any) {
    if (this.myForm.value.fieldGroups.length > 0) {
      for (let index = 0; index < this.myForm.value.fieldGroups.length; index++) {
        if (this.myForm.value.fieldGroups[index]) {
          for (const key in this.myForm.value.fieldGroups[index]) {
            if (key.includes('_base64')) {
              if (this.myForm.value.fieldGroups[index][key]) {
                this.myForm.value.fieldGroups[index][key.split('_')[0]] = this.myForm.value.fieldGroups[index][key];
              }
            }
          }
        }
      }
    }
    this.dataSharedService.onChange(this.myForm.value.fieldGroups, this.field);
  }


  onFileSelected(event: any, index: number) {
    const file: File = event.target.files[0];
    this.uploadFile(file, index);
  }

  uploadFile(file: File, index: number) {
    
    const formData = new FormData();
    formData.append('image', file);
    // this.applicationService.uploadS3File(formData).subscribe({
    //   next: (res) => {
    //     // this.icons['prefixIcon'] = 'eye';
    //     // this.icons['suffixIcon'] = 'delete';
    //     // this.myForm.value.fieldGroups[index]['equipmentbroucher'] = this.imagePath + res.path;
    //     this.myForm.value.fieldGroups[index]['equipmentbroucher_base64'] = this.imagePath + res.path;
    //     this.fieldGroups.at(index).get('equipmentbroucher_base64')?.setValue(this.imagePath + res.path);
    //     // this.fieldGroups.at(index).get('equipmentbroucher')?.setValue(this.imagePath + res.path);
    //     this.onModelChange(null, null)
    //     console.log('File uploaded successfully:', res);
    //   },
    //   error: (err) => {
    //     this.toastr.success('Erro in repeatable controll file upload : ' + err, {
    //       nzDuration: 3000,
    //     });
    //     console.error('Error uploading file:', err);
    //   }
    // });



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
    //       // this.dataSharedService.onChange(JSON.stringify(currentData), this.field);
    //       this.myForm.value.fieldGroups[index]['equipmentBroucher'] = currentData;
    //       this.myForm.value.fieldGroups[index]['equipmentBroucher_base64'] = currentData;
    //       this.fieldGroups.at(index).get('equipmentBroucher_base64')?.setValue(currentData);
    //       this.fieldGroups.at(index).get('equipmentBroucher')?.setValue('');
    //       this.onModelChange(null, null)
    //     };

    //     reader.readAsText(file); // Read the JSON file as text
    //   }
    //   else {
    //     reader.readAsDataURL(file); // Read other types of files as data URL (base64)
    //     reader.onload = () => {
    //       const base64Data = reader.result as string;
    //       this.dataSharedService.imageUrl = base64Data;
    //       this.myForm.value.fieldGroups[index]['equipmentBroucher'] = base64Data;
    //       this.myForm.value.fieldGroups[index]['equipmentBroucher_base64'] = base64Data;
    //       this.fieldGroups.at(index).get('equipmentBroucher_base64')?.setValue(base64Data);
    //       this.fieldGroups.at(index).get('equipmentBroucher')?.setValue('');
    //       this.onModelChange(null, null)
    //       // this.formControl.setValue(base64Data);
    //       // this.dataSharedService.onChange(base64Data, this.field);
    //     };
    //   }

    //   reader.onerror = (error) => {
    //     console.error('Error converting file to base64:', error);
    //   };
    // }

  }
  // Function to clear the selected file and reset the form control value
  clearAllFieldGroups() {
    // Reset all form controls in the formArray
    this.fieldGroups.controls.forEach(control => {
      control.reset();
    });
  }

  clearFieldGroup(index: number) {
    // Reset the form control at the specified index
    this.fieldGroups.at(index).reset();
  }
  clearFile(index: any) {
    this.icons['suffixIcon'] = '';
    this.icons['prefixIcon'] = '';
    this.fieldGroups.at(index).get('equipmentbroucher')?.setValue('');
    this.fieldGroups.at(index).get('equipmentbroucher_base64')?.setValue('');
  }
  imagePreview(index: any) {
    window.open(this.myForm.value.fieldGroups[index]['equipmentbroucher_base64'], '_blank');
  }
  makeOrderOptions() {
    // this.requestSubscription = this.applicationService.callApi('knex-query/getexecute-rules/' + '6537d8d702b56b2d8b97d9f9', 'get', '', '', '').subscribe(
    //   (response) => {
    //     if (response?.isSuccess) {
    //       if (response?.data?.length > 0) {
    //         let propertyNames = Object.keys(response?.data[0]);
    //         let result = response?.data.map((item: any) => {
    //           let newObj: any = {};
    //           let propertiesToGet: string[];
    //           if ('id' in item && 'name' in item) {
    //             propertiesToGet = ['id', 'name'];
    //           } else {
    //             propertiesToGet = Object.keys(item).slice(0, 2);
    //           }
    //           propertiesToGet.forEach((prop) => {
    //             newObj[prop] = item[prop];
    //           });
    //           return newObj;
    //         });

    //         let finalObj = result.map((item: any) => {
    //           return {
    //             label: item.name || item[propertyNames[1]],
    //             value: item.id || item[propertyNames[0]],
    //           };
    //         });
    //         this.orderIdOptions = finalObj;
    //       }
    //     }
    //   },
    //   (error) => {
    //     this.toastr.success(`error occurec in repeatbale control : ${error}`, {
    //       nzDuration: 3000,
    //     });
    //     console.log(`error occurec in repeatbale control : ${error}`)
    //     // Handle any errors from the API call
    //   }
    // );
  }
}
