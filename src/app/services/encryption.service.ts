import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }
  encryptSecretKey = "@123"; //adding secret key

  //Data Encryption Function
  encryptData(msg:any) {
    var result = CryptoJS.AES.encrypt(msg, this.encryptSecretKey).toString();
    return result;
  }
  decryptData(msg:any) {
    var result = CryptoJS.AES.decrypt(msg, this.encryptSecretKey).toString(CryptoJS.enc.Utf8);
    return result;
  }
}
