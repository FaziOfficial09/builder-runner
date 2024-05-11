import { Component, ElementRef, VERSION, ViewChild, OnInit, ViewContainerRef } from "@angular/core";
import SignaturePad from "signature_pad";
import { DataSharedService } from "src/app/services/data-shared.service";
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { NzModalService } from "ng-zorro-antd/modal";
import { SignatureModalComponent } from "src/app/components/signature-modal/signature-modal.component";

@Component({
  selector: 'st-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponent extends FieldType<FieldTypeConfig> {
  constructor(private sharedService: DataSharedService,
    private modalService: NzModalService, private viewContainerRef: ViewContainerRef) {
    super();
  }
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  @ViewChild('previewCanvas', { static: true }) previewCanvas: ElementRef;
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D;
  private signaturePad: SignaturePad;
  preview: boolean = false;
  label: any = 'Add';
  signatureData: any;
  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    // this.previewCtx = this.previewCanvas.nativeElement.getContext('2d');
    this.setupSignaturePad();
    if (this.field.formControl.value) {
      this.loadImage(this.field.formControl.value);
      this.signatureData = this.field.formControl.value;
    }
    // this.reassignSignature();
  }

  setupSignaturePad() {
    this.signaturePad = new SignaturePad(this.canvas.nativeElement, {
      minWidth: 1,
      maxWidth: 2,
      penColor: 'black',
      // backgroundColor: 'white',
      // Add any other properties you need
    });
  }

  clearSignature() {
    this.signaturePad.clear();
    // this.clearPreview();
  }

  saveSignature() {
    const signatureDataURL = this.canvas.nativeElement.toDataURL();
    console.log(signatureDataURL);
    // this.modalRef.destroy(signatureDataURL);
  }

  cancel() {
    // this.modalRef.destroy();
  }

  // // updatePreview() {
  // //   const signatureDataURL = this.signaturePad.toDataURL();
  // //   this.previewCtx.clearRect(0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
  // //   const image = new Image();
  // //   image.src = signatureDataURL;
  // //   console.log(image)
  // //   this.previewCtx.drawImage(image, 0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
  // // }

  // // clearPreview() {
  // //   this.previewCtx.clearRect(0, 0, this.previewCanvas.nativeElement.width, this.previewCanvas.nativeElement.height);
  // // }
  // reassignSignature() {
  //   // For demonstration purposes, reassigning a sample base64 image
  //   const sampleBase64 = 'data:image/png;base64,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CBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoCAqReT1VEgACBFAEBksJsEgIECNQTECD1eqoiAgQIpAgIkBRmkxAgQKCegACp11MVESBAIEVAgKQwm4QAAQL1BARIvZ6qiAABAikCAiSF2SQECBCoJyBA6vVURQQIEEgRECApzCYhQIBAPQEBUq+nKiJAgECKgABJYTYJAQIE6gkIkHo9VREBAgRSBARICrNJCBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoCAqReT1VEgACBFAEBksJsEgIECNQTECD1eqoiAgQIpAgIkBRmkxAgQKCegACp11MVESBAIEVAgKQwm4QAAQL1BARIvZ6qiAABAikCAiSF2SQECBCoJyBA6vVURQQIEEgRECApzCYhQIBAPQEBUq+nKiJAgECKgABJYTYJAQIE6gkIkHo9VREBAgRSBARICrNJCBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoCAqReT1VEgACBFAEBksJsEgIECNQTECD1eqoiAgQIpAgIkBRmkxAgQKCegACp11MVESBAIEVAgKQwm4QAAQL1BARIvZ6qiAABAikCAiSF2SQECBCoJyBA6vVURQQIEEgRECApzCYhQIBAPQEBUq+nKiJAgECKgABJYTYJAQIE6gkIkHo9VREBAgRSBARICrNJCBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoCAqReT1VEgACBFAEBksJsEgIECNQTECD1eqoiAgQIpAgIkBRmkxAgQKCegACp11MVESBAIEVAgKQwm4QAAQL1BARIvZ6qiAABAikCAiSF2SQECBCoJyBA6vVURQQIEEgRECApzCYhQIBAPQEBUq+nKiJAgECKgABJYTYJAQIE6gkIkHo9VREBAgRSBARICrNJCBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoCAqReT1VEgACBFAEBksJsEgIECNQTECD1eqoiAgQIpAgIkBRmkxAgQKCegACp11MVESBAIEVAgKQwm4QAAQL1BARIvZ6qiAABAikCAiSF2SQECBCoJyBA6vVURQQIEEgRECApzCYhQIBAPQEBUq+nKiJAgECKgABJYTYJAQIE6gkIkHo9VREBAgRSBARICrNJCBAgUE9AgNTrqYoIECCQIiBAUphNQoAAgXoC/wNwHOSNmmPHYAAAAABJRU5ErkJggg=='; // Replace with your actual base64 data
  //   this.loadImage(sampleBase64);
  // }

  loadImage(dataURL: string) {
    const image = new Image();
    image.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(image, 0, 0);
    };
    image.src = dataURL;
  }
  add() {
    const modal = this.modalService.create<SignatureModalComponent>({
      nzTitle: 'Signature',
      nzContent: SignatureModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth:'300px',
      // nzHeight:'30%',
      nzComponentParams: {
        data: {
          'signatureData': this.signatureData,
          'addButtonClass': this.to['additionalProperties']?.signatureAddButtonClass,
          'clearButtonClass': this.to['additionalProperties']?.signatureClearButtonClass,
        },
      },
      nzFooter: []
    });
    modal.afterClose.subscribe((res: any) => {
      if (res) {
        debugger
        let url = res.url;
        this.signatureData = res.url;
        this.signaturePad.clear();
        this.label = res.add;
        this.sharedService.onChange(url, this.field);
        this.loadImage(res.url);
      }
    });
  }
}
