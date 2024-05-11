import { Component, Input, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'st-builder-toater',
  templateUrl: './builder-toater.component.html',
  styleUrls: ['./builder-toater.component.scss']
})
export class BuilderToaterComponent implements OnInit {
  @Input() toastrData: any;
  constructor(private notification: NzNotificationService) { }

  ngOnInit(): void {

    this.showNotification(this.toastrData);
  }
  showNotification(data : any): void {
    this.notification.create(
      data.toastrType, // Notification type
      data.toasterTitle, // Title
      data.description, // Description
      {
        nzDuration: data.duration,
        nzPlacement: data.placement,
        nzCloseIcon: data.closeIcon,
        nzPauseOnHover : data.pauseOnHover,
        nzAnimate : data.animate,
      } // Additional options
    );
  }

}
