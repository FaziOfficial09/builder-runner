import { Injectable } from '@angular/core';
import { AES,enc }from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  encryptSecretKey = "@12356489231SFSJDFPOSFSDF5464954$%#%DZGDSDFDSF"; //adding secret key
  getToken(): String {
    return window.localStorage['jwtToken'];
  }

  saveToken(token: String) {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    // window.localStorage.removeItem('jwtToken');
    window.localStorage.clear();
  }
  ecryptedValue(property: any, value: any, stringify: any) {
    // Encrypt the value using CryptoJS AES encryption
    var result = AES.encrypt(value, this.encryptSecretKey).toString();

    // Stringify the result if the stringify parameter is true
    const encryptedResult = stringify ? JSON.stringify(result) : result;

    // Store the encrypted value in the local storage under the specified property using setItem
    window.localStorage.setItem(property, encryptedResult);
  }


  decryptedValue(property: any, value: any, parse: any) {
    var result = AES.decrypt(value, this.encryptSecretKey).toString(enc.Utf8);

  }

}
