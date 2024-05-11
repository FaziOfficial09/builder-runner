// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  defaultauth: 'fake-backend',
  serverApiUrl:"http://localhost:3000/",
  serverBaseUrl:"http://3.111.85.6:3000/",
  // nestBaseUrl:"https://spectrum.expocitydubai.com:9443/",
  nestBaseUrl:"http://localhost:4600/",
  nestNewBaseUrl:"http://localhost:4600/",
  nestImageUrl:"http://campaigns.expocitydubai.com.s3-website.me-south-1.amazonaws.com/",
  dbMode:'dev_',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  }
};

// ng serve --host=0.0.0.0 --disable-host-check

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
