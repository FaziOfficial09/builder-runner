import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { JwtService } from 'src/app/shared/jwt.service';

@Component({
  selector: 'st-mains',
  templateUrl: './mains.component.html',
  styleUrls: ['./mains.component.scss']
})
export class MainsComponent implements OnInit {
  @Input() item: any;
  @Input() formlyModel: any;
  @Input() isLast: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  @Input() passingData: any;
  @Output() notify: EventEmitter<any> = new EventEmitter();
  menu: boolean = false;
  serverPath = environment.nestImageUrl;
  array = [1, 2, 3, 4];
  effect = 'scrollx';
  @Input() isDrawer: boolean = false;
  constructor(private nzImageService: NzImageService, public dataSharedService: DataSharedService, private router: Router,
    private socketService: SocketService, private toastr: NzMessageService, private location: Location, private jwtService: JwtService) { }

  ngOnInit(): void {
    if (this.passingData) {
      if (this.passingData.isTable) {
        const newData = { ...this.item }
        const property = this.dataSharedService.typeMap[this.item.type];
        newData[property] = this.passingData?.tableValues[this.item.id];
        this.item = { ...newData }
      }
    }
  }
  imagePreview(data: any) {
    const images = [
      {
        src: data.image ? data.image : data.source,
        width: data.imageWidth + 'px',
        height: data.imagHieght + 'px',
        alt: data.alt,
      }
    ];
    this.nzImageService.preview(images, { nzZoom: data.zoom, nzRotate: data.rotate, nzKeyboard: data.keyboardKey, nzZIndex: data.zIndex });
  }


  
  

  menuCollapsed() {
    this.dataSharedService.collapseMenu.next(true)
  }
  defaultPageRoute() {
    this.router.navigate(['/pages/' + this.dataSharedService.applicationDefaultScreen]);
  }
  accordingList(event: any) {
    this.notify.emit(event);
  }
  patchValue(data: any) {

    if (data?.dataObj) {
      let makeModel: any = JSON.parse(JSON.stringify(this.formlyModel));
      if (this.formlyModel) {
        this.form.value = {};
        for (const key in this.formlyModel) {
          if (typeof this.formlyModel[key] === 'object') {
            for (const key1 in this.formlyModel[key]) {
              if (data?.dataObj[key1]) {
                makeModel[key][key1] = data?.dataObj[key1]
              }
            }
            makeModel[key]['id'] = data?.dataObj['id'];
          }
          else {
            if (data?.dataObj[key.split('.')[1]]) {
              makeModel[key] = data?.dataObj[key.split('.')[1]];
              // if (this.form.value) {
              //   if(this.form.value[key.split('.')[0]]){
              //     this.form.value[key.split('.')[0]][key.split('.')[1]] = data?.dataObj[key.split('.')[1]];
              //   }
              //   else{
              //     this.form.value[key.split('.')[0]] = {};
              //     this.form.value[key.split('.')[0]][key.split('.')[1]] = data?.dataObj[key.split('.')[1]];
              //   }
              // }
            }
          }
        }
      }
      this.formlyModel = makeModel;
      this.form.patchValue(this.formlyModel);
    }
  }
  routeLink(data: any) {
    if (data.redirect) {
      switch (data.redirect) {
        case 'policy':
          const { jsonData, newGuid } = this.socketService.makeJsonDataById('policy', data.link, '2002');
          this.socketService.Request(jsonData);
          this.socketService.OnResponseMessage().subscribe({
            next: (res) => {
              if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
                res = res.parseddata.apidata;
                if (res.isSuccess) {
                  this.changePolicy(res.data[0], data)
                }
              }
            }, error: (error) => {
              this.toastr.error(JSON.stringify(error), { nzDuration: 3000 });
            }
          });
          break;
      }
    }
  }
  changePolicy(policy: any, data: any) {
    let user = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    user['policy']['policyId'] = policy?.id;
    user['policy']['policyName'] = policy?.name;
    this.dataSharedService.ecryptedValue('user', JSON.stringify(user), true);
    let obj = {
      policyId: policy?.id,
      userId: user.policy?.userid,
      defaultPolicy: true,
      appid: this.dataSharedService.decryptedValue('appid'),
    }
    this.dataSharedService.pagesLoader.next(true);
    const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(policy.id);
    var ResponseGuid: any = newUGuid;
    const Update = { [`policyswicth`]: obj, metaInfo: metainfoupdate };
    this.socketService.Request(Update)
    this.socketService.OnResponseMessage().subscribe((res: any) => {
      if (res.parseddata.requestId == ResponseGuid && res.parseddata.isSuccess) {
        res = res.parseddata.apidata;
        this.dataSharedService.pagesLoader.next(false);

        if (res.isSuccess) {
          this.router.navigate(['/']).then(() => {
            // Reload the entire application to re-render all components
            if (res.data.length > 0) {
              if (res.data[0]?.token) {
                window.localStorage['authToken'] = JSON.stringify(res.data[0]?.token);
                this.jwtService.saveToken(res.data[0]?.token);
              }
            }
            if (data?.policySwicthPageLink) {
              this.router.navigate(['/pages/' + data?.policySwicthPageLink]).then(() => {
                // Reload the entire application to re-render all components
                this.location.replaceState('/pages/' + data?.policySwicthPageLink);
                window.location.reload();
              });
            } else {
              this.location.replaceState('/');
              window.location.reload();
            }
          });
        } else {
          this.toastr.error(res.message, { nzDuration: 3000 });
        }
      }
    });
  }
}
