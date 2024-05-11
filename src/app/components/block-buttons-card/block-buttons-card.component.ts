import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'src/app/models/treeNode';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-block-buttons-card',
  templateUrl: './block-buttons-card.component.html',
  styleUrls: ['./block-buttons-card.component.scss']
})
export class BlockButtonsCardComponent {
  bgColor: any;
  hoverTextColor: any;
  @Input() softIconList: any;
  @Input() GridRuleColor: any;
  @Input() tableDisplayData: any;
  @Input() drawOpen: any;
  @Input() tableIndex: any;
  @Input() screenId: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() title: any;
  @Input() tableRowId: any;
  @Input() mappingId: any;
  dataSrc: any;
  isShow: Boolean = false;
  nodes: TreeNode[];
  size: NzButtonSize = 'large';
  color: "hover:bg-[#000000]";
  borderColor: any;
  @Output() tableEmit: EventEmitter<any> = new EventEmitter<any>();
  constructor(private socketService: SocketService,  private toasterService: ToasterService,  private router: Router,
    public dataSharedService: DataSharedService
  ) { }
  ngOnInit(): void {
    this.hoverTextColor = this.softIconList?.color;
    this.bgColor = this.softIconList?.color;
    this.borderColor = this.softIconList?.textColor;
  }


  isVisible = false;



  pagesRoute(href: string, routeType: any): void {
    let url = window.location.origin;
    if (href) {
      if (routeType == 'modal') {
        let externalLogin = this.dataSharedService.decryptedValue('externalLogin') ? JSON.parse(this.dataSharedService.decryptedValue('externalLogin')).login : false;
        if (externalLogin == false) {
          const { jsonData, newGuid } = this.socketService.makeJsonDataById('CheckUserScreen', href, '2006');
          this.dataSharedService.saveDebugLog('CheckUserScreen',newGuid)
          this.socketService.Request(jsonData);
          this.socketService.OnResponseMessage().subscribe(((res: any) => {
            if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
              res = res.parseddata.apidata;
              if (res.length > 0) {
                this.nodes = res[0].menuData;
                this.isVisible = true;
              }
            }

          }));
        }

      } else if (routeType == '_blank') {
        let link = '/pages/' + href;
        window.open(link)
      } else if (routeType == '') {
        let link = '/pages/' + href;
        this.router.navigate([link]);
      }
    } else {
      this.toasterService.checkToaster(this.softIconList, 'error');
    }

  }
  change(value: boolean): void {
    console.log(value);
  }
  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }
  isHover: boolean = false;
  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }
  changeColor(bgColor: any, hoverColor: any) {

    bgColor = hoverColor;
  }
  gridEmit(data: any) {
    this.tableEmit.emit(data);
  }

}
