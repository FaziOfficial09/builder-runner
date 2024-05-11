import { Inject, Injectable } from '@angular/core';
import { CommonService } from '../../common/common-services/common.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  constructor(@Inject(CommonService) private commonService: CommonService) {
  }

  // The values that are defined here are the default values that can be overridden by env.js

  // Dev URL
  // public nestBaseUrl = environment.nestBaseUrl;
  // public GeneralToken = 'eyJhbGciOiJI............';

  public loginMode = '';

  // Whether or not to enable debug mode
  public enableDebug = true;

  //for version of the application
  public versionId = 1.0;

  //for ag-grid Enterprise Key
  public agGridKey = '';


  showWarning() {
    this.commonService.showWarning('You are not <b> Sign in</b> ');
  }
}
