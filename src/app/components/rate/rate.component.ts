import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'st-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.scss']
})
export class RateComponent implements OnChanges {
  @Input() rateData: any;
  constructor(public dataSharedService: DataSharedService,
    private cd: ChangeDetectorRef) {
    this.processData = this.processData.bind(this);
  }
  ngOnChanges(changes: any) {
    document.documentElement.style.setProperty('--my-color', this.rateData.iconColor != '' ? this.rateData.iconColor : 'yellow');
    document.documentElement.style.setProperty('--rateSpacing', (this.rateData.spacing ? this.rateData.spacing : 8) + 'px');
  }
  ngOnInit(): void {
    document.documentElement.style.setProperty('--my-color', this.rateData.iconColor);
    document.documentElement.style.setProperty('--rateSpacing', (this.rateData.spacing ? this.rateData.spacing : 8) + 'px');
  }
  onRateBlur() {
    // console.log('Rate component blurred');
  }
  onRateFocus() {
    // console.log('Rate component focused');
  }
  onRateHoverChange(value: number) {
    document.documentElement.style.setProperty('--my-color', this.rateData.iconColor);
    // console.log(`Rate component hover changed to ${value}`);
  }
  onRateKeyDown(event: KeyboardEvent) {
    // console.log(`Key ${event.key} pressed on Rate component`);
  }
  processData(res: any) {
    if (res?.data.length > 0) {
      this.rateData.options = res?.data.map(
        (option: any) => option.label
      );
    } else if (res?.data.length == 0) {
      this.rateData.options = [];
    }
    return res;
  }

}
