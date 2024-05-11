import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { DataSharedService } from 'src/app/services/data-shared.service';

@Component({
  selector: 'st-dynamic-table-repeat-section',
  templateUrl: './dynamic-table-repeat-section.component.html',
  styleUrls: ['./dynamic-table-repeat-section.component.scss']
})
export class DynamicTableRepeatSectionComponent implements OnInit {

  @Input() tableId: any;
  @Input() tableData: any;
  @Input() tableHeaders: any[];
  @Input() data: any;
  editId: string | null = null;
  @Output() notifyTable: EventEmitter<any> = new EventEmitter();
  key: any;
  childKey: any;
  allChecked = false;
  indeterminate = false;
  scrollX: string | null = null;
  scrollY: string | null = null;
  constructor(private _dataSharedService: DataSharedService,) { }

  ngOnInit(): void {
    this.loadTableData();
  }
  isVisible = false;
  addColumn(): void {
    this.isVisible = true;
  };

  addRow(): void {
    const id = this.tableData.length - 1;
    const newRow = JSON.parse(JSON.stringify(this.tableData[0]));
    newRow["id"] = this.tableData[id].id + 1;
    this.tableData = [...this.tableData, newRow];
  };
  deleteRow(id: string): void {
    this.tableData = this.tableData.filter((d: any) => d.id !== id);
  };
  startEdit(id: string): void {
    this.editId = id;
  }
  stopEdit(): void {
    this.editId = null;
  }
  loadTableData() {
    if (this.tableData.length > 0) {
      const firstObjectKeys = Object.keys(this.tableData[0]);
      this.key = firstObjectKeys.map(key => ({ name: key }));
      if (!this.tableHeaders) {
        this.tableHeaders = this.key;
      }
      let newId = 0;
      if (!this.tableData[0].id) {
        this.tableData.forEach((j: any) => {
          newId = newId + 1
          j['id'] = newId;
        });
      }
    }
    if (!this.data) {
      const newNode = {
        nzFooter: "",
        nzTitle: "",
        nzPaginationPosition: "bottom",
        nzPaginationType: "default",
        nzLoading: false,
        nzFrontPagination: true,
        nzShowPagination: true,
        nzBordered: true,
        showColumnHeader: true,
        noResult: false,
        nzSimple: false,
        nzSize: 'default',
        nzShowSizeChanger: false,
        showCheckbox: false,
        expandable: false,
        fixHeader: false,
        tableScroll: false,
        fixedColumn: false,
        sort: true,
        filter: true,
      }
      this.data = newNode;
    }
  }
  save() {
    this._dataSharedService.setData(this.tableData);
    alert("Data save");
  }
}
