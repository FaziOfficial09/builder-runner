import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';
import { Guid } from '../models/guid';
@Component({
  selector: 'nz-demo-table-edit-cell',
  template: `
    <!-- <nz-collapse >
    <nz-collapse-panel [nzHeader]="'Common  Attribute value'" [nzActive]="true">
    <dynamic-table *ngIf='this.formData.length' [tableId]='tableId' [checkType]='true' [tableData]='this.formData' [tableHeaders]='tableHeader' [data]="data" [displayData]="this.formData" [configurationTable]="true"></dynamic-table>
    </nz-collapse-panel>
  </nz-collapse> -->

  <dynamic-table class="config-table" *ngIf='this.formData.length' [tableId]='tableId' [checkType]='true' [tableData]='this.formData' [tableHeaders]='tableHeader' [data]="data" [displayData]="this.formData" [configurationTable]="true"></dynamic-table>

  `,
})
export class formlyRepeatSectionComponent extends FieldArrayType {
  tableId: any = "";
  formData: any = "";
  tableHeader: any = [];
  data: any = {};
  tableKey: any = {};
  ngOnInit(): void {
    this.tableId = this.field.key + Guid.newGuid();
    const key = Array.isArray(this.field.key) ? this.field.key[0] : this.field.key;
    if (key) {
      this.formData = this.form.value[key];
    }
    if (this.formData && this.formData?.length > 0) {
      if (!this.formData[0].id) {
        let newId = 0;
        this.formData = this.formData.map((j: any) => {
          newId++;
          return {
            id: newId,
            ...j,
          };
        });
      }
      const firstObjectKeys = Object.keys(this.formData[0]);
      // this.tableHeader = firstObjectKeys.map(key => ({ name: key }));
      let newFieldGroup: any = this.field?.fieldArray;
      if (newFieldGroup?.fieldGroup) {
        const headerDataArray: any[] = [];

        newFieldGroup?.fieldGroup.forEach((head: any) => {
          const headerData: any = {};
          headerData['dataType'] = head.type;
          headerData['title'] = head.props.label;
          headerData['name'] = head.key;
          headerData['key'] = head.key;
          if(!headerData.key.includes('_list')){
            headerDataArray.push(headerData);
          }
        });
        this.tableHeader = headerDataArray;
        let keyObj = {
          'dataType' : 'input', 
          'title' : 'Id', 
          'name' : 'id', 
          'key' : 'id', 
        }
        this.tableHeader.unshift(keyObj);
        this.data['tableKey'] = this.tableHeader
        // this.tableKey = headerDataArray;
        // headerDataArray now contains data for each head in fieldGroup
      }

    }
  }
}

