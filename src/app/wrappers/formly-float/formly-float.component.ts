import { Component, OnInit } from '@angular/core';
import { FieldTypeConfig, FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'st-formly-float',
  templateUrl: './formly-float.component.html',
  styleUrls: ['./formly-float.component.scss']
})
export class FormlyFloatComponent extends FieldWrapper<FieldTypeConfig> {

  constructor() {
    super();
   }

  ngOnInit(): void {
  }

}
