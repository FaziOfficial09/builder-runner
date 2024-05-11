import { Component, Input } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-input-wrapper',
  templateUrl: './input-wrapper.component.html',
  styleUrls: ['./input-wrapper.component.scss']
})
export class InputWrapperComponent extends FieldType<FieldTypeConfig>  {
  @Input() value = '';
  @Input() placeholder = '';
  selectedValue : any = '';
  constructor(private sharedService: DataSharedService) {
    super();
  }
  ngOnInit(): void {
    if (this.to.type == 'password') {
      this.to['additionalProperties'].suffixicon = 'eye-invisible';
      if (this.to['additionalProperties']?.wrapper == 'floating_filled' || this.to['additionalProperties']?.wrapper == 'floating_standard'
        || this.to['additionalProperties']?.wrapper == 'floating_outlined') {
        this.to['additionalProperties'].suffixicon = '';
      }
    }
  }
  showPassword(to: any) {
    if (to.type == 'password' && this.to['additionalProperties']?.suffixicon == 'eye' || this.to['additionalProperties']?.suffixicon == 'eye-invisible') {
      this.to['additionalProperties'].suffixicon = 'eye';
      this.to.type = 'text';
    } else if (to.type == 'text') {
      this.to['additionalProperties'].suffixicon = 'eye-invisible';
      this.to.type = 'password';
    }
  }
  onModelChange(event : any , field : any){
    this.selectedValue = event;
    this.sharedService.onChange(event, this.field);
  }

}

