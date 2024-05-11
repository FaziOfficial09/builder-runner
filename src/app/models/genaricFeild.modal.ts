import { FormlyFieldConfig } from "@ngx-formly/core";

export class GenaricFeild {
  title?: string;
  formData?: FormlyFieldConfig[]
  commonData?: any
  mappingConfig?: FormlyFieldConfig[]
  type: string;
  modelData: any;
  mappingNode: any;

  constructor(data: any) {
    this.commonData = data.commonData;
    this.formData = data.formData;
    this.title = data.title;
    this.type = data.type;
    this.modelData = data.modelData;
    this.mappingConfig = data.mappingConfig;
    this.mappingNode = data.mappingNode;
  }
}
