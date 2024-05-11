import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'st-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(private notification: NzNotificationService) { }
  @Input() notificationData: any;
  ngOnInit(): void {
  }
  createBasicNotification(template: TemplateRef<{}>): void {
    this.notification.template(template, {
      nzDuration: this.notificationData.duration,
      nzKey: this.notificationData.key,
      nzPauseOnHover: this.notificationData.pauseOnHover,
      nzAnimate: this.notificationData.animate,
      nzPlacement: this.notificationData.placement,
    });
  }
  createNotification(type: string): void {
    this.notification.create(
      type,
      this.notificationData.title,
      this.notificationData.content,
      {
        nzDuration: this.notificationData.duration,
        nzKey: this.notificationData.key,
        nzPauseOnHover: this.notificationData.pauseOnHover,
        nzAnimate: this.notificationData.animate,
        nzPlacement: this.notificationData.placement,
      }
    );
  }
}
