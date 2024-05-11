import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

export class ResetPasswordComponent implements OnInit {
  passwordType: string = "password";
  confirmpasswordType: string = "password";
  passwordIcon: string = "fa-light fa-eye-slash text-lg";
  confirmpasswordIcon: string = "fa-light fa-eye-slash text-lg";

  loader: boolean = false;
  form: FormGroup;
  showRecaptcha: boolean = false;
  recaptchaResponse = '';
  isFormSubmit: boolean = false;
  token: any;
  code: any;
  email: any;
  siteKey: any = environment.recaptcha.siteKey;
  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router,
    private toastr: NzMessageService, private formBuilder: FormBuilder, private socketService: SocketService,) {
    this.route.queryParams.subscribe(params => {
      // Access the query parameters here
      const token = params['token'];
      const code = params['code'];
      const email = params['email'];

      this.token = token;
      this.code = code;
      this.email = email;

    });
  }

  ngOnInit(): void {
    this.create();
  }
  get f() {
    return this.form.controls;
  }
  create() {
    this.form = this.formBuilder.group({
      confirmpassword: [null, [Validators.required]],
      password: [null, [Validators.required]],
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

  ngAfterViewInit() {
    // Reinitialize reCAPTCHA after the view has been initialized
    grecaptcha.render('recaptcha', { sitekey: environment.recaptcha.siteKey });
  }
  submitForm(): void {

    this.isFormSubmit = true;
    this.recaptchaResponse = grecaptcha.getResponse();
    if (!this.recaptchaResponse) {
      // this.toastr.warning('You are not human', { nzDuration: 3000 }); // Show an error message to the user
      this.showRecaptcha = true;
      return;
    }

    this.loader = true;
    let obj = {
      "username": this.email,
      "email": this.email,
      "token": this.token,
      "verificationCode": this.code,
      "password": this.form.value.password,
      "domain": window.location.host.split(':')[0]
    }
    if (this.form.valid) {
      const { jsonData, newGuid } = this.socketService.authMetaInfo('3013', '', '');
      const Update = { ['resetpassword']: obj, metaInfo: jsonData };
      this.socketService.AuthRequest(Update);
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata
            this.loader = false;
            if (res.isSuccess) {
              this.toastr.success(res.message, { nzDuration: 2000 });
              this.create();
              this.router.navigateByUrl('/auth/login')
            } else {
              this.toastr.error(res.message, { nzDuration: 2000 });
            }
          }
        },
        error: (err) => {
          this.create();
          this.loader = false;
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
}
