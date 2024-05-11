import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'st-accordion-button',
  templateUrl: './accordion-button.component.html',
  styleUrls: ['./accordion-button.component.scss']
})
export class AccordionButtonComponent implements OnInit {
  current = {
    // '--background': 'green',
  }
  @Input() accordionData: any;
  @Input() mappingId: any;
  @Input() formlyModel: any;
  @Input() form: any;
  @Input() screenName: any;
  @Input() screenId: any;
  expandIconPosition: any = "left";
  expand: any = false;
  accordingListData: any[] = [];
  selectColor: 'red !important';
  @Output() accordingEmit: EventEmitter<any> = new EventEmitter();
  constructor() {
    this.processData = this.processData.bind(this);
  }
  ngOnInit(): void {
    if (this.mappingId && this.accordionData?.eventActionconfig && Object.keys(this.accordionData.eventActionconfig).length > 0) {
      this.accordionData.eventActionconfig['parentId'] = this.mappingId;
    }
    if(this.accordionData.mappingProperty){
      this.mappingId = this.accordionData.mappingProperty ? this.accordionData[this.accordionData.mappingProperty] : null;
    }
  }
  submit() {
    // this.commonChartService.submit();
  }
  handleIndexChange(e: number): void {
    console.log(e);
  }
  onClose(): void {
    console.log('tag was closed.');
  }
  accordionCollapse() {
    this.expand = !this.expand;
  }
  processData(data: any) {
    if (data?.data.length > 0) {
      let obj = {
        data: data?.data,
        screenData: this.accordionData
      }
      this.accordingEmit.emit(obj);
      //  data.map(element => {
      //   const according = JSON.parse(JSON.stringify(this.accordionData));

      //   // Format weekStartDate
      //   const startDate = new Date(element.weekStartDate);
      //   const formattedStartDate = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      //   // Format weekEndDate
      //   const endDate = new Date(element.weekEndDate);
      //   const formattedEndDate = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      //   const newTitle = `${element?.week} ${formattedStartDate} -  ${formattedEndDate}`;
      //   let tableData = this.findObjectByTypeBase(according, "gridList");
      //   if (tableData) {
      //     const getGridUpdateData = this.getFromQuery(element.issues, tableData);
      //     this.accordionData.children = [getGridUpdateData];
      //   }
      //   this.accordionData.title = newTitle;
      //   return according;
      // });
    }
    return data
  }
  findObjectByTypeBase(data: any, type: any) {
    if (data) {
      if (data.type && type) {
        if (data.type === type) {
          return data;
        }
        if (data.children.length > 0) {
          for (let child of data.children) {
            let result: any = this.findObjectByTypeBase(child, type);
            if (result !== null) {
              return result;
            }
          }
        }
        return null;
      }
    }
  }
  getFromQuery(res: any, tableData: any) {
    if (tableData && res) {
      if (res.length > 0) {
        const requiredData = res.map(({ __v, _id, ...rest }: any) => ({
          id: _id,
          ...rest,

        }));
        res = requiredData;
        let saveForm = JSON.parse(JSON.stringify(res[0]));
        const firstObjectKeys = Object.keys(saveForm);
        let tableKey = firstObjectKeys.map(key => ({ name: key }));
        let obj = firstObjectKeys.map(key => ({ name: key, key: key }));
        tableData.tableData = [];
        saveForm.id = tableData.tableData.length + 1;
        res.forEach((element: any) => {
          element.id = (element?.id)?.toString();
          tableData.tableData?.push(element);
        });
        // pagniation work start
        if (!tableData.end) {
          tableData.end = 10;
        }
        tableData.pageIndex = 1;
        tableData.totalCount = res.count ? res.count : res.length;
        tableData.serverApi = '';
        tableData.targetId = '';
        tableData.displayData = tableData.tableData.length > tableData.end ? tableData.tableData.slice(0, tableData.end) : tableData.tableData;
        // pagniation work end
        if (tableData.tableHeaders.length == 0) {
          tableData.tableHeaders = obj;
          tableData['tableKey'] = tableKey
        }
        else {
          if (JSON.stringify(tableData['tableKey']) !== JSON.stringify(tableKey)) {
            const updatedData = tableKey.filter(updatedItem =>
              !tableData.tableHeaders.some((headerItem: any) => headerItem.name === updatedItem.name)
            );
            if (updatedData.length > 0) {
              updatedData.forEach(updatedItem => {
                tableData.tableHeaders.push({ id: tableData.tableHeaders.length + 1, key: updatedItem.name, name: updatedItem.name, });
              });
              tableData['tableKey'] = tableData.tableHeaders;
            }
          }
        }
      }
      return tableData;
    }
  }
}


