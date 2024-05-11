import { ChangeDetectorRef, Component, ElementRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'st-carousel-crossfade-card',
  templateUrl: './carousel-crossfade-card.component.html',
  styleUrls: ['./carousel-crossfade-card.component.scss']
})
export class CarouselCrossfadeCardComponent implements OnInit {

  @Input() carouselslides:any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  constructor() { }

  ngOnInit(): void {

  }

}
