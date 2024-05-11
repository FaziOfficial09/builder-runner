
export interface Property {
    id: number;
    feildName: string;
    type: string;
    Label: string;
}

export interface Option {
    label: string;
    value: string;
}

export interface props {
    label: string;
    required: boolean;
    placeholder: string;
    rows?: number;
    options: Option[];
}

export interface FieldGroup {
    className: string;
    key: string;
    type: string;
    props: props;
    defaultValue: string;
}

export interface FormSchema {
    className: string;
    template: string;
    fieldGroupClassName: string;
    fieldGroup: FieldGroup[];
}

export interface Option2 {
    label: string;
    value: string;
}

export interface props2 {
    label: string;
    required: boolean;
    placeholder: string;
    options: Option2[];
}

export interface FieldGroup2 {
    className: string;
    key: string;
    type: string;
    props: props2;
    defaultValue: string;
}

export interface Griddata {
    fieldGroupClassName: string;
    fieldGroup: FieldGroup2[];
    className: string;
    template: string;
}

export interface Option3 {
    label: string;
    value: string;
}

export interface props3 {
    label: string;
    required: boolean;
    placeholder: string;
    options: Option3[];
}

export interface FieldGroup3 {
    className: string;
    key: string;
    type: string;
    props: props3;
    defaultValue: string;
}

export interface Eventsdata {
    fieldGroupClassName: string;
    fieldGroup: FieldGroup3[];
    className: string;
    template: string;
}

export interface props4 {
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
}

export interface FormSchemaw {
    key: string;
    type: string;
    wrappers: string[];
    props: props4;
    className: string;
    template: string;
}

export interface RootObject {
    id: string;
    title: string;
    form_Data: string;
    grid_Data: string;
    events: string;
    properties: Property[];
    form_schema: FormSchema[];
    griddata: Griddata[];
    eventsdata: Eventsdata[];
    form_schemaw: FormSchemaw[];
}
