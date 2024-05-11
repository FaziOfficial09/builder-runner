import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent extends FieldType<FieldTypeConfig> {
  @Output() change = new EventEmitter<any>();
  constructor(private sharedService: DataSharedService) {
    super();
  }

  ngOnInit(): void {
  }

  // onModelChange(event: any, model: any) {
  //   
  //   if (event) {
  //     if (event.length > 0) {
  //       if (event[0])
  //         this.sharedService.onChange(event, this.field);
  //       // console.log(event, model);
  //       else {
  //         this.formControl.patchValue(null)
  //       }
  //     }
  //   }
  // }


  onModelChange(event: any, model: any) {
    console.log(event)
    this.sharedService.onChange(event, this.field);
    // console.log(event, model);
  }

}
