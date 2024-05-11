import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {
  @Input() videoData: any;
  videolist: any;
  
  src: any;

  ngOnInit(): void {
    this.videoData;
  }

  // videodata() {
  //   this.employeeService.videodata().subscribe((res => {

  //     this.videolist = res;
  //   }));
  // }


}
