import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() messageData: any;
  constructor(private message: NzMessageService) { }

  ngOnInit(): void {

    this.messageData;
  }
  createBasicMessage(data: any): void {

    this.message.create(data.messageType, data.content, { nzDuration: data.duration, nzPauseOnHover: data.pauseOnHover, nzAnimate: data.animate });
  }
}
