import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, EventType, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonService } from 'src/common/common-services/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, AuthenticationResult, InteractionStatus, PopupRequest, InteractionType, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  passwordType: string = "password";
  passwordIcon: string = "fa-light fa-eye-slash text-lg";
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();  // ngAfterViewInit() {
  dataSource: { id: number; claim: string; value: any; }[];

  displayedColumns: string[] = ['claim', 'value'];
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
  ngOnDestroy() {

  }


  recaptchaResponse = '';
  ngOnInit(): void {


    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType.toString() === EventTypeMsal.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: any) => {
        var arr = result;
        if (arr != null && arr != undefined) {
          var oid = result.payload.idTokenClaims.oid
          var name = result.payload.idTokenClaims.name
          var preferred_username = result.payload.idTokenClaims.preferred_username
        }
        let obj = {
          'name': name,
          'oid': oid,
          'preferred_username': preferred_username
        }


        // this.authService.addNestCommonAPI('userAd/userAdSave', obj).subscribe({
        //   next: (res: any) => {
        //     if (res.isSuccess) {

        //     } else {
        //       // this.toastr.error(clone: ${res.message}, { nzDuration: 3000 });
        //     }
        //   },
        //   error: (err) => {
        //     // this.toastr.error(clone saved, some unhandled exception, { nzDuration: 3000 });
        //   }
        // });
        const payload = result.payload as AuthenticationResult;
        this.authService2.instance.setActiveAccount(payload.account);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
        this.getClaims(this.authService2.instance.getActiveAccount()?.idTokenClaims)
        console.log(this.authService2.instance.getActiveAccount())

      });

    this.isIframe = window !== window.parent && !window.opener;

    /**
     * You can subscribe to MSAL events as shown below. For more info,
     * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/events.md
     */
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });

    this.loadScript();
    // grecaptcha.render('recaptcha', { sitekey: environment.recaptcha.siteKey });
    // init Form
    this.create();
    this.getApplicationData();
    this.cdr.detectChanges();
  }

  showLoader: boolean = false;
  constructor(
    private socketService: SocketService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: DataSharedService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private toastr: NzMessageService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService2: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {

  }
  showRecaptcha: boolean = false;
  isFormSubmit: boolean = false;
  form: FormGroup;
  applications: any;
  // form
  create() {
    this.form = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      remember: [true],
      recaptch: [false]
    });
  }

  get f() {
    return this.form.controls;
  }

  submitForm(): void {
    debugger
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

    // console.log('submit', this.form.value);
    this.form.value['username'] = this.form.value.email;
    this.form.value['domain'] = this.sharedService.checkDomain(window.location.host),
      this.form.value['responsekey'] = this.recaptchaResponse;
    let obj = this.form.value;
    obj['applicationId'] = this.applications?.application?.id;
    // Show Loader
    this.showLoader = true;
    const tableValue = 'AuthLogin';
    const { jsonData, newGuid } = this.socketService.authMetaInfo('2009', '', '');
    const Update = { [tableValue]: this.form.value, metaInfo: jsonData };
    this.socketService.AuthRequest(Update);
    this.socketService.OnResponseMessage().subscribe(
      (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          this.showLoader = false;
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            if (res.data?.access_token) {
              grecaptcha.reset(); // Reset reCAPTCHA

              this.commonService.showSuccess('Login Successfully!', {
                nzDuration: 2000,
              });
              localStorage.setItem('isLoggedIn', 'true');
              let external: any = {
                login: false,
                submit: false,
                link: '',
              }
              this.sharedService.ecryptedValue('externalLogin', JSON.stringify(external), true);
              this.showLoader = false;
              this.authService.setAuth(res.data);
              this.socketService.setSocket();
              this.router.navigate(['/home/allorder']);
              this.router.navigate(['/']);
            } else {
              this.commonService.showError('Something went wrong!');
              grecaptcha.reset(); // Reset reCAPTCHA

            }
          } else {
            grecaptcha.reset(); // Reset reCAPTCHA

            this.commonService.showError(res.message, {
              nzPauseOnHover: true,
            });
          }
        }
      },
      (error) => {
        this.showLoader = false;
        grecaptcha.reset(); // Reset reCAPTCHA

        this.commonService.showError('Login Failed: Something went wrong.', {
          nzPauseOnHover: true,
        });
        this.showLoader = false;
      }
    );
  }
  showPassword() {
    this.passwordType = this.passwordType == 'password' ? 'string' : 'password';
    this.passwordIcon = this.passwordIcon == 'fa-light fa-eye-slash text-lg' ? 'fa-light fa-eye text-lg' : 'fa-light fa-eye-slash text-lg'
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
  getApplicationData() {
    this.showLoader = true;
    const hostUrl = this.sharedService.checkDomain(window.location.host);

    const { jsonData, newGuid } = this.socketService.authMetaInfo('2017', '', hostUrl);
    const GetDomain = { metaInfo: jsonData };
    this.socketService.AuthRequest(GetDomain)
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          if (res.isSuccess) {
            this.applications = res.data;
          }
          else {
            this.toastr.error(res.message, { nzDuration: 3000 }); // Show an error message to the user
          }
        }
        this.showLoader = false
      },
      error: (err) => {
        this.showLoader = false;
        this.toastr.error('some error exception', { nzDuration: 2000 });
      },
    });
  }


  //=======
  getClaims(claims: any) {
    this.dataSource = [
      { id: 1, claim: "Display Name", value: claims ? claims['name'] : null },
      { id: 2, claim: "User Principal Name (UPN)", value: claims ? claims['preferred_username'] : null },
      { id: 2, claim: "OID", value: claims ? claims['oid'] : null }
    ];
    var email = this.dataSource.filter((person) => person.claim === 'User Principal Name (UPN)');
    var username = this.dataSource.filter((person) => person.claim === 'Display Name');
    var oid = this.dataSource.filter((person) => person.claim === 'OID');
    if (email[0]?.value != null) {
      console.log("claimscall and submit")
      this.registeruser(email[0].value, oid[0].value, username[0].value);
    }
  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService2.instance.getActiveAccount();

    if (!activeAccount && this.authService2.instance.getAllAccounts().length > 0) {
      let accounts = this.authService2.instance.getAllAccounts();
      this.authService2.instance.setActiveAccount(accounts[0]);
    }
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService2.instance.getAllAccounts().length > 0;
  }

  login() {

    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService2.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService2.instance.setActiveAccount(response.account);
          });
      } else {
        this.authService2.loginPopup()
          .subscribe((response: AuthenticationResult) => {
            this.authService2.instance.setActiveAccount(response.account);
          });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.authService2.loginRedirect({ ...this.msalGuardConfig.authRequest } as RedirectRequest);
      } else {
        this.authService2.loginRedirect();
      }
    }
  }

  logout() {
    this.authService2.logout();
  }


  registeruser(email: any, Id: any, username: any): void {
    // this.isFormSubmit = true;
    // if (this.form.invalid) {
    //   this.toastr.warning('Fill all fields', { nzDuration: 3000 }); // Show an error message to the user
    //   return;
    // }
    // if ( this.cascaderValue.length < 3) {
    //   this.toastr.warning('Application required', { nzDuration: 3000 }); // Show an error message to the user
    //   return;
    // }
    // this.recaptchaResponse = grecaptcha.getResponse();
    //   if (!this.recaptchaResponse) {
    //     // this.toastr.warning('You are not human', { nzDuration: 3000 }); // Show an error message to the user
    //     this.showRecaptcha = true;
    //     return;
    //   }

    this.showLoader = true;
    let obj = {
      "username": email,
      "email": email,
      "firstName": username,
      "lastName": username,
      "companyName": "",
      "password": "",
      "id": Id,
      "accreditationNumber": "",
      "organizationId": this.applications?.department?.organizationId,
      "applicationId": this.applications?.application?._id,
      "status": 'Pending',
      "domain": this.sharedService.checkDomain(window.location.host),
      "contactnumber": "",
      "responsekey": "",
    }
    // if (!this.form.value?.remember && !this.userAddDrawer) {
    //   grecaptcha.reset();

    //   this.toastr.warning("Please accept the term and conditions", { nzDuration: 2000 });
    //   return;
    // }
    // if (this.form.valid) {
    // this.saveLoader = true;
    // this.authService.registerUserExternal(obj).subscribe({
    //   next: (response: any) => {
    //     // if (res.isSuccess && res?.data) {
    //     //   this.toastr.warning("You cannot login, Approval is Pending")
    //     //   this.toastr.success(res.message, { nzDuration: 2000 });
    //     //   this.create();
    //     //   // if (this.userAddDrawer) {
    //     //   //   this.drawerRef.close(true);
    //     //   // }else{
    //     //   //   this.router.navigateByUrl('/auth/login')
    //     //   // }
    //     // } else {
    //     //   grecaptcha.reset();
    //     //   this.toastr.error(res.message, { nzDuration: 2000 });
    //     //   if(res.message==="Email already exists. Please use another and status is Approved"){
    //     //     this.submitFormExternalLogin(email,Id);
    //     //   }
    //     // }

    //     console.log(response)

    //     if (response.isSuccess) {
    //       if (response.data[0]?.status === "Approved") {
    //         // grecaptcha.reset(); // Reset reCAPTCHA

    //         this.commonService.showSuccess('Login Successfully!', {
    //           nzDuration: 2000,
    //         });
    //         localStorage.setItem('isLoggedIn', 'true');
    //         this.showLoader = false;
    //         this.authService.setAuth(response.data);
    //         this.router.navigate(['/home/allorder']);
    //         this.router.navigate(['/']);
    //       }
    //       else {
    //         if (response.data[0]?.status == "Pending") {
    //           this.commonService.showError("Approval is Pending");
    //         }
    //         else {
    //           this.commonService.showError(response.data?.message);
    //         }
    //         // grecaptcha.reset(); // Reset reCAPTCHA

    //       }
    //     }
    //     else {
    //       // grecaptcha.reset(); // Reset reCAPTCHA

    //       this.commonService.showError(response.message, {
    //         nzPauseOnHover: true,
    //       });
    //     }
    //     this.showLoader = false;

    //     // this.saveLoader = false;
    //   },
    //   error: (err) => {
    //     this.showLoader = false;

    //     grecaptcha.reset();

    //     this.create();
    //     // this.saveLoader = false;
    //     this.toastr.error('some error exception', { nzDuration: 2000 });
    //   },
    // });
    // this.isFormSubmit = false;
    // }

  }
}

export declare const enum EventTypeMsal {

  LOGIN_START = "msal:loginStart",
  LOGIN_SUCCESS = "msal:loginSuccess",
  LOGIN_FAILURE = "msal:loginFailure",
  ACQUIRE_TOKEN_START = "msal:acquireTokenStart",
  ACQUIRE_TOKEN_SUCCESS = "msal:acquireTokenSuccess",
  ACQUIRE_TOKEN_FAILURE = "msal:acquireTokenFailure",
  ACQUIRE_TOKEN_NETWORK_START = "msal:acquireTokenFromNetworkStart",
  SSO_SILENT_START = "msal:ssoSilentStart",
  SSO_SILENT_SUCCESS = "msal:ssoSilentSuccess",
  SSO_SILENT_FAILURE = "msal:ssoSilentFailure",
  HANDLE_REDIRECT_START = "msal:handleRedirectStart",
  HANDLE_REDIRECT_END = "msal:handleRedirectEnd",
  POPUP_OPENED = "msal:popupOpened",
  LOGOUT_START = "msal:logoutStart",
  LOGOUT_SUCCESS = "msal:logoutSuccess",
  LOGOUT_FAILURE = "msal:logoutFailure",
  LOGOUT_END = "msal:logoutEnd"
}