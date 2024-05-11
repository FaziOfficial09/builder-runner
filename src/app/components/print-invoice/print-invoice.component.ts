import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-print-invoice',
  templateUrl: './print-invoice.component.html',
  styleUrls: ['./print-invoice.component.scss']
})
export class PrintInvoiceComponent implements OnInit {
  @Input() printInvoiceData : any;
  constructor() { }

  ngOnInit(): void {
    this.printInvoiceData;
  }
  displayImage(event: any) {
   
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.printInvoiceData.image = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  removeImage() {
    this.printInvoiceData.image = "";
  }

  print(){
    window.print();
  }

}
