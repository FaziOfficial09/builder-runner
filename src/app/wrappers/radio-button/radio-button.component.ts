import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Output, EventEmitter } from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class RadioButtonComponent extends FieldType<FieldTypeConfig> {
  @Output() change = new EventEmitter<any>();

  // constructor() { }
  constructor(private sharedService: DataSharedService) {
    super();
  }
  
  get list(): any {
    return this.to.options;
  }
  ngOnInit(): void {
  }
  onModelChange(event: any, model: any) {
    
    this.sharedService.onChange(event, this.field);
    console.log(event, model);
  }

}
