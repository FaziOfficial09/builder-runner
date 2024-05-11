import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() modalData: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  isVisible = false;
  constructor() { }

  ngOnInit(): void {
  }
  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
  doSomethingAfterModalOpens() {
    console.log("Modal is open!");
  }
  doSomethingAfterModalClose() {
    console.log("Modal is close!");
  }

}
