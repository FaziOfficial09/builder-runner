import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { Socket } from 'ngx-socket-io';  
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Guid } from '../models/guid';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
// @Injectable()
export class SocketService {
  private socket: Socket;
  constructor(private router: Router) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.setSocket();
    } else {
      this.authSocket();
    }
  }
  private getFromLocalStorage(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  // emit event
  Request(data: any) {
    console.log(this.getDate('Request', data.metaInfo.RequestId))
    this.socket.emit('RequestMessage', data);
  }
  authSocket() {
    const socketOptions = {
      extraHeaders: {},
    };
    this.socket = io(environment.websocketUrl, socketOptions)
  }
  setSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
    // const applicationId = this.getFromLocalStorage('applicationId');
    // const organizationId = this.getFromLocalStorage('organizationId');
    // const user = this.getFromLocalStorage('user')?.username;
    // const id = this.getFromLocalStorage('user')?.userId;
    // const policyId = this.getFromLocalStorage('user')?.policy?.policyid;
    const token = this.getFromLocalStorage('authToken');

    const socketOptions = {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
        // OrganizationId: organizationId,
        // ApplicationId: applicationId,
        // userId: id,
        // user: user,
        // policyid: policyId,
      },
    };
    this.socket = io(environment.websocketUrl, socketOptions)
  }
  setSocketExternal(token: any) {
    if (this.socket) {
      this.socket.disconnect();
    }
    const socketOptions = {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    };
    this.socket = io(environment.websocketUrl, socketOptions)
  }
  AuthRequest(data: any) {
    console.log(this.getDate('AuthRequest', data.metaInfo.RequestId))
    this.socket.emit('AuthMessage', data);
  }

  //   public OnResponseMessage = () => {
  //     return Observable.create((observer: { next: (arg0: any) => void; }) => {
  //         this.socket.on('ResponseMessage', (message) => {
  //           console.log(this.getDate('Response',message.data.parseddata.RequestId))
  //             observer.next(message.data.parseddata);
  //         });
  //     });
  // }
  // Example method to listen for a specific event
  OnResponseMessage(): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on('ResponseMessage', (message: any) => {
        console.log(this.getDate('Response', message))
        if (message.status === '401') {
          this.router.navigate(['/auth/login'])
        } else {
          subscriber.next(message);
        }
      });
    });
  }
  private getDate(type: string, data: any) {
    const date = new Date();
    const formattedDate = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    return `${type} ${data} ${formattedDate}:${date.getMilliseconds()}`;
  }
  makeJsonfileData(tag: string, imagedata: string,id?:string) {
    const newGuid = Guid.new16DigitGuid();
    const metainfo = {
      actioncode: tag,
      RequestId: newGuid,
      id:id
    }
    return { jsonData: { imagedata, metaInfo: metainfo }, newGuid }

  }
  public async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error('Error reading file as ArrayBuffer'));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  makeJsonData(modelType: string, tag: string, screenId?: any, type?: any) {
    const newGuid = Guid.new16DigitGuid();
    const metainfo = {
      actioncode: tag,
      RequestId: newGuid,
      screenId: screenId,
      type: type
    }
    return { jsonData: { modelType: modelType, metaInfo: metainfo }, newGuid }
  }
  makeJsonDataGeneric(modelType: string, tag: string, Jsondata: any) {
    const newGuid = Guid.new16DigitGuid();
    const metainfo = {
      actioncode: tag,
      RequestId: newGuid,
      json: Jsondata
    }
    return { jsonData: { modelType: modelType, metaInfo: metainfo }, newGuid }
  }
  makeJsonDataExternal(tag: string,) {
    const newGuid = Guid.new16DigitGuid();
    const metainfocreate = {
      actioncode: tag,
      RequestId: newGuid
    }
    return { newGuid, metainfocreate };
  }
  makeJsonDatatable(modelType: string, tag: string, data: string) {
    const newGuid = Guid.new16DigitGuid();

    const metainfo = {
      actioncode: tag,
      RequestId: newGuid
    }
    return { jsonData: { tabledata: data, modelType: modelType, metaInfo: metainfo }, newGuid }

  }
  makeJsonDataById(modelType: string, id: any, tag: string, screenId?: any, type?: any,updatedversiondate?:any) {
    const newGuid = Guid.new16DigitGuid();
    const metainfo = {
      actioncode: tag,
      RequestId: newGuid,
      id: id,
      screenId: screenId,
      type: type,
      updateddate:updatedversiondate
    }
    return { jsonData: { modelType: modelType, metaInfo: metainfo }, newGuid }
  }
  deleteModelType(modelType: string, id: any,commit?:boolean) {
    const newGuid = Guid.new16DigitGuid();
    const metainfo = {
      actioncode: '5003',
      RequestId: newGuid,
      id: id,
      commit:commit
    }
    return { jsonData: { modelType: modelType, metaInfo: metainfo }, newGuid }
  }

  guidValue() {
    return Guid.new16DigitGuid();
  }
  metainfocreate() {
    const newGuid = Guid.new16DigitGuid();
    const metainfocreate = {
      actioncode: '3001',
      RequestId: newGuid
    }
    return { newGuid, metainfocreate };
  }

  metainfoDynamic(tag: any, modelType?: string, screenbuilderid?: string) {
    const newGuid = Guid.new16DigitGuid();
    const metainfocreate = {
      actioncode: tag,
      RequestId: newGuid,
      screenbuilderid: screenbuilderid,
      modelType: modelType,
    }
    return { newGuid, metainfocreate };
  }
  metainfoupdate(id: any) {
    const newUGuid = Guid.new16DigitGuid();
    const metainfoupdate = {
      actioncode: '4001',
      RequestId: newUGuid,
      id: id
    }
    return { newUGuid, metainfoupdate };
  }
  authMetaInfo(tag: string, type: string, id: string) {
    const newGuid = Guid.new16DigitGuid();
    const jsonData = {
      actioncode: tag,
      RequestId: newGuid,
      type: type,
      id: id
    }
    return { newGuid, jsonData };
  }
  metaInfoForGrid(tag: string, ruleId: any, mappingId?: any, Rulepage?: any, RulepageSize?: any, data?: any, header?: any, search?: any, filters?:any) {
    const RequestGuid = this.guidValue();
    const metainfo = {
      actioncode: tag,
      ruleId: ruleId,
      RequestId: RequestGuid,
      page: Rulepage,
      pageSize: RulepageSize,
      req: data,
      parentId: mappingId,
      header: header,
      screenId: localStorage.getItem('screenId'),
      screenBuildId: localStorage.getItem('screenBuildId'),
      search: search,
      filters: filters
    };
    return { jsonData: { metaInfo: metainfo }, RequestGuid }
  }
}