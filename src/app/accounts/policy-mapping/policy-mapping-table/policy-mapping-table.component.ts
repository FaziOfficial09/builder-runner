import { Component, Input } from '@angular/core';

@Component({
  selector: 'st-policy-mapping-table',
  templateUrl: './policy-mapping-table.component.html',
  styleUrls: ['./policy-mapping-table.component.scss']
})
export class PolicyMappingTableComponent {
  @Input() menuOfDisplayData: any;
  @Input() loading: any;
  @Input() pageSize: any;
  @Input() listOfColumns: any;
  @Input() startIndex: any;
  @Input() data: any[] = [];

  ngOnInit(): void {
    // const checkMenu = this.data?.find((a: any) => a.sqlType == "sql");
    // if(checkMenu){
    //   this.listOfColumns = this.actionColumns;
    // }
  }

  actionColumns = [
    { name: 'Expand', dataField: 'expand', inVisible: false ,  isColumnHide:true},
    {
      name: 'Action Name', dataField: 'quryType', inVisible: true , isColumnHide:false
    },
    {
      name: 'Is Allow', dataField: 'isAllow', inVisible: true , isColumnHide:false
    }
  ];
  search(event: any, column: any): void {
    const inputValue = event?.target ? event.target.value?.toLowerCase() : event?.toLowerCase() ?? '';
    if (inputValue) {
      this.data = this.menuOfDisplayData.filter((item: any) => {
        const { key } = column;
        const { [key]: itemName } = item || {}; // Check if item is undefined, set to empty object if so
        return itemName?.toLowerCase()?.includes(inputValue); // Check if itemName is undefined or null
      });
    } else {
      this.data = this.menuOfDisplayData;
    }
  }

}
