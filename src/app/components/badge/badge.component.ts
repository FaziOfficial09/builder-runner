import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit {
  @Input() badgeData :any;
  constructor() { }

  ngOnInit(): void {

  }
  number(data: any): number{
    let temporary = data .to.number();
    return temporary
  }



}
