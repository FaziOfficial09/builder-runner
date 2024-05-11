import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-divider',
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss']
})
export class DividerComponent implements OnInit {
  @Input() dividerData :any;
  constructor() { }
  dividerPosition : any;
  ngOnInit(): void {



  }

}
