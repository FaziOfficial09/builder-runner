import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'st-parent-calendar',
  templateUrl: './parent-calendar.component.html',
  styleUrls: ['./parent-calendar.component.scss']
})
export class ParentCalendarComponent {
  @Input() item: any;
  @Input() screenName: any;
  @Input() mappingId: any;
  @Input() screenId: any;
  @Input() form: any;
  @Input() formlyModel: any;
  dataGet = false
  loader = false;
  showSimple: boolean = false
  constructor(private changeDetector: ChangeDetectorRef,
    private toastr: NzMessageService
  ) {
    this.processData = this.processData.bind(this);
  }
  ngOnInit() {
    debugger
    this.dataGet = false;
    if (this.item?.eventActionconfig && Object.keys(this.item.eventActionconfig).length > 0) {
      this.item?.eventActionconfig
      this.loader = true;
    } else {
      this.loader = false;
      this.showSimple = true;
    }
  }
  processData(data: any) {

    try {
      this.dataGet = false;
      if (data?.data.length > 0) {
        this.item.options = [];
        data?.data.forEach((element: any) => {
          let event = {
            "id": element.id, // Increment the index to start from 1
            "title": element.message,
            "start": this.extractDate(element.datetime),
            "backgroundColor": "#fbe0e0",
            "textColor": "#ea5455",
            "color": "#EF6C00",
            "borderColor": "#ea5455"
          };
          this.item.options.push(event);
        });
        let newData = JSON.parse(JSON.stringify(this.item.options));
        this.item.options = JSON.parse(JSON.stringify(newData));
        let newItem = JSON.parse(JSON.stringify(this.item));
        this.item = JSON.parse(JSON.stringify(newItem));
        this.loader = false;
      } else {
        this.loader = false;
      }
      this.dataGet = true;
      this.changeDetector.detectChanges();
      return data;
    } catch (error) {
      this.loader = false;
      // Handle the error, log it, or perform any necessary actions
      console.error('An error occurred in processData:', error);
      this.toastr.error('Error' + error, {
        nzDuration: 3000,
      });
      return data;
    }
  }

  extractDate(date: any) {
    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Add 1 to the month because it's zero-based
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

