import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'st-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  @Input() accordionData: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  @Input() mappingId: any;
  expandIconPosition: any = "left";
  expand: any = false;
  accordingListData: any[] = [];
  @Output() accordingEmit: EventEmitter<any> = new EventEmitter();

  contactList: any[] = []
  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {
    debugger
  }
  processData(data: any) {
    this.contactList = data.data;
    console.log(data)
    // if (data?.data.length > 0) {
    //   let obj = {
    //     data: data?.data,
    //     screenData: this.accordionData
    //   }
    //   this.accordingEmit.emit(obj);
    // }
    return data
  }

  //For Drwaer Form
  isSubmit: boolean = true;
  isVisible: boolean = false;
  options: FormlyFormOptions = {};
  model: any = {};
  handleCancel(): void {
    this.isVisible = false;
  }
  openModal() {
    this.isVisible = true;
  }
  submit() {
  }
  fields = [
    {
      fieldGroup: [
        {
          key: 'name',
          type: 'input',
          wrappers: ['formly-vertical-theme-wrapper'],
          defaultValue: '',
          props: {
            label: 'Name',
            placeholder: 'Enter Name...',
            required: true,
          },
        },
      ],
    },
    {
      fieldGroup: [
        {
          key: 'email',
          type: 'input',
          wrappers: ['formly-vertical-theme-wrapper'],
          defaultValue: '',
          props: {
            label: 'Email',
            placeholder: 'Enter Email...',
            required: true,
          },
        },
      ],
    },
    {
      fieldGroup: [
        {
          key: 'designation',
          type: 'input',
          wrappers: ['formly-vertical-theme-wrapper'],
          defaultValue: '',
          props: {
            label: 'Designation',
            placeholder: 'Enter Designation...',
            required: false,
          },
        },
      ],
    },
  ];
}
