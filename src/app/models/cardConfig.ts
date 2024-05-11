import { FormlyFieldConfig } from "@ngx-formly/core";
import { btnGroup } from "./btnConfig";
import { gridConfig } from "./gridConfig";


export interface builderConfig {
  colValue?: string;
  title?: string;
  total?: string;
  bgColor?: string;
  textColor?: string,
  description?: string,
  percentage?: string,
  heading?: string,
  price?: string,
  subheading?: string,
  defaultfilter?: string,
  refundsChart?: any,
  filters?: any,
  Chart?: any,
  styleConfig?: any,
  chart?: any,
  firstColData?: any,
  seconColData?: any,
  thirdColData?: any,
  section?: any,
  chartTitlesValues?: any,
  chartFilterData?: any,
  plotOptions?: any,
  dataLabels?: any,
  series?: any,
  labels?: any,
  colors?: any,
  legend?: any,
  stroke?: any,
  fill?: any,
  markers?: any,
  xaxis?: any,
  yaxis?: any,
  tooltip?: any,
  grid?: any,
  key?: string;
  type?: string;
  icon?: string,
  name?: string,
  className?: string,
  min?: string,
  max?: string,
  bar?: string,
  label?: string,
  labelIcon?: string,
  headingIcon?: string,
  subHeading?: string,
  subHeadingIcon?: string,
  subheadingColor?: string,
  id?: string,
  link?: string,
  limit?: number,
  belowpercentage?: number,
  belowpercentageColor?: string,
  numberofcolumns?: string,
  defaultColor?: string,
  firstTitle?: string,
  firstValue?: string,
  secondTitle?: string,
  secondValue?: string,
  thirdLabel?: string,
  thirdValue?: string,
  thisTitle?: string,
  thisValue?: string,
  lastTitle?: string,
  lastValue?: string,
  prevTitle?: string,
  prevValue?: string,
  growth?: string,
  value?: string,
  style?: string,
  textAlign?: string,
  headingColor?: string,
  headingApi?: string,
  fontSize?: string,
  color?: string,
  text?: string,
  api?: string,
  level?: number,
  data?: any,
  switchConfig?: any,
  uploadBtnLabel?: any,
  progressBArConfig?: any,
  videoConfig?: any,
  calenderConfig?: any,
  sharedMessagesConfig?: any,
  alertConfig?: any,
  simpleCardWithHeaderBodyFooterConfig?: any,
  mainDashonicTabsConfig?: any,
  dashonicTabsConfig?: any,
  dropdownConfig?: any,
  pageConfig?: any,
  carousalConfig?: any,
  carousalType?: any,
  buttonsConfig?: any,
  bootstrapTabsConfig?: any,
  timelineConfig?: any,
  dividerConfig?: any,
  fixedDivConfig?: any,
  fixedDivChild?: any,
  accordionConfig?: any,
  kambanChildren?: any,
  nodes?: any,
  chartCardConfig?: builderConfig[]
  formly?: FormlyFieldConfig[],
  buttonGroup?: btnGroup[],
  users?: any,
  getVariable?: string,
  setVariable?: string,
  date?: string;
  content?: string;
  status?: string;
  variant?: string;
  position?: string;
  btngroupformat?: string;
  btnGroupPosition?: string;
  lineColorForStyle?: string;
  textcolorForStyle?: string;
  gridList?: gridConfig[],
  mainDashonicTabsChild?: any
  audioSrc?: any
}