import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  @Input() resulData : any;
  constructor() { }

  ngOnInit(): void {
  }

}
