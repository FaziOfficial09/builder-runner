import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent extends FieldType<FieldTypeConfig> implements OnInit {
  @Output() change = new EventEmitter<any>();
  selectedValue: any | null = null;
  constructor(private sharedService: DataSharedService, private cdr: ChangeDetectorRef) {
    super();
    this.processData = this.processData.bind(this);

  }
  ngOnInit(): void {
    document.documentElement.style.setProperty('--radius', this.to['additionalProperties']?.borderRadius);
    if (typeof this.formControl.value === 'string') {
      if (this.formControl.value === '' || this.formControl.value === undefined) {
        this.formControl.patchValue([]);
      }
    } if (this.formControl.value === '') {
      this.formControl.patchValue([]);
    }
    this.cdr.detectChanges();
  }
  ngOnChanges(changes: any) {
    document.documentElement.style.setProperty('--radius', this.to['additionalProperties']?.borderRadius);
  }
  get list(): any {
    return this.to.options;
  }
  // onModelChange(event: any, model: any) {
  //   this.sharedService.onChange(event, this.field,);
  //   console.log(event, model, 'radio');
  // }


  onModelChange(event: any, model: any) {
    // console.log(event);
    // this.sharedService.onChange(event == "" ? [] : event, this.field);
    // if (typeof event == 'string') {
    //   if (event == '') {
    //     if (this.selectedValue != event) {
    //       this.selectedValue = [];
    //       this.sharedService.onChange(this.selectedValue, this.field);

    //     }
    //   }
    //   else {
    //     this.selectedValue = event.split(',').map(name => name.trim());
    //     if (this.selectedValue != event) {
    //       this.sharedService.onChange(this.selectedValue, this.field);
    //     }
    //   }
    // }
    // else {
    //   // event = event.length > 0 ? event.join(', ') : [];
    //   if (JSON.stringify(this.selectedValue) != JSON.stringify(event)) {
    //     this.selectedValue = event
    //     console.log('event : ' + event);
    //     this.sharedService.onChange(this.selectedValue, this.field);
    //   }
    // }
    
  }
  processData(data: any) {
    if (data?.data?.length > 0) {
      let propertyNames = Object.keys(data?.data[0]);
      let result = data?.data?.map((item: any) => {
        let newObj: any = {};
        let propertiesToGet: string[];
        if ('id' in item && 'name' in item) {
          propertiesToGet = ['id', 'name'];
        } else {
          propertiesToGet = Object.keys(item).slice(0, 2);
        }
        propertiesToGet.forEach((prop) => {
          newObj[prop] = item[prop];
        });
        return newObj;
      });

      let finalObj = result.map((item: any) => {
        return {
          label: item.name || item[propertyNames[1]],
          value: item.id || item[propertyNames[0]],
        };
      });
      this.field.props.options = finalObj;
    }
    // Your processing logic here
    return data;
  }

  // convertToArray(): any {
  //   
  //   if (Array.isArray(this.formControl.value)) {
  //     return this.formControl.value;  // If it's already an array, return as is
  //   } else if (typeof this.formControl.value === 'string') {
  //     if (this.formControl.value.includes(',')) {
  //       return this.formControl.value.split(',');  // Split by commas to create an array
  //     } else {
  //       return [this.formControl.value];  // Convert the string into an array with one element
  //     }
  //   } else {
  //     return [];  // Invalid input type
  //   }
  // }
}

