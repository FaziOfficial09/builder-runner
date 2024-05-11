import { Component, Input, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-popconfirm',
  templateUrl: './popconfirm.component.html',
  styleUrls: ['./popconfirm.component.scss']
})
export class PopconfirmComponent implements OnInit {
  @Input() popConfirmData : any;
  constructor(private nzMessageService: NzMessageService) { }

  ngOnInit(): void {
  }
  cancel(): void {
    this.nzMessageService.info('click cancel');
  }

  confirm(): void {
    this.nzMessageService.info('click confirm');
  }
}
