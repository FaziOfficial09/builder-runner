import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'st-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {
  @Input() step: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  current = 0;
  ngOnInt(){
    debugger
    document.documentElement.style.setProperty('--selected-stepper-color',this.step?.selectedStepperColor || '#1890ff');
    this.step;
  }

  pre(): void {
    document.documentElement.style.setProperty('--selected-stepper-color',this.step?.selectedStepperColor || '#1890ff');
    this.current -= 1;
  }

  next(): void {
    document.documentElement.style.setProperty('--selected-stepper-color',this.step?.selectedStepperColor || '#1890ff');
    this.current += 1;
  }

  done(): void {
    console.log('done');
  }



  handleIndexChange(event: any) {
    console.log("step click");
  }
  constructor() { }

  ngOnInit(): void {
    this.current = 0;

  }

}
