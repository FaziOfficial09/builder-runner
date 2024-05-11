import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-affix',
  templateUrl: './affix.component.html',
  styleUrls: ['./affix.component.scss']
})
export class AffixComponent implements OnInit {
  @Input() affixData: any;
  offsetTop = 10;
  nzOffsetBottom = 10;

  setOffsetTop(): void {
    this.offsetTop += 10;
  }

  setOffsetBottom(): void {
    this.nzOffsetBottom += 10;
  }

  onChange(status: boolean): void {
    console.log(status);
  }
  constructor() { }

  ngOnInit(): void {

    this.offsetTop = this.affixData.margin;
    this.nzOffsetBottom = this.affixData.margin;
  }

}
