import { Component, Input } from '@angular/core';
import ZebraBrowserPrintWrapper from 'zebra-browser-print-wrapper';

@Component({
  selector: 'st-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent {
  @Input() model: any;
  @Input() item: any;

  // print = async () => {
  //   try {

  //     // Create a new instance of the object
  //     const browserPrint = new ZebraBrowserPrintWrapper();

  //     // Select default printer
  //     const defaultPrinter = await browserPrint.getDefaultPrinter();

  //     // Set the printer
  //     browserPrint.setPrinter(defaultPrinter);

  //     // Check printer status
  //     const printerStatus = await browserPrint.checkPrinterStatus();

  //     // Check if the printer is ready
  //     if (printerStatus.isReadyToPrint) {

  //       // ZPL script to print a simple barcode
  //       const zpl = `^XA
  //             ^MMT
  //             ^PW406
  //             ^LL0203
  //             ^LS0
  //             ^FT160,168^BQN,2,4
  //             ^FH\^FDLA,${this.model}^FS
  //             ^PQ1,0,1,Y
  //             ^XZ`;

  //       browserPrint.print(zpl);
  //     } else {
  //       console.log("Error/s", printerStatus.errors);
  //     }

  //   } catch (error: any) {
  //     console.log(error)
  //     // throw new Error(error);
  //   }
  // }
  print() {
    try {
      const link = this.item?.qrString.replace('$link', this.model ? this.model : this.item?.link)
      console.log(link);
      const printContents = document.getElementById('imageToPrint');
      let popupWin: any = window.open('', '_blank', 'width=auto,height=auto');
      popupWin.document.open();
      popupWin.document.write(link
      );
      popupWin.document.close();
    } catch (error: any) {
      console.log(error)
      // throw new Error(error);
    }
  }
}

