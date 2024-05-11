import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @Input() avatarData : any;
  gap = 60;
  constructor() { }

  ngOnInit(): void {
  }

  handleAvatarError(event: Event) {
    event.preventDefault();
    console.log('An error occurred while loading the image: ', event);
  }

}
