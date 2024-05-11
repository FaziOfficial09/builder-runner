import { Component, OnInit, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dynamic-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent extends FieldType<FieldTypeConfig> implements OnChanges {
  @Output() change = new EventEmitter<any>();
  selectedValue: any | null = null;
  requestSubscription: Subscription;
  constructor(private sharedService: DataSharedService, private cdr: ChangeDetectorRef) {
    super();
    this.processData = this.processData.bind(this);

  }
  getIcon(value: any) {
    return (this.to.options as any)
      .find((i: any) => i.value === value)?.icon;
  }
  get list(): any {
    return this.to.options;
  }
  ngOnInit(): void {
    if (this.to['additionalProperties']?.borderRadius !== undefined) {
      document.documentElement.style.setProperty('--radius', this.to['additionalProperties']?.borderRadius);
      this.cdr.detectChanges();
    }
  }
  ngOnChanges(changes: any) {
    if (this.to['additionalProperties']?.borderRadius) {
      document.documentElement.style.setProperty('--radius', this.to['additionalProperties']?.borderRadius);
      this.cdr.detectChanges();
    }
  }
  log(value: any): void {
    this.formControl.patchValue(value);
  }
  onModelChange(event: any, model: any) {
    if (this.to['additionalProperties']?.borderRadius !== undefined) {
      document.documentElement.style.setProperty('--radius', this.to['additionalProperties']?.borderRadius);
      this.cdr.detectChanges();
    }
    this.sharedService.onChange(event, this.field,);
    // console.log(event, model, 'radio');
  }
  ngOnDestroy(): void {
    if (this.requestSubscription)
      this.requestSubscription.unsubscribe();
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
}
