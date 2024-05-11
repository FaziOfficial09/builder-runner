import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-anchor',
  templateUrl: './anchor.component.html',
  styleUrls: ['./anchor.component.scss']
})
export class AnchorComponent implements OnInit {
  @Input() anchorData : any;
  constructor() { }

  ngOnInit(): void {
  }
  common(data : any){
    console.log(data)
  }
}
