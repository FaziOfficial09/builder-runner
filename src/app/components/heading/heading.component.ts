import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'st-heading',
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss']
})
export class HeadingComponent implements OnInit {
  @Input() headingData: any;
  constructor(private router: Router) {
    this.processData = this.processData.bind(this);
  }

  ngOnInit(): void {

  }

  pageRoute(link: any) {
    if (link) {
      this.router.navigate(['/pages/' + link]);
    }
  }
  processData(data: any) {
      
    console.log('heading');
    for(const key in data?.data?.[0]){
      this.headingData.text = data?.data?.[0][key];
    }
    return data
  }
}
