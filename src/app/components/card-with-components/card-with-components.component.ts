import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { Location } from '@angular/common';
import { SocketService } from 'src/app/services/socket.service';
import { JwtService } from 'src/app/shared/jwt.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-card-with-components',
  templateUrl: './card-with-components.component.html',
  styleUrls: ['./card-with-components.component.scss']
})
export class CardWithComponentsComponent implements OnInit {
  @Input() item: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() mappingId: any;
  @Input() screenId: any;

  constructor(private router: Router, private socketService: SocketService, public dataSharedService: DataSharedService,
    private location: Location,  private toasterService: ToasterService, private jwtService: JwtService) { }

  ngOnInit(): void {
  }
  routeLink(data: any) {
    switch (data.redirect) {
      case 'link':
        this.linkExecute(data.link);
        break;
      case 'policy':
        const { jsonData, newGuid } = this.socketService.makeJsonDataById('policy', data.link, '2002');
        this.dataSharedService.saveDebugLog('policy',newGuid)
        this.socketService.Request(jsonData);
        this.socketService.OnResponseMessage().subscribe({
          next: (res) => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              if (res.isSuccess) {
                this.changePolicy(res.data[0])
              }
            }
          }, error: (error) => {
            this.toasterService.checkToaster(this.item, 'error');
          }
        });
        break;
      default:
        this.linkExecute(data.link);
        break;
    }
  }


  linkExecute(link: any) {
    if (link) {

      let url = window.location.href;

      // Extract the port number using a regular expression
      const portMatch = url.match(/\.com:(\d+)\//);

      if (portMatch && portMatch[1]) {
        const portNumber = portMatch[1];
        window.open(`//${link}:${portNumber}`, '_blank');
      } else {
        window.open(`//${link}`, '_blank');
      }


    }
  }
  changePolicy(policy: any) {
    let user = this.dataSharedService.decryptedValue('user') ? JSON.parse(this.dataSharedService.decryptedValue('user')) : null;
    user['policy']['policyId'] = policy?.id;
    user['policy']['policyName'] = policy?.name;
    this.dataSharedService.ecryptedValue('user', JSON.stringify(user), true);
    let obj = {
      policyId: policy?.id,
      userId: user.policy?.userid,
      defaultPolicy: true,
      applicationId: this.dataSharedService.decryptedValue('applicationId'),
    }
    this.dataSharedService.pagesLoader.next(true);
    const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(policy.id);
    var ResponseGuid: any = newUGuid;
    const Update = { [`policyswicth`]: obj, metaInfo: metainfoupdate };
    this.dataSharedService.saveDebugLog('policyswicth',newUGuid)
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
            this.location.replaceState('/');
            window.location.reload();
          });
        } else {
          this.toasterService.checkToaster(this.item, 'error');
        }
      }
    });
  }
}
