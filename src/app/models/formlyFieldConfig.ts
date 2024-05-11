import { Type } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

export class FormlyFieldConfig {
    type?: string;
    formCheck?:string;
    props?:any;
    label?: string;
    multiselect?: string;
    placeholder?: string;
    tooltip?: any;
    disabled?: boolean;
    options?: any;
    rows?: number;
    cols?: number;
    description?: string;
    btngroupformat?: string;
    hidden?: boolean;
    max?: number;
    min?: number;
    minLength?: number;
    maxLength?: number;
    labelColor?:string;
    labelBackgroundColor?:string;
    pattern?: string | RegExp;
    required?: boolean;
    multiApi?:string;
    tabindex?: number;
    readonly?: boolean;
    wrappers?: (string | Type<FieldWrapper>)[];
}