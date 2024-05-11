import { Injectable } from '@angular/core';
import { AES,enc }from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class SharedUserService {
  private _user!: any;
  constructor() {
  }
  encryptSecretKey = "@12356489231SFSJDFPOSFSDF5464954$%#%DZGDSDFDSF"; //adding secret key
  getUser() {
    if (!this._user) {

    }
    return this._user;
  }
  encryptValue(property: any, value: any, stringify: any) {
    var result = AES.encrypt(value, this.encryptSecretKey).toString();
    window.localStorage[property] = stringify ? JSON.stringify(result) : value;
  }
  decryptValue(property: any , parse: any) {
    const getToken = parse ? JSON.parse(window.localStorage[property]) : window.localStorage[property];
    var result = AES.decrypt(getToken, this.encryptSecretKey).toString(enc.Utf8);
    return result;
  }
}
