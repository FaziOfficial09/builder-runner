import { Component, Input, Output } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'st-downloadbutton',
  templateUrl: './downloadbutton.component.html',
  styleUrls: ['./downloadbutton.component.scss']
})
export class DownloadbuttonComponent {
  @Input() buttonData: any;
  @Input() title: any;
  @Input() tableRowId: any;
  @Input() softIconList: any;
  @Input() screenId: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() mappingId: any;
  @Input() path: any;
  // @Output() notify: EventEmitter<any> = new EventEmitter();
  bgColor: any;
  hoverTextColor: any;
  dataSrc: any;
  isShow: Boolean = false;
  color: "hover:bg-[#000000]";
  borderColor: any;
  isVisible = false;
  saveHoverIconColor: any;
  hoverOpacity = '';
  nodes: any[] = [];
  responseData: any;
  loader: boolean = false;
  requestSubscription: Subscription;

  constructor(private toastr: NzMessageService,) {

  }
  ngOnInit(): void {
    this.hoverTextColor = this.buttonData?.textColor ? this.buttonData?.textColor : '';
    this.bgColor = this.buttonData?.color ? this.buttonData?.color : '';
  }

  handleButtonMouseOver(buttonData: any): void {
    this.hoverOpacity = '1';
    this.bgColor = buttonData.hoverColor || '';
    this.hoverTextColor = buttonData.hoverTextColor || '';
    this.borderColor = buttonData.hoverBorderColor || '';
    this.saveHoverIconColor = buttonData['iconColor'];
    buttonData['iconColor'] = buttonData['hoverIconColor'];
  }

  handleButtonMouseOut(buttonData: any): void {
    this.hoverOpacity = '';
    buttonData['iconColor'] = this.saveHoverIconColor;
    this.bgColor = buttonData.color || '';
    this.hoverTextColor = buttonData.textColor || '';
    this.borderColor = buttonData.borderColor || '';
  }

  hoverStyle(data: any, mouseOver: any): void {
    if (mouseOver) {
      this.buttonData.dropdownOptions.forEach((option: any) => option.label == data.label ? option['hover'] = true : option['hover'] = false);
    } else {
      this.buttonData.dropdownOptions.forEach((option: any) => option['hover'] = false);
    }
  }

  handleButtonClick(buttonData: any) {

  }

  downloadReport(buttonData: any) {
    try {
      ;
      if (this.path || this.path == 'N/A') {
        if (this.path == 'N/A') {
          this.toastr.warning('Request is not approved!', {
            nzDuration: 3000,
          });
          return;
        }
        const pdfFileUrl = this.path;
        if (pdfFileUrl.includes('.pdf')) {
          // Create an anchor element
          const anchor = document.createElement('a');
          anchor.href = pdfFileUrl;
          anchor.target = '_blank'; // Open in a new tab/window
          anchor.download = 'file.pdf'; // Set the download attribute

          // Simulate a click on the anchor
          anchor.click();
        }
      } 
      else if (buttonData.path) {
        if (buttonData?.path.includes('.pdf')) {
          // Create an anchor element
          const anchor = document.createElement('a');
          anchor.href = buttonData.path;
          anchor.target = '_blank'; // Open in a new tab/window
          anchor.download = 'file.pdf'; // Set the download attribute

          // Simulate a click on the anchor
          anchor.click();
        } else {
          window.open(buttonData?.path, '_blank');
        }
      } else {
        this.toastr.warning('Path did not exist', {
          nzDuration: 3000,
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      this.toastr.error('An error occurred while downloading the file', {
        nzDuration: 3000,
      });
    }
  }

}
