import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { DatePipe } from '@angular/common'; // Import DatePipe

@Component({
  selector: 'st-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent extends FieldType<FieldTypeConfig> {
  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;
  @Output() change = new EventEmitter<any>();
  constructor(private sharedService: DataSharedService, private datePipe: DatePipe) {
    super();
  }
  startValue: Date | null = null;
  endValue: Date | null = null;

  ngOnInit(): void {
  }

  // disabledStartDate = (startValue: Date): boolean => {
  //   if (!startValue || !this.endValue) {
  //     return false;
  //   }
  //   return startValue.getTime() > this.endValue.getTime();
  // };

  // disabledEndDate = (endValue: Date): boolean => {
  //   if (!endValue || !this.startValue) {
  //     return false;
  //   }
  //   return endValue.getTime() <= this.startValue.getTime();
  // };

  // handleStartOpenChange(open: boolean): void {
  //   if (!open) {
  //     this.endDatePicker.open();
  //   }
  //   console.log('handleStartOpenChange', open);
  // }

  // handleEndOpenChange(open: boolean): void {
  //   console.log('handleEndOpenChange', open);
  // }

  onModelChange(event: any, model: any) {

    if (typeof event !== 'string' && this.to.type === 'date') {
      let formattedDate = event.toISOString();
      console.log('data : ' + formattedDate)
      this.sharedService.onChange(formattedDate, this.field);
    }
  }
  disabledDate = (current: Date): boolean => {
    if (this.to['additionalProperties']?.disabledCalenderProperties) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      if (this.to.type === 'date') {
        if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBoth') {
          return current < new Date(currentDate.setHours(0, 0, 0, 0)) || current > currentDate;
        }
        else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBeforeCurrent') {
          return current < new Date(currentDate.setHours(0, 0, 0, 0));
        } else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledAfterCurrent') {
          return current > currentDate;
        }
      }
      else if (this.to.type === 'month') {
        if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBoth') {
          return current.getFullYear() < currentYear || (current.getFullYear() === currentYear && current.getMonth() < currentMonth) ||
            current.getFullYear() > currentYear || (current.getFullYear() === currentYear && current.getMonth() > currentMonth);
        }
        else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBeforeCurrent') {
          return current.getFullYear() < currentYear || (current.getFullYear() === currentYear && current.getMonth() < currentMonth);
        } else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledAfterCurrent') {
          return current.getFullYear() > currentYear || (current.getFullYear() === currentYear && current.getMonth() > currentMonth);
        }
      }
      else if (this.to.type === 'year') {
        if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBoth') {
          return current.getFullYear() < currentYear || current.getFullYear() > currentYear;
        }
        else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledBeforeCurrent') {
          return current.getFullYear() < currentYear;
        } else if (this.to['additionalProperties']?.disabledCalenderProperties == 'disabledAfterCurrent') {
          return current.getFullYear() > currentYear;
        }
      }
      return false;
    }
    return false;
  };
}


