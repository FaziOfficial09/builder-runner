import { Component, OnInit , Input} from '@angular/core';

@Component({
  selector: 'st-html-block',
  templateUrl: './html-block.component.html',
  styleUrls: ['./html-block.component.scss']
})
export class HtmlBlockComponent implements OnInit {
  @Input() htmlBlockData: any;
  constructor() { }

  ngOnInit(): void {
    
    this.htmlBlockData;
  }

}
