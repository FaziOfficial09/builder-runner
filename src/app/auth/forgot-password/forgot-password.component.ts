import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonService } from 'src/common/common-services/common.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  // ngAfterViewInit() {
  //   // Reinitialize reCAPTCHA after the view has been initialized
  //   grecaptcha.render('recaptcha', { sitekey: environment.recaptcha.siteKey });
  // }


  recaptchaResponse = '';
  ngOnInit(): void {
    // init Form
    this.loadScript();
    this.create();
    this.cdr.detectChanges();
  }

  showLoader: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService
  ) { }
  showRecaptcha: boolean = false;
  isFormSubmit: boolean = false;
  form: FormGroup;
  // form
  create() {
    this.form = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      remember: [true],
      recaptch: [false]
    });
  }

  get f() {
    return this.form.controls;
  }

  submitForm(): void {
    this.recaptchaResponse = grecaptcha.getResponse();
    if (!this.recaptchaResponse) {
      // this.toastr.warning('You are not human', { nzDuration: 3000 }); // Show an error message to the user
      this.showRecaptcha = true;
      return;
    }


    this.isFormSubmit = true;
    if (this.form.invalid) {
      return;
    }

    this.isFormSubmit = false;
    this.form.value['username'] = this.form.value.email;
    this.form.value['domain'] = window.location.host.split(':')[0],
      this.form.value['responsekey'] = this.recaptchaResponse;

    this.showLoader = true;

    const { jsonData, newGuid } = this.socketService.authMetaInfo('3014', '', '');
    const Update = { ['forgot']: this.form.value, metaInfo: jsonData };
    this.socketService.AuthRequest(Update);
   
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata
          this.showLoader = false;
          if (res.isSuccess) {
            grecaptcha.reset(); // Reset reCAPTCHA

            this.commonService.showSuccess(res.message, {
              nzDuration: 2000,
            });
            this.showLoader = false;
          } else {
            grecaptcha.reset(); // Reset reCAPTCHA
            this.commonService.showError(res.message, {
              nzPauseOnHover: true,
            });
          }
        }
        this.showLoader = false
      },
      error: (err) => {
        this.showLoader = false;
      },
    });


    // const { jsonData, newGuid } = this.socketService.authMetaInfo('forgot', '', '');
    // const Update = { metaInfo: this.form.value };
    // this.socketService.AuthRequest(Update);
    // this.socketService.OnResponseMessage().subscribe({
    //   next: (response: any) => {
    //     this.showLoader = false;
    //     if (response.isSuccess) {
    //       grecaptcha.reset(); // Reset reCAPTCHA

    //       this.commonService.showSuccess(response.message, {
    //         nzDuration: 2000,
    //       });
    //       this.showLoader = false;
    //     } else {
    //       grecaptcha.reset(); // Reset reCAPTCHA

    //       this.commonService.showError(response.message, {
    //         nzPauseOnHover: true,
    //       });
    //     }

    //   },
    //   (error) => {
    //   this.showLoader = false;
    //   grecaptcha.reset(); // Reset reCAPTCHA

    //   this.commonService.showError('Forgot Failed: Something went wrong.', {
    //     nzPauseOnHover: true,
    //   });
    //   this.showLoader = false;
    // }
    // );
  }
  loadScript() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
}
