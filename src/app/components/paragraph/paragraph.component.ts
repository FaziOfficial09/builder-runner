import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { B } from '@fullcalendar/core/internal-common';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-paragraph',
  templateUrl: './paragraph.component.html',
  styleUrls: ['./paragraph.component.scss']
})
export class ParagraphComponent implements OnInit {
  @Input() data: any;
    currentColor:any;

  constructor(private router: Router,private sharedService:DataSharedService) { }

  ngOnInit(): void {
  }
  pageRoute(link: any) {
    if (link) {
      if (link.includes('https:')) {
        window.open(link);
      }else{
        this.router.navigate(['/pages/' + link]);
      }
    }
    if(this.data['appConfigurableEvent'] && this.data['appConfigurableEvent']?.length > 0) {
      let findClickApi = this.data?.appConfigurableEvent?.filter((item: any) => item.actions.some((action: any) => action.method === 'get' && action.actionType == 'api'));
      if(findClickApi){
        this.sharedService.onEventChange(findClickApi);
      }
    }
  }
  linkColor(allow :boolean) {
    if(this.data.link){
      if(allow){
        this.currentColor = this.data.color;
        this.data.color = this.data?.linkHoverColor || 'blue';
      }else{
        this.data.color = this.currentColor;
      }
    }
  }


}
