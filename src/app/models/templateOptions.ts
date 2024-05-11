export interface props {
    label?: string;
    placeholder?: string,
    required?: false,
    options?: SelectOption[],
    btnClass?: string,
    size?: string,
    type?:string,
  }


export interface SelectOption{
  label?:string,
  value?:string,
}
