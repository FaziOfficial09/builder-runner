import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'st-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent {
  formlyModel: any;
  screenName = '';
  screenId: any;
  navigation: any = undefined;
  // form: FormGroup;
  isVisible: boolean = false;
  form: any = new FormGroup({});
  selectedFiles: any = [];
  nodes: any = [];
  responseData: any;
  saveLoader : boolean = false;
  private subscriptions: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();
  requestSubscription: Subscription;
  constructor(private fb: FormBuilder, private toastr: NzMessageService, private modal: NzModalService,
    private authService: AuthService, private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    const subscription = this.activatedRoute.params.subscribe((params: any) => {
      params["pdfPage"]
      if (params["pdfPage"]) {
        this.getBuilder(params["pdfPage"]);
      }
    });
    this.subscriptions.add(subscription);
  }

  getBuilder(param: any) {
    this.saveLoader = true;
    let url = window.location.host.includes('spectrum') ? '172.23.0.8' : window.location.host.split(':')[0];
    // this.authService.getNestCommonAPI(`applications/navigation/${param}/${url}`).subscribe({
    //   next: (res: any) => {
    //     this.saveLoader = false;
    //     if (res.isSuccess) {
    //       this.saveLoader = false;
    //       this.screenId = res.data[0].screenBuilderId;
    //       this.screenName = res.data[0].screenName;
    //       this.navigation = res.data[0].navigation;
    //       this.nodes = [];
    //       this.nodes = JSON.parse(res.data[0].screenData);
    //       this.sendPDF();
    //     } else {
    //       this.toastr.error(res.message, { nzDuration: 2000 });
    //     }
    //   },
    //   error: (err) => {
    //     this.saveLoader = false;
    //     this.toastr.error(`some error exception : ${err}`, { nzDuration: 2000 });
    //   },
    // });
  }
  sendPDF() {
    let location = window.location.href;
    let obj = {
      'url': location,
    };

    // Add a time delay of 5 seconds (5000 milliseconds) before sending the PDF
    setTimeout(() => {
      // this.authService.addNestCommonAPI(`email/emailPdf`, obj).subscribe(
      //   (res: any) => {
      //     this.toastr.success('Email send successfully', { nzDuration: 2000 });
      //   },
      //   (error) => {
      //     console.error('Error sending email:', error);
      //   }
      // );
    }, 5000); // Adjust the delay time as needed (in milliseconds)
  }
  ngOnDestroy(): void {
    try {
      if (this.requestSubscription) {
        this.requestSubscription.unsubscribe();
      }
      if (this.subscriptions) {
        this.subscriptions.unsubscribe();
      }
      this.destroy$.next();
      this.destroy$.complete();
    } catch (error) {
      console.error('Error in ngOnDestroy:', error);
    }
  }
}
