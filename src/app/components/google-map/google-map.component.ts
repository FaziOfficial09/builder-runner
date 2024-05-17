import {
  Component, Input
} from '@angular/core';

// import { GoogleMapsService, Maps } from 'src/app/services/google-maps.service.ts';

@Component({
  selector: 'st-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class googleMapComponent {
  @Input()  item:any
  constructor() { }
  ngOnInit(): void { }
  center: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12
  };
  zoom = 4;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };
  markerPositions: google.maps.LatLngLiteral[] = [];
  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.markerPositions.push(event.latLng.toJSON());
  }
}








