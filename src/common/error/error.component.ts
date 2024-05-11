import { Component, Input, OnInit } from '@angular/core';
import { FormControl,AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {

  }

  @Input() form_control: AbstractControl;
  @Input() isSubmitted: boolean;
}
