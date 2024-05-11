import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'st-signature-modal',
  templateUrl: './signature-modal.component.html',
  styleUrls: ['./signature-modal.component.scss']
})

export class SignatureModalComponent implements OnInit {
  data: any;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  // @ViewChild('previewCanvas', { static: true }) previewCanvas: ElementRef;
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D;
  private signaturePad: SignaturePad;
  preview: boolean = false;
  constructor(private modalRef: NzModalRef) { }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    // this.previewCtx = this.previewCanvas.nativeElement.getContext('2d');
    this.setupSignaturePad();
    if(this.data){
      this.reassignSignature(this.data.signatureData);
    }
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
    debugger
    const signatureDataURL = this.canvas.nativeElement.toDataURL();
    console.log(signatureDataURL);
    // this.modalRef.destroy(signatureDataURL);
    let label = this.signaturePad._isEmpty ? 'Add' : 'Update'
    // this.canvas.nativeElement.fromDataURL(signatureDataURL);
    let obj = {
      'url': signatureDataURL,
      'add': label
    }
    this.modalRef.destroy(obj);
  }

  cancel() {
    this.modalRef.destroy();
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
  reassignSignature(value: any) {
    this.loadImage(value);
  }

  loadImage(dataURL: string) {
    const image = new Image();
    image.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(image, 0, 0);
    };
    image.src = dataURL;
  }
}
