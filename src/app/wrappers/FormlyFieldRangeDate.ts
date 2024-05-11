import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'st-formly-field-ng-search',
  template: `
<div [class]="to['additionalProperties']?.wrapper=='floating_standard' ? 'relative z-0' : ''">
   <nz-input-group [nzSuffix]="to['additionalProperties']?.addonLeft" [nzPrefix]="to['additionalProperties']?.addonRight" [nzStatus]="to['additionalProperties']?.status"
   [nzSize]="to['additionalProperties']?.size">
   <nz-range-picker [ngClass]="to['additionalProperties']?.wrapper=='floating_filled' || to['additionalProperties']?.wrapper=='floating_standard'
    || to['additionalProperties']?.wrapper=='floating_outlined' ? to['additionalProperties']?.floatFieldClass : ''" nzMode="date" style="width:100%" [nzDisabled]="to.disabled" [formControl]="formControl" [nzStatus]="to['additionalProperties']?.status"></nz-range-picker>
   <label
          *ngIf="to['additionalProperties']?.wrapper == 'floating_filled' ||to['additionalProperties']?.wrapper=='floating_standard'
          ||to['additionalProperties']?.wrapper == 'floating_outlined'"
          [ngClass]="to['additionalProperties']?.floatLabelClass">{{ to.label ?? '' | translate }}
        </label>
   </nz-input-group>
</div>
  `,
})
export class FormlyFieldRangeDate extends FieldType<FieldTypeConfig> {
  date = null;
  onChange(result: Date[]): void {
    // console.log('onChange: ', result);
  }
}
