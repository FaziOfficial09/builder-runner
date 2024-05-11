import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss']
})
export class TreeSelectComponent implements OnInit {
  @Input() treeSelectData: any;
  value?: string;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.value = '1001';
    }, 1000);
  }
  onChange($event: string): void {
    console.log($event);
  }


}
