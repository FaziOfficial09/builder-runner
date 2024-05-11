import { Component, Input, OnInit } from '@angular/core';
// import { AlertColor } from '../ui-elements/alerts/alerts.model';

@Component({
  selector: 'st-new-alerts',
  templateUrl: './new-alerts.component.html',
  styleUrls: ['./new-alerts.component.scss']
})
export class NewAlertsComponent implements OnInit {
  @Input() alertData: any;
  color: string = 'blue';
  constructor() { }

  ngOnInit(): void {
    this.alertData;
  }
  // close(alert: AlertColor, alertData: AlertColor[]) {
  //   alertData.splice(alertData.indexOf(alert), 1);
  // }
}
