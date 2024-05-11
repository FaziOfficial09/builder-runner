import { props } from "./templateOptions";

export interface formlyConfig {
  fieldGroup:formDetail;

  }

  export interface formDetail{
    key?: string;
    className?:string;
    type?: string;
    defaultValue?: string;
    expressionProperties?: string,
    hideExpression?: string,
    btnClass?: string,
    size?: string,
    props?: props;
  }
