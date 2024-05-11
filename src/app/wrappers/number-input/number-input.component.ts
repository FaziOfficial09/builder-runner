import { Component, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent extends FieldType<FieldTypeConfig> {
  constructor(private sharedService: DataSharedService) {
    super();
  }
  demoValue = 3;
  precision = 1;
  // get max() {
  //   return this.to?.max ?? Infinity;
  // }

  // get min() {
  //   return this.to?.min ?? -Infinity;
  // }

  // get value() {
  //   return this.formControl.value;
  // }

  // get precision() {
  //   return this.to?.['precision'] ?? 5;
  // }


  // set value(value) {
  //   if (value != null)
  //     this.formControl.patchValue(value);
  // }


  // isAboveMin(value: any): boolean {
  //   return this.min == null || value >= this.min;
  // }

  // isBelowMax(value: any): boolean {
  //   return this.max == null || value <= this.max;
  // }
  getMaxlength(value: number | undefined): number {
    return value !== undefined && value == null ? value : Number.MAX_SAFE_INTEGER;
  }
  // return value == 10000000 && value == null ? null  : Number.MAX_SAFE_INTEGER;

  onModelChange(event: any, model: any) {
    this.sharedService.onChange(event, this.field);
  }
}
