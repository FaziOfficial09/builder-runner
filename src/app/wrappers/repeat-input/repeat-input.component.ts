import { Component } from '@angular/core';
import {  UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'st-repeat-input',
  templateUrl: './repeat-input.component.html',
  styleUrls: ['./repeat-input.component.scss']
})
export class RepeatInputComponent extends FieldType<FieldTypeConfig> {
  subscription: Subscription;
  listOfControl: Array<{ id: number; controlInstance: string }> = [];
  constructor(private fb: UntypedFormBuilder) {
    super();
  }
  validateForm!: UntypedFormGroup;
  ngOnInit(): void {
    this.validateForm = this.fb.group({});
    this.addField();
  }

  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id = this.listOfControl.length > 0 ? this.listOfControl[this.listOfControl.length - 1].id + 1 : 0;
    const control = {
      id,
      controlInstance: id.toString()
    };
    const index = this.listOfControl.push(control);
    this.validateForm.addControl(
      this.listOfControl[index - 1].controlInstance,
      new UntypedFormControl(null, Validators.required)
    );
    this.subscription = this.validateForm.valueChanges.subscribe(value => {
     this.formControl.patchValue(this.validateForm.value);
    });
  }

  removeField(i: { id: number; controlInstance: string }, e: MouseEvent): void {
    e.preventDefault();
    if (this.listOfControl.length > 1) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      this.validateForm.removeControl(index.toString());
      this.formControl.patchValue(this.validateForm.value);
    }
  }
  ngOnDestroy(){
    if(this.subscription)
     this.subscription.unsubscribe();
  }
}
