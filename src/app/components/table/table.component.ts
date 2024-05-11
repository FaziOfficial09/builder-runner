import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'st-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() gridData:any;
  // listOfSelection = [
  //   {
  //     text: 'Select All Row',
  //     onSelect: () => {
  //       this.onAllChecked(true);
  //     }
  //   },
  //   {
  //     text: 'Select Odd Row',
  //     onSelect: () => {
  //       this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 !== 0));
  //       this.refreshCheckedStatus();
  //     }
  //   },
  //   {
  //     text: 'Select Even Row',
  //     onSelect: () => {
  //       this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 === 0));
  //       this.refreshCheckedStatus();
  //     }
  //   }
  // ];
  // checked = false;
  // indeterminate = false;
  // listOfCurrentPageData: readonly any[] = [];
  // setOfCheckedId = new Set<number>();
  i = 200;
  // editId: string | null = null;
  // listOfData: any = [];

  // startEdit(id: string): void {
  //   this.editId = id;
  // }

  // stopEdit(): void {
  //   this.editId = null;
  // }

  addRow(): void {
    this.listOfData = [
      ...this.listOfData,
      {
        id: `${this.i}`,
        name: `Edward King ${this.i}`,
        age: '32',
        address: `London, Park Lane no. ${this.i}`
      }
    ];
    this.i++;
  }

  deleteRow(id: string): void {
    this.listOfData = this.listOfData.filter((d:any) => d.id !== id);
  }

  // ngOnInit(): void {
  //   this.addRow();
  //   this.addRow();
  // }
  // onAllChecked(value: boolean): void {
  //
  //   this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.id, value));
  //   this.refreshCheckedStatus();
  // }
  // updateCheckedSet(id: number, checked: boolean): void {
  //   if (checked) {
  //     this.setOfCheckedId.add(id);
  //   } else {
  //     this.setOfCheckedId.delete(id);
  //   }
  // }
  // refreshCheckedStatus(): void {
  //
  //   this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
  //   this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  // }
  // onItemChecked(id: number, checked: boolean): void {
  //   this.updateCheckedSet(id, checked);
  //   this.refreshCheckedStatus();
  // }
  // onCurrentPageDataChange($event: any): void {
  //   this.listOfCurrentPageData = $event;
  //   this.refreshCheckedStatus();
  // }
  // // currentPageDataChange($event: readonly ItemData[]): void {
  // //   this.displayData = $event;
  // //   this.refreshStatus();
  // // }

  listOfSelection = [
    {
      text: 'Select All Row',
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
    {
      text: 'Select Odd Row',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 !== 0));
        this.refreshCheckedStatus();
      }
    },
    {
      text: 'Select Even Row',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) => this.updateCheckedSet(data.id, index % 2 === 0));
        this.refreshCheckedStatus();
      }
    }
  ];
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly any[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  ngOnInit(): void {
    this.listOfData = new Array(200).fill(0).map((_, index) => ({
      id: index,
      name: `Edward King ${index}`,
      age: 32,
      address: `London, Park Lane no. ${index}`
    }));
  }
}
