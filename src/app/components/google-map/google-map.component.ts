import {
  Component
} from '@angular/core';

// import { GoogleMapsService, Maps } from 'src/app/services/google-maps.service.ts';

@Component({
  selector: 'st-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss']
})
export class googleMapComponent {
  mapOptions: google.maps.MapOptions = {
    center: { lat: 38.9987208, lng: -77.2538699 },
    zoom: 14
  }

  marker = {
    position: { lat: 38.9987208, lng: -77.2538699 },
  }
  lat: number = 51.678418;
  lng: number = 7.809007;
  // @ViewChild('search')
  // public searchElementRef: ElementRef;

  // @ViewChild('map')
  // public mapElementRef: ElementRef;



  // public place: google.maps.places.PlaceResult;

  // public locationFields = [
  //   'name',
  //   'cityName',
  //   'stateCode',
  //   'countryName',
  //   'countryCode',
  // ];

  // private map: google.maps.Map;

  constructor() {
    // apiService.api.then((maps) => {
    //   this.initAutocomplete(maps);
    //   this.initMap(maps);
    // });
  }
  // ngAfterViewInit() {
  //   apiService.api.then((maps) => {
  //     this.initAutocomplete(maps);
  //     this.initMap(maps);
  //   });
  // }
  // initAutocomplete(maps: Maps) {
  //  
  //   let autocomplete = new maps.places.Autocomplete(
  //     this.searchElementRef.nativeElement
  //   );
  //   autocomplete.addListener('place_changed', () => {
  //     this.ngZone.run(() => {
  //      
  //       let lat = autocomplete.getPlace()?.geometry?.location?.lat();
  //       let lng = autocomplete.getPlace()?.geometry?.location?.lng();

  //       let center = { lat: lat, lng: lng };
  //       this.mapOptions.center = { lat: Number(lat), lng: Number(lng) }
  //       this.marker.position = { lat: Number(lat), lng: Number(lng) }
  //       this.onPlaceChange(autocomplete.getPlace());
  //     });
  //   });
  // }
  // onPlaceChange(place: google.maps.places.PlaceResult) {
  //  ;

  //   if (place.address_components) {
  //     const streetNumber = place.address_components.find(component => {
  //       return component.types.includes("street_number");
  //     })?.long_name;
  //     const sublocalities = place.address_components.filter(component => {
  //       return component.types.includes("sublocality");
  //     }).map(sublocality => sublocality.long_name);
  //     const streetNumberSublocality = [streetNumber, ...sublocalities].filter(Boolean).join(', ');

  //     this.address = {
  //       street: streetNumberSublocality ? streetNumberSublocality : '',
  //       city: place.address_components.find(component => {
  //         return component.types.includes("locality");
  //       })?.long_name || '', // Provide a default value of an empty string if 'long_name' is undefined
  //       state: place.address_components.find(component => {
  //         return component.types.includes("administrative_area_level_1");
  //       })?.short_name || '', // Provide a default value of an empty string if 'short_name' is undefined
  //       zipcode: place.address_components.find(component => {
  //         return component.types.includes("postal_code");
  //       })?.long_name || '' // Provide a default value of an empty string if 'long_name' is undefined
  //     };

  //   }
  // }

  // initMap(maps: Maps) {
  //   this.map = new maps.Map(this.mapElementRef.nativeElement, {
  //     zoom: 7,
  //   });
  //   this.map.addListener('click', (event: { latLng: google.maps.LatLng; }) => {

  //   });
  // }
  // address = {
  //   street: '',
  //   city: '',
  //   state: '',
  //   zipcode: ''
  // };

  // onSubmit() {
  //   console.log(this.address);
  // }





  // public locationFromPlace(place: google.maps.places.PlaceResult) {
  //   const components = place.address_components;
  //   if (components === undefined) {
  //     return null;
  //   }

  //   // const areaLevel3 = getShort(components, 'administrative_area_level_3');
  //   // const locality = getLong(components, 'locality');

  //   // const cityName = locality || areaLevel3;
  //   // const countryName = getLong(components, 'country');
  //   // const countryCode = getShort(components, 'country');
  //   // const stateCode = getShort(components, 'administrative_area_level_1');
  //   // const name = place.name !== cityName ? place.name : null;

  //   const coordinates = {
  //     latitude: place.geometry.location.lat(),
  //     longitude: place.geometry.location.lng(),
  //   };

  //   const bounds = place.geometry.viewport.toJSON();

  //   // placeId is in place.place_id, if needed
  //   return {
  //     name,
  //     cityName,
  //     countryName,
  //     countryCode,
  //     stateCode,
  //     bounds,
  //     coordinates,
  //   };
  // }
}






namespace cosmos {
  export interface Coordinates {
    /**
     * Coordinates latitude.
     * @type {number}
     */
    latitude: number;
    /**
     * Coordinates longitude.
     * @type {number}
     */
    longitude: number;
  }
  export interface LatLngBoundsLiteral {
    /**
     * LatLngBoundsLiteral east.
     * @type {number}
     */
    east: number;
    /**
     * LatLngBoundsLiteral north.
     * @type {number}
     */
    north: number;
    /**
     * LatLngBoundsLiteral south.
     * @type {number}
     */
    south: number;
    /**
     * LatLngBoundsLiteral west.
     * @type {number}
     */
    west: number;
  }

}
