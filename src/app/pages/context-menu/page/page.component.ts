import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'st-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {
  @Input() resData:any;
  @Input() form:any;
  constructor() { }

  ngOnInit(): void {  
  }

}
