import { Component, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { SocketService } from 'src/app/services/socket.service';


@Component({
  selector: 'st-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Input() userAddDrawer: boolean = false;
  private drawerRef: NzDrawerRef<any>;
  passwordType: string = "password";
  confirmpasswordType: string = "password";
  passwordIcon: string = "fa-light fa-eye-slash text-lg";
  confirmpasswordIcon: string = "fa-light fa-eye-slash text-lg";

  applications: any;
  loader: boolean = false;
  form: FormGroup;
  showRecaptcha: boolean = false;
  recaptchaResponse = '';
  isFormSubmit: boolean = false;
  saveLoader: boolean = false;
  constructor(private authService: AuthService, private router: Router,
    private socketService: SocketService,
    private toastr: NzMessageService, private formBuilder: FormBuilder, @Optional() drawerRef: NzDrawerRef<any>) {
    this.drawerRef = drawerRef;
  }

  ngOnInit(): void {
    this.loadScript();
    this.create();
    this.getApplicationData();
  }
  get f() {
    return this.form.controls;
  }
  create() {
    this.form = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      firstname: [null, [Validators.required]],
      lastname: [null, [Validators.required]],
      // contactnumber: [null, [Validators.required, Validators.pattern(/^92\d{10}$/)]],
      contactnumber: [null, [Validators.required]],
      companyname: [null, [Validators.required]],
      accreditationNumber: [null],
      confirmpassword: [null, [Validators.required]],
      password: [null, [Validators.required]],
      application: [null], // Use the custom validator here
      remember: [false, [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmpassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmpassword')?.setErrors({ passwordMatch: true });
    } else {
      formGroup.get('confirmpassword')?.setErrors(null);
    }
  }

  getApplicationData() {
    this.loader = true;
    const hostUrl = window.location.host.split(':')[0];
    const { jsonData, newGuid } = this.socketService.authMetaInfo('2016', '', hostUrl);
    const GetDomain = { metaInfo: jsonData };
    this.socketService.AuthRequest(GetDomain)
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.applications = res.data?.[0];
          }
          else {
            this.toastr.error(res.message, { nzDuration: 3000 }); // Show an error message to the user
          }
          this.loader = false
        }
      },
      error: (err) => {
        this.loader = false;
        this.toastr.error('some error exception', { nzDuration: 2000 });
      },
    });
  }

  // ngAfterViewInit() {
  //   // Render reCAPTCHA using the reCAPTCHA site key
  //   grecaptcha.render('recaptcha', {
  //     sitekey: environment.recaptcha.siteKey,
  //     callback: (response) => {
  //       // Handle the reCAPTCHA response token (e.g., send it to your server)
  //       console.log('reCAPTCHA response token:', response);
  //     }
  //   });
  // }
  submitForm(): void {
    this.isFormSubmit = true;
    // if (this.form.invalid) {
    //   this.toastr.warning('Fill all fields', { nzDuration: 3000 }); // Show an error message to the user
    //   return;
    // }
    // if ( this.cascaderValue.length < 3) {
    //   this.toastr.warning('Application required', { nzDuration: 3000 }); // Show an error message to the user
    //   return;
    // }
    this.recaptchaResponse = grecaptcha.getResponse();
    if (!this.recaptchaResponse) {
      // this.toastr.warning('You are not human', { nzDuration: 3000 }); // Show an error message to the user
      this.showRecaptcha = true;
      return;
    }

    this.loader = true;
    let obj = {
      "username": this.form.value.email,
      "email": this.form.value.email,
      "firstName": this.form.value.firstname,
      "lastName": this.form.value.lastname,
      "companyName": this.form.value.companyname,
      "password": this.form.value.password,
      "accreditationNumber": this.form.value.accreditationNumber,
      "organizationId": this.applications?.organizationid,
      "applicationId": this.applications?.id,
      // "organizationId": '74f47893-bb58-43b1-97f2-46d05ec50404',
      // "applicationId": '3ee3ad6b-c0c0-4b37-8947-0f441753586c',
      "status": 'Pending',
      "domain": window.location.host.split(':')[0],
      "contactnumber": this.form.value.contactnumber,
      "responsekey": this.recaptchaResponse,
    }
    console.log(obj);
    if (!this.form.value?.remember && !this.userAddDrawer) {
      grecaptcha.reset();

      this.toastr.warning("Please accept the term and conditions", { nzDuration: 2000 });
      return;
    }
    if (this.form.valid) {
      // this.saveLoader = true;
      const tableValue = 'AuthRegister';
      const { jsonData, newGuid } = this.socketService.authMetaInfo('3010', '', '');
      const Update = { [tableValue]: obj, metaInfo: jsonData };
      this.socketService.AuthRequest(Update);
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            if (res.isSuccess && res?.data) {
              this.toastr.success(res.message, { nzDuration: 2000 });
              this.create();
              if (this.userAddDrawer) {
                this.drawerRef.close(true);
              } else {
                this.router.navigateByUrl('/auth/login')
              }
            } else {
              grecaptcha.reset();
              this.toastr.error(res.message, { nzDuration: 2000 });
            }
            this.saveLoader = false;
          }

        },
        error: (err) => {
          grecaptcha.reset();

          this.create();
          this.saveLoader = false;
          this.toastr.error('some error exception', { nzDuration: 2000 });
        },
      });
      this.isFormSubmit = false;
    }

  }

  showPassword() {
    this.passwordType = this.passwordType == 'password' ? 'string' : 'password';
    this.passwordIcon = this.passwordIcon == 'fa-light fa-eye-slash text-lg' ? 'fa-light fa-eye text-lg' : 'fa-light fa-eye-slash text-lg'
  }
  showConfirmPassword() {
    this.confirmpasswordType = this.confirmpasswordType == 'password' ? 'string' : 'password';
    this.confirmpasswordIcon = this.confirmpasswordIcon == 'fa-light fa-eye-slash text-lg' ? 'fa-light fa-eye text-lg' : 'fa-light fa-eye-slash text-lg'
  }
  reloadPage() {
    location.reload();
  }
  loadScript() {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

}
