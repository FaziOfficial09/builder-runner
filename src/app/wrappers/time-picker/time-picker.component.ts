import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent extends FieldType<FieldTypeConfig> {
  time: any | null = null;
  constructor(private sharedService: DataSharedService) {
    super();
  }
  ngOnInit(): void {
  }

  log(value: any): void {
    let formattedDate = value.toISOString();
    this.sharedService.onChange(formattedDate, this.field);
  }
}
